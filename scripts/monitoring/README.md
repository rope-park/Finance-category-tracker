cat > monitoring/README.md << 'EOF'
# 📊 모니터링 스크립트

시스템 상태 모니터링 및 헬스체크 스크립트들

## 📜 스크립트 목록

### health-check.sh
애플리케이션 헬스체크

**사용법:**
```bash
cd scripts/monitoring
./health-check.sh
```

### memory-monitor.sh
메모리 사용량 모니터링

**사용법:**
```bash
cd scripts/monitoring
./memory-monitor.sh
```

## 🔄 자동 실행 설정

### Cron으로 정기 모니터링
```bash
# crontab -e로 편집
# 5분마다 헬스체크
*/5 * * * * /path/to/scripts/monitoring/health-check.sh

# 1분마다 메모리 체크
* * * * * /path/to/scripts/monitoring/memory-monitor.sh
```

### systemd 서비스 (Linux)
```bash
# /etc/systemd/system/health-monitor.service 생성
sudo systemctl enable health-monitor.service
sudo systemctl start health-monitor.service
```