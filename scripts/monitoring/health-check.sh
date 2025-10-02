#!/bin/bash

# Finance Tracker Health Check Script
# 모든 서비스의 헬스 상태를 확인하는 스크립트

set -e

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

# 환경 설정 (기본값 또는 전달받은 인수)
ENVIRONMENT=${1:-"production"}
COMPOSE_FILE="docker-compose.${ENVIRONMENT}.yml"

# 헬스체크 결과 저장
HEALTH_STATUS=()
FAILED_SERVICES=()

# 개별 서비스 헬스체크 함수
check_service() {
    local service_name=$1
    local url=$2
    local expected_status=${3:-200}
    
    log_info "Checking $service_name..."
    
    # curl로 헬스체크
    local response_code
    response_code=$(curl -s -o /dev/null -w "%{http_code}" "$url" || echo "000")
    
    if [ "$response_code" = "$expected_status" ]; then
        log_success "$service_name is healthy (HTTP $response_code)"
        HEALTH_STATUS+=("$service_name:OK")
        return 0
    else
        log_error "$service_name is unhealthy (HTTP $response_code)"
        HEALTH_STATUS+=("$service_name:FAIL")
        FAILED_SERVICES+=("$service_name")
        return 1
    fi
}

# Docker 컨테이너 상태 확인
check_container_status() {
    log_info "Checking Docker container status..."
    
    if [ ! -f "$COMPOSE_FILE" ]; then
        log_error "Compose file $COMPOSE_FILE not found"
        return 1
    fi
    
    local containers
    containers=$(docker-compose -f "$COMPOSE_FILE" ps --services)
    
    for container in $containers; do
        local status
        status=$(docker-compose -f "$COMPOSE_FILE" ps -q "$container" | xargs docker inspect --format='{{.State.Status}}' 2>/dev/null || echo "not_found")
        
        if [ "$status" = "running" ]; then
            log_success "Container $container is running"
        else
            log_error "Container $container is not running (Status: $status)"
            FAILED_SERVICES+=("$container")
        fi
    done
}

# 데이터베이스 연결 확인
check_database() {
    log_info "Checking database connectivity..."
    
    local db_check
    if db_check=$(docker-compose -f "$COMPOSE_FILE" exec -T postgres pg_isready -U "${POSTGRES_USER:-finance_user}" 2>/dev/null); then
        log_success "Database is accessible"
        HEALTH_STATUS+=("database:OK")
    else
        log_error "Database connection failed"
        HEALTH_STATUS+=("database:FAIL")
        FAILED_SERVICES+=("database")
    fi
}

# Redis 연결 확인
check_redis() {
    log_info "Checking Redis connectivity..."
    
    local redis_check
    if redis_check=$(docker-compose -f "$COMPOSE_FILE" exec -T redis redis-cli ping 2>/dev/null); then
        if [ "$redis_check" = "PONG" ]; then
            log_success "Redis is accessible"
            HEALTH_STATUS+=("redis:OK")
        else
            log_error "Redis ping failed"
            HEALTH_STATUS+=("redis:FAIL")
            FAILED_SERVICES+=("redis")
        fi
    else
        log_error "Redis connection failed"
        HEALTH_STATUS+=("redis:FAIL")
        FAILED_SERVICES+=("redis")
    fi
}

# 디스크 사용량 확인
check_disk_usage() {
    log_info "Checking disk usage..."
    
    local disk_usage
    disk_usage=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
    
    if [ "$disk_usage" -lt 80 ]; then
        log_success "Disk usage: ${disk_usage}% (OK)"
    elif [ "$disk_usage" -lt 90 ]; then
        log_warning "Disk usage: ${disk_usage}% (Warning)"
    else
        log_error "Disk usage: ${disk_usage}% (Critical)"
        FAILED_SERVICES+=("disk_space")
    fi
}

# 메모리 사용량 확인
check_memory_usage() {
    log_info "Checking memory usage..."
    
    local mem_usage
    mem_usage=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100.0}')
    
    if [ "$mem_usage" -lt 80 ]; then
        log_success "Memory usage: ${mem_usage}% (OK)"
    elif [ "$mem_usage" -lt 90 ]; then
        log_warning "Memory usage: ${mem_usage}% (Warning)"
    else
        log_error "Memory usage: ${mem_usage}% (Critical)"
        FAILED_SERVICES+=("memory")
    fi
}

