#!/bin/bash

# 메모리 사용량 모니터링 및 최적화 스크립트
# Finance Tracker 애플리케이션용 메모리 관리 도구

echo "🔍 Finance Tracker 메모리 사용량 모니터링 시작..."

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 임계값 설정
MEMORY_WARNING_THRESHOLD=70  # 70% 이상 시 경고
MEMORY_CRITICAL_THRESHOLD=85 # 85% 이상 시 위험

# 프로세스 이름 패턴
NODE_PROCESS_NAME="node"
FRONTEND_PROCESS_NAME="vite"

# 로그 파일
LOG_FILE="memory_monitor.log"

# 현재 시간 함수
timestamp() {
    date "+%Y-%m-%d %H:%M:%S"
}

# 로그 기록 함수
log_message() {
    echo "[$(timestamp)] $1" | tee -a "$LOG_FILE"
}

# 메모리 사용량 확인 함수
check_memory() {
    # 전체 시스템 메모리 사용량
    MEMORY_USAGE=$(free | grep '^Mem:' | awk '{printf "%.1f", ($3/$2) * 100.0}')
    MEMORY_USED=$(free -h | grep '^Mem:' | awk '{print $3}')
    MEMORY_TOTAL=$(free -h | grep '^Mem:' | awk '{print $2}')
    
    echo -e "\n📊 ${GREEN}시스템 메모리 사용량${NC}"
    echo "전체: $MEMORY_TOTAL | 사용: $MEMORY_USED | 사용률: $MEMORY_USAGE%"
    
    # 메모리 사용량에 따른 경고
    if (( $(echo "$MEMORY_USAGE > $MEMORY_CRITICAL_THRESHOLD" | bc -l) )); then
        echo -e "${RED}⚠️  위험: 메모리 사용률이 ${MEMORY_CRITICAL_THRESHOLD}%를 초과했습니다!${NC}"
        log_message "CRITICAL: Memory usage $MEMORY_USAGE% exceeds $MEMORY_CRITICAL_THRESHOLD%"
        return 2
    elif (( $(echo "$MEMORY_USAGE > $MEMORY_WARNING_THRESHOLD" | bc -l) )); then
        echo -e "${YELLOW}⚠️  경고: 메모리 사용률이 ${MEMORY_WARNING_THRESHOLD}%를 초과했습니다.${NC}"
        log_message "WARNING: Memory usage $MEMORY_USAGE% exceeds $MEMORY_WARNING_THRESHOLD%"
        return 1
    else
        echo -e "${GREEN}✅ 메모리 사용률이 정상 범위입니다.${NC}"
        return 0
    fi
}

# 프로세스별 메모리 사용량 확인
check_process_memory() {
    echo -e "\n🔍 ${GREEN}Finance Tracker 프로세스 메모리 사용량${NC}"
    
    # Node.js 백엔드 프로세스
    NODE_PROCESSES=$(ps aux | grep -E "(node.*server|node.*backend)" | grep -v grep)
    if [ ! -z "$NODE_PROCESSES" ]; then
        echo -e "\n📦 ${YELLOW}Node.js 백엔드 프로세스:${NC}"
        echo "$NODE_PROCESSES" | awk '{printf "PID: %s | CPU: %s%% | MEM: %s%% | COMMAND: %s\n", $2, $3, $4, $11}'
        
        # 백엔드 총 메모리 사용량
        BACKEND_MEMORY=$(echo "$NODE_PROCESSES" | awk '{sum += $4} END {printf "%.1f", sum}')
        echo "백엔드 총 메모리 사용률: ${BACKEND_MEMORY}%"
    else
        echo "❌ Node.js 백엔드 프로세스를 찾을 수 없습니다."
    fi
    
    # Vite 프론트엔드 프로세스
    VITE_PROCESSES=$(ps aux | grep -E "(vite|npm.*dev)" | grep -v grep)
    if [ ! -z "$VITE_PROCESSES" ]; then
        echo -e "\n⚡ ${YELLOW}Vite 프론트엔드 프로세스:${NC}"
        echo "$VITE_PROCESSES" | awk '{printf "PID: %s | CPU: %s%% | MEM: %s%% | COMMAND: %s\n", $2, $3, $4, $11}'
        
        # 프론트엔드 총 메모리 사용량
        FRONTEND_MEMORY=$(echo "$VITE_PROCESSES" | awk '{sum += $4} END {printf "%.1f", sum}')
        echo "프론트엔드 총 메모리 사용률: ${FRONTEND_MEMORY}%"
    else
        echo "❌ Vite 프론트엔드 프로세스를 찾을 수 없습니다."
    fi
}

