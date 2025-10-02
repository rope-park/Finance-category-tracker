#!/bin/bash

# Finance Tracker Production Deployment Script
# 프로덕션 환경 배포 자동화 스크립트

set -e  # 에러 발생시 스크립트 중단

# 색상 출력을 위한 변수
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# 환경 변수 확인
check_environment() {
    log_info "환경 변수 확인 중..."
    
    if [ ! -f ".env.production" ]; then
        log_error ".env.production 파일이 없습니다. 먼저 환경 설정을 완료해주세요."
        exit 1
    fi
    
    source .env.production
    
    # 필수 환경 변수 확인
    required_vars=("POSTGRES_PASSWORD" "REDIS_PASSWORD" "JWT_SECRET" "GRAFANA_PASSWORD")
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            log_error "필수 환경 변수 $var가 설정되지 않았습니다."
            exit 1
        fi
    done
    
    log_success "환경 변수 확인 완료"
}

# Docker 및 Docker Compose 설치 확인
check_dependencies() {
    log_info "의존성 확인 중..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker가 설치되지 않았습니다."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null && ! command -v docker compose &> /dev/null; then
        log_error "Docker Compose가 설치되지 않았습니다."
        exit 1
    fi
    
    log_success "의존성 확인 완료"
}

# SSL 인증서 생성 (개발/테스트용 자체 서명)
generate_ssl_certificates() {
    log_info "SSL 인증서 생성 중..."
    
    mkdir -p nginx/ssl
    
    if [ ! -f "nginx/ssl/server.crt" ]; then
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout nginx/ssl/server.key \
            -out nginx/ssl/server.crt \
            -subj "/C=KR/ST=Seoul/L=Seoul/O=Finance Tracker/CN=localhost"
        
        log_success "SSL 인증서 생성 완료"
    else
        log_info "SSL 인증서가 이미 존재합니다."
    fi
}

# 기본 인증 파일 생성
generate_htpasswd() {
    log_info "기본 인증 파일 생성 중..."
    
    mkdir -p nginx
    
    if [ ! -f "nginx/.htpasswd" ]; then
        # 기본값: admin / admin123
        echo "admin:\$apr1\$ruca84Hq\$HopxMivKxl.gGI/g5JM3P/" > nginx/.htpasswd
        log_success "기본 인증 파일 생성 완료 (admin/admin123)"
        log_warning "프로덕션 환경에서는 반드시 비밀번호를 변경하세요!"
    else
        log_info "기본 인증 파일이 이미 존재합니다."
    fi
}

# 데이터베이스 초기화 스크립트 생성
generate_db_init_script() {
    log_info "데이터베이스 초기화 스크립트 생성 중..."
    
    cat > scripts/init-db.sql << EOF
-- Finance Tracker Database Initialization Script
-- 데이터베이스 초기화 및 권한 설정

-- 확장 모듈 설치
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- 모니터링을 위한 통계 수집 활성화
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
ALTER SYSTEM SET pg_stat_statements.track = all;

-- 성능 튜닝 설정
ALTER SYSTEM SET max_connections = 100;
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;

-- 설정 리로드
SELECT pg_reload_conf();

-- 로그 메시지
\\echo 'Database initialization completed successfully!';
EOF
    
    log_success "데이터베이스 초기화 스크립트 생성 완료"
}

# Docker 이미지 빌드
build_images() {
    log_info "Docker 이미지 빌드 중..."
    
    # 프로덕션 이미지 빌드
    docker-compose -f docker-compose.production.yml build --no-cache
    
    log_success "Docker 이미지 빌드 완료"
}

# 프로덕션 환경 배포
deploy_production() {
    log_info "프로덕션 환경 배포 중..."
    
    # 기존 컨테이너 중지 및 제거
    docker-compose -f docker-compose.production.yml down --remove-orphans
    
    # 볼륨 및 네트워크 정리
    docker system prune -f
    
    # 프로덕션 환경 시작
    docker-compose -f docker-compose.production.yml up -d
    
    log_success "프로덕션 환경 배포 완료"
}

# 헬스체크
health_check() {
    log_info "헬스체크 수행 중..."
    
    sleep 30  # 서비스 시작 대기
    
    # 각 서비스 헬스체크
    services=("frontend:80" "backend:3001" "grafana:3000" "kibana:5601" "prometheus:9090")
    
    for service in "${services[@]}"; do
        service_name=$(echo $service | cut -d: -f1)
        port=$(echo $service | cut -d: -f2)
        
        log_info "$service_name 헬스체크 중..."
        
        if curl -f http://localhost:$port/health > /dev/null 2>&1 || 
           curl -f http://localhost:$port > /dev/null 2>&1; then
            log_success "$service_name 정상 작동"
        else
            log_warning "$service_name 헬스체크 실패"
        fi
    done
}

# 모니터링 대시보드 URL 출력
show_dashboard_urls() {
    echo ""
    log_success "배포 완료! 다음 URL에서 서비스에 접근할 수 있습니다:"
    echo ""
    echo "🌐 메인 애플리케이션:     https://localhost"
    echo "📊 관리자 대시보드:      http://localhost:8080"
    echo "📈 Grafana 모니터링:     http://localhost:8080/grafana"
    echo "📋 Kibana 로그 분석:     http://localhost:8080/kibana"
    echo "🔍 Prometheus 메트릭:    http://localhost:9090"
    echo ""
    log_info "관리자 대시보드 로그인: admin / admin123"
    log_warning "프로덕션 환경에서는 반드시 기본 비밀번호를 변경하세요!"
    echo ""
}

# 메인 함수
main() {
    echo "======================================"
    echo "Finance Tracker 프로덕션 배포 스크립트"
    echo "======================================"
    echo ""
    
    check_environment
    check_dependencies
    generate_ssl_certificates
    generate_htpasswd
    generate_db_init_script
    build_images
    deploy_production
    health_check
    show_dashboard_urls
    
    log_success "프로덕션 배포가 성공적으로 완료되었습니다! 🎉"
}

# 스크립트 실행
main "$@"
