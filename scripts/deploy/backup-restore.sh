#!/bin/bash

# Finance Tracker Backup & Restore Script
# 데이터베이스 및 중요 데이터 백업/복원 스크립트

set -e

# 색상 출력을 위한 변수
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 설정
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
CONTAINER_NAME="finance-postgres"

# 로깅 함수
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 환경 변수 로드
load_env() {
    if [ -f ".env.production" ]; then
        source .env.production
    else
        log_error ".env.production 파일을 찾을 수 없습니다."
        exit 1
    fi
}

# 백업 디렉토리 생성
create_backup_dir() {
    mkdir -p "$BACKUP_DIR"
    log_info "백업 디렉토리: $BACKUP_DIR"
}

# 데이터베이스 백업
backup_database() {
    log_info "데이터베이스 백업 시작..."
    
    BACKUP_FILE="$BACKUP_DIR/db_backup_$DATE.sql"
    
    # PostgreSQL 덤프 생성
    docker exec $CONTAINER_NAME pg_dump \
        -U "${POSTGRES_USER}" \
        -d "${POSTGRES_DB}" \
        --clean --if-exists --create \
        --format=custom \
        --verbose > "$BACKUP_FILE.custom"
    
    # 텍스트 형태 백업도 생성 (가독성)
    docker exec $CONTAINER_NAME pg_dump \
        -U "${POSTGRES_USER}" \
        -d "${POSTGRES_DB}" \
        --clean --if-exists --create \
        --format=plain > "$BACKUP_FILE"
    
    # 압축
    gzip "$BACKUP_FILE"
    
    log_success "데이터베이스 백업 완료: $BACKUP_FILE.gz"
}

# Redis 백업
backup_redis() {
    log_info "Redis 백업 시작..."
    
    REDIS_BACKUP_FILE="$BACKUP_DIR/redis_backup_$DATE.rdb"
    
    # Redis SAVE 명령어로 스냅샷 생성
    docker exec finance-redis redis-cli --rdb "$REDIS_BACKUP_FILE"
    
    # 컨테이너에서 호스트로 파일 복사
    docker cp finance-redis:"$REDIS_BACKUP_FILE" "$REDIS_BACKUP_FILE"
    
    log_success "Redis 백업 완료: $REDIS_BACKUP_FILE"
}

# 볼륨 백업
backup_volumes() {
    log_info "Docker 볼륨 백업 시작..."
    
    VOLUMES_BACKUP_DIR="$BACKUP_DIR/volumes_$DATE"
    mkdir -p "$VOLUMES_BACKUP_DIR"
    
    # 중요 볼륨들 백업
    volumes=("grafana_data" "prometheus_data" "elasticsearch_data")
    
    for volume in "${volumes[@]}"; do
        log_info "$volume 백업 중..."
        docker run --rm \
            -v "${volume}:/source" \
            -v "$(pwd)/$VOLUMES_BACKUP_DIR:/backup" \
            alpine \
            tar czf "/backup/${volume}_$DATE.tar.gz" -C /source .
        
        log_success "$volume 백업 완료"
    done
}

# 설정 파일 백업
backup_configs() {
    log_info "설정 파일 백업 시작..."
    
    CONFIG_BACKUP_DIR="$BACKUP_DIR/configs_$DATE"
    mkdir -p "$CONFIG_BACKUP_DIR"
    
    # 중요 설정 파일들 복사
    config_files=(
        ".env.production"
        "docker-compose.production.yml"
        "monitoring/"
        "nginx/"
        "scripts/"
    )
    
    for config in "${config_files[@]}"; do
        if [ -e "$config" ]; then
            cp -r "$config" "$CONFIG_BACKUP_DIR/"
            log_info "$config 백업 완료"
        fi
    done
    
    # 백업 압축
    tar czf "$CONFIG_BACKUP_DIR.tar.gz" -C "$BACKUP_DIR" "configs_$DATE"
    rm -rf "$CONFIG_BACKUP_DIR"
    
    log_success "설정 파일 백업 완료: $CONFIG_BACKUP_DIR.tar.gz"
}