# 메모리 최적화 제안
suggest_optimizations() {
    echo -e "\n💡 ${GREEN}메모리 최적화 제안${NC}"
    
    # Node.js 메모리 최적화
    echo -e "\n🔧 ${YELLOW}Node.js 백엔드 최적화:${NC}"
    echo "• --max-old-space-size=4096 옵션으로 힙 메모리 제한"
    echo "• 응답 데이터 캐싱 및 정리 주기 확인"
    echo "• 데이터베이스 연결 풀 크기 조정"
    echo "• 모니터링 메트릭 히스토리 크기 축소"
    
    # 프론트엔드 최적화
    echo -e "\n⚡ ${YELLOW}Vite 프론트엔드 최적화:${NC}"
    echo "• React.memo() 및 useMemo() 활용으로 리렌더링 방지"
    echo "• 차트 데이터 가상화 및 페이지네이션 적용"
    echo "• 코드 스플리팅으로 번들 크기 최적화"
    echo "• 사용하지 않는 라이브러리 제거"
    
    # 시스템 최적화
    echo -e "\n💻 ${YELLOW}시스템 레벨 최적화:${NC}"
    echo "• 가비지 컬렉션 주기 조정"
    echo "• 스왑 메모리 활용 검토"
    echo "• 컨테이너 메모리 제한 설정 (Docker 사용 시)"
    echo "• PM2 클러스터 모드로 메모리 분산"
}

# 메모리 정리 함수
cleanup_memory() {
    echo -e "\n🧹 ${GREEN}메모리 정리 수행 중...${NC}"
    
    # Node.js 프로세스에 SIGUSR2 시그널 전송 (가비지 컬렉션 트리거)
    NODE_PIDS=$(ps aux | grep -E "(node.*server|node.*backend)" | grep -v grep | awk '{print $2}')
    for pid in $NODE_PIDS; do
        if [ ! -z "$pid" ]; then
            echo "Node.js 프로세스 $pid에 메모리 정리 시그널 전송"
            kill -USR2 $pid 2>/dev/null || echo "⚠️  프로세스 $pid에 시그널 전송 실패"
        fi
    done
    
    # 시스템 캐시 정리
    if [ "$EUID" -eq 0 ]; then
        echo "시스템 캐시 정리 중..."
        sync
        echo 3 > /proc/sys/vm/drop_caches
        echo "✅ 시스템 캐시 정리 완료"
    else
        echo "⚠️  시스템 캐시 정리는 root 권한이 필요합니다."
    fi
}

# 모니터링 메인 함수
main() {
    echo "=========================================="
    echo "🏦 Finance Tracker 메모리 모니터링"
    echo "시간: $(timestamp)"
    echo "=========================================="
    
    # 메모리 사용량 확인
    check_memory
    MEMORY_STATUS=$?
    
    # 프로세스별 메모리 확인
    check_process_memory
    
    # 높은 메모리 사용률일 때 최적화 제안
    if [ $MEMORY_STATUS -ge 1 ]; then
        suggest_optimizations
        
        # 위험 수준일 때 자동 정리 수행
        if [ $MEMORY_STATUS -eq 2 ]; then
            read -p "메모리 정리를 수행하시겠습니까? (y/N): " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                cleanup_memory
            fi
        fi
    fi
    
    echo -e "\n=========================================="
    echo "📊 모니터링 완료"
    echo "로그 파일: $LOG_FILE"
    echo "=========================================="
}

# 연속 모니터링 모드
monitor_continuous() {
    echo "🔄 연속 모니터링 모드 시작 (Ctrl+C로 종료)"
    while true; do
        main
        echo -e "\n⏰ 60초 후 다시 확인합니다...\n"
        sleep 60
    done
}

# 도움말
show_help() {
    echo "Finance Tracker 메모리 모니터링 도구"
    echo ""
    echo "사용법:"
    echo "  $0                  - 한 번 실행"
    echo "  $0 --continuous     - 연속 모니터링"
    echo "  $0 --cleanup        - 메모리 정리만 수행"
    echo "  $0 --help           - 이 도움말 표시"
    echo ""
}

# 인자 처리
case "${1:-}" in
    --continuous|-c)
        monitor_continuous
        ;;
    --cleanup)
        cleanup_memory
        ;;
    --help|-h)
        show_help
        ;;
    "")
        main
        ;;
    *)
        echo "알 수 없는 옵션: $1"
        show_help
        exit 1
        ;;
esac