# 로그 에러 확인
check_recent_errors() {
    log_info "Checking recent errors in logs..."
    
    local error_count
    error_count=$(docker-compose -f "$COMPOSE_FILE" logs --tail=100 2>/dev/null | grep -i error | wc -l || echo 0)
    
    if [ "$error_count" -eq 0 ]; then
        log_success "No recent errors in logs"
    elif [ "$error_count" -lt 5 ]; then
        log_warning "Found $error_count recent errors in logs"
    else
        log_error "Found $error_count recent errors in logs"
        FAILED_SERVICES+=("log_errors")
    fi
}

# 성능 메트릭 확인
check_performance_metrics() {
    log_info "Checking performance metrics..."
    
    # API 응답 시간 체크
    if command -v curl &> /dev/null; then
        local response_time
        response_time=$(curl -o /dev/null -s -w '%{time_total}' http://localhost:3001/health 2>/dev/null || echo "999")
        
        # 소수점을 정수로 변환 (밀리초 단위)
        response_time_ms=$(echo "$response_time * 1000" | bc -l | cut -d. -f1)
        
        if [ "$response_time_ms" -lt 500 ]; then
            log_success "API response time: ${response_time}s (Good)"
        elif [ "$response_time_ms" -lt 2000 ]; then
            log_warning "API response time: ${response_time}s (Acceptable)"
        else
            log_error "API response time: ${response_time}s (Slow)"
            FAILED_SERVICES+=("api_performance")
        fi
    fi
}

# 메인 헬스체크 실행
main_health_check() {
    echo "======================================"
    echo "Finance Tracker Health Check"
    echo "Environment: $ENVIRONMENT"
    echo "======================================"
    echo ""
    
    # Docker 컨테이너 상태 확인
    check_container_status
    
    # 시스템 리소스 확인
    check_disk_usage
    check_memory_usage
    
    # 데이터베이스 서비스 확인
    check_database
    check_redis
    
    # 애플리케이션 서비스 헬스체크
    sleep 5  # 서비스 시작 대기
    
    check_service "Frontend" "http://localhost/health"
    check_service "Backend API" "http://localhost:3001/health"
    
    # 모니터링 서비스 확인 (프로덕션 환경에서만)
    if [ "$ENVIRONMENT" = "production" ]; then
        check_service "Grafana" "http://localhost:3000/api/health"
        check_service "Prometheus" "http://localhost:9090/-/healthy"
        check_service "Kibana" "http://localhost:5601/api/status"
    fi
    
    # 로그 및 성능 확인
    check_recent_errors
    check_performance_metrics
    
    echo ""
    echo "======================================"
    echo "Health Check Results"
    echo "======================================"
    
    # 결과 출력
    for status in "${HEALTH_STATUS[@]}"; do
        service=$(echo "$status" | cut -d: -f1)
        result=$(echo "$status" | cut -d: -f2)
        
        if [ "$result" = "OK" ]; then
            log_success "$service: HEALTHY"
        else
            log_error "$service: UNHEALTHY"
        fi
    done
    
    echo ""
    
    # 전체 결과 판정
    if [ ${#FAILED_SERVICES[@]} -eq 0 ]; then
        log_success "All services are healthy! 🎉"
        exit 0
    else
        log_error "Failed services: ${FAILED_SERVICES[*]}"
        log_error "Health check failed! 🚨"
        exit 1
    fi
}

# 간단한 헬스체크 (CI/CD용)
simple_health_check() {
    echo "Running simple health check..."
    
    local failed=0
    
    # 핵심 서비스만 체크
    check_service "Backend API" "http://localhost:3001/health" || ((failed++))
    
    if [ "$failed" -eq 0 ]; then
        echo "Simple health check passed ✅"
        exit 0
    else
        echo "Simple health check failed ❌"
        exit 1
    fi
}

# 사용법 출력
show_usage() {
    echo "사용법: $0 [환경] [옵션]"
    echo ""
    echo "환경:"
    echo "  production     프로덕션 환경 헬스체크 (기본값)"
    echo "  staging        스테이징 환경 헬스체크"
    echo "  development    개발 환경 헬스체크"
    echo ""
    echo "옵션:"
    echo "  --simple       간단한 헬스체크만 실행 (CI/CD용)"
    echo "  --help         이 도움말 표시"
    echo ""
    echo "예시:"
    echo "  $0                    # 프로덕션 환경 전체 헬스체크"
    echo "  $0 staging            # 스테이징 환경 헬스체크"
    echo "  $0 production --simple # 간단한 헬스체크"
}

# 인수 처리
case "${2:-}" in
    "--simple")
        simple_health_check
        ;;
    "--help")
        show_usage
        exit 0
        ;;
    "")
        main_health_check
        ;;
    *)
        echo "Unknown option: $2"
        show_usage
        exit 1
        ;;
esac