# 전체 백업
full_backup() {
    log_info "전체 백업 시작..."
    
    create_backup_dir
    backup_database
    backup_redis
    backup_volumes
    backup_configs
    
    # 백업 메타데이터 생성
    METADATA_FILE="$BACKUP_DIR/backup_metadata_$DATE.json"
    cat > "$METADATA_FILE" << EOF
{
    "backup_date": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "backup_type": "full",
    "database_backup": "db_backup_$DATE.sql.gz",
    "redis_backup": "redis_backup_$DATE.rdb",
    "volumes_backup": "volumes_$DATE/",
    "configs_backup": "configs_$DATE.tar.gz",
    "postgres_version": "$(docker exec $CONTAINER_NAME psql -U ${POSTGRES_USER} -d ${POSTGRES_DB} -c 'SELECT version();' -t | head -1 | xargs)",
    "redis_version": "$(docker exec finance-redis redis-cli INFO server | grep redis_version | cut -d: -f2 | tr -d '\r')"
}
EOF
    
    log_success "전체 백업 완료! 백업 디렉토리: $BACKUP_DIR"
}

# 데이터베이스 복원
restore_database() {
    local backup_file="$1"
    
    if [ ! -f "$backup_file" ]; then
        log_error "백업 파일을 찾을 수 없습니다: $backup_file"
        exit 1
    fi
    
    log_warning "데이터베이스 복원을 진행합니다. 기존 데이터가 삭제될 수 있습니다."
    read -p "계속하시겠습니까? (y/N): " -n 1 -r
    echo
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "복원이 취소되었습니다."
        exit 0
    fi
    
    log_info "데이터베이스 복원 시작..."
    
    # 압축 해제 (필요한 경우)
    if [[ "$backup_file" == *.gz ]]; then
        gunzip -c "$backup_file" | docker exec -i $CONTAINER_NAME psql -U "${POSTGRES_USER}" -d postgres
    else
        docker exec -i $CONTAINER_NAME psql -U "${POSTGRES_USER}" -d postgres < "$backup_file"
    fi
    
    log_success "데이터베이스 복원 완료"
}

# S3 백업 (선택사항)
backup_to_s3() {
    if [ -z "$BACKUP_S3_BUCKET" ]; then
        log_info "S3 설정이 없어 로컬 백업만 수행됩니다."
        return
    fi
    
    log_info "S3로 백업 업로드 시작..."
    
    # AWS CLI가 설치되어 있는지 확인
    if ! command -v aws &> /dev/null; then
        log_warning "AWS CLI가 설치되지 않았습니다. S3 백업을 건너뜁니다."
        return
    fi
    
    # S3 업로드
    aws s3 sync "$BACKUP_DIR" "s3://$BACKUP_S3_BUCKET/finance-tracker-backups/" \
        --delete \
        --exclude "*" \
        --include "*_$DATE.*"
    
    log_success "S3 백업 업로드 완료"
}

# 백업 정리 (7일 이상 된 백업 삭제)
cleanup_old_backups() {
    log_info "오래된 백업 정리 중..."
    
    # 7일 이상 된 백업 파일 삭제
    find "$BACKUP_DIR" -type f -mtime +7 -name "*backup*" -delete
    
    log_success "백업 정리 완료"
}

# 사용법 출력
show_usage() {
    echo "사용법: $0 [명령어]"
    echo ""
    echo "명령어:"
    echo "  backup          전체 백업 수행"
    echo "  backup-db       데이터베이스만 백업"
    echo "  restore-db      데이터베이스 복원"
    echo "  cleanup         오래된 백업 정리"
    echo ""
    echo "예시:"
    echo "  $0 backup"
    echo "  $0 restore-db ./backups/db_backup_20231201_120000.sql.gz"
}

# 메인 함수
main() {
    load_env
    
    case "$1" in
        "backup")
            full_backup
            backup_to_s3
            cleanup_old_backups
            ;;
        "backup-db")
            create_backup_dir
            backup_database
            ;;
        "restore-db")
            if [ -z "$2" ]; then
                log_error "백업 파일 경로를 지정해주세요."
                show_usage
                exit 1
            fi
            restore_database "$2"
            ;;
        "cleanup")
            cleanup_old_backups
            ;;
        *)
            show_usage
            exit 1
            ;;
    esac
}

# 스크립트 실행
main "$@"
