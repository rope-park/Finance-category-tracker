# Finance Category Tracker - Production Deployment Guide

## 🚀 프로덕션 환경 완전 가이드

Finance Category Tracker의 완전한 프로덕션 환경 배포 및 운영 가이드입니다. 모니터링, 로깅, 보안, 백업까지 모든 운영 요소를 포함합니다.

## 📋 목차

- [시스템 요구사항](#시스템-요구사항)
- [빠른 시작](#빠른-시작)
- [프로덕션 배포](#프로덕션-배포)
- [모니터링 & 로깅](#모니터링--로깅)
- [백업 & 복원](#백업--복원)
- [보안 설정](#보안-설정)
- [성능 최적화](#성능-최적화)
- [트러블슈팅](#트러블슈팅)

## 🖥️ 시스템 요구사항

### 최소 요구사항
- **OS**: Ubuntu 20.04+ / CentOS 8+ / Docker Desktop (Windows/Mac)
- **CPU**: 4 cores (8 cores 권장)
- **RAM**: 8GB (16GB 권장)
- **Storage**: 50GB SSD (100GB 권장)
- **Docker**: 20.10+
- **Docker Compose**: 2.0+

### 권장 프로덕션 환경
- **CPU**: 8+ cores
- **RAM**: 32GB+
- **Storage**: 200GB+ NVMe SSD
- **Network**: 1Gbps+
- **Load Balancer**: Nginx/HAProxy
- **CDN**: CloudFlare/AWS CloudFront

## 🚀 빠른 시작

### 1. 저장소 클론 및 환경 설정

\`\`\`bash
# 저장소 클론
git clone <repository-url>
cd Finance-category-tracker

# 환경 변수 설정 (중요!)
cp .env.production.example .env.production
nano .env.production  # 실제 프로덕션 값으로 수정

# 필수 비밀번호 변경
# - POSTGRES_PASSWORD
# - REDIS_PASSWORD  
# - JWT_SECRET
# - GRAFANA_PASSWORD
\`\`\`

### 2. 원클릭 프로덕션 배포

\`\`\`bash
# 프로덕션 환경 자동 배포
./scripts/deploy-production.sh
\`\`\`

### 3. 서비스 확인

배포 완료 후 다음 URL에서 서비스를 확인할 수 있습니다:

- **🌐 메인 애플리케이션**: https://localhost
- **📊 관리자 대시보드**: http://localhost:8080
- **📈 Grafana 모니터링**: http://localhost:8080/grafana
- **📋 Kibana 로그 분석**: http://localhost:8080/kibana

## 🏭 프로덕션 배포

### 상세 배포 프로세스

\`\`\`bash
# 1. 환경 변수 설정
source .env.production

# 2. SSL 인증서 설정 (프로덕션에서는 실제 인증서 사용)
# Let's Encrypt 사용 예시:
# certbot certonly --standalone -d your-domain.com
# cp /etc/letsencrypt/live/your-domain.com/fullchain.pem nginx/ssl/server.crt
# cp /etc/letsencrypt/live/your-domain.com/privkey.pem nginx/ssl/server.key

# 3. Docker 이미지 빌드
docker-compose -f docker-compose.production.yml build

# 4. 서비스 시작
docker-compose -f docker-compose.production.yml up -d

# 5. 헬스체크
./scripts/health-check.sh
\`\`\`

### 서비스 구성

| 서비스 | 포트 | 설명 |
|--------|------|------|
| Frontend (Nginx) | 80, 443 | React SPA + Nginx |
| Backend (Node.js) | 3001 | Express.js API |
| PostgreSQL | 5432 | 메인 데이터베이스 |
| Redis | 6379 | 캐시 & 세션 |
| Prometheus | 9090 | 메트릭 수집 |
| Grafana | 3000 | 모니터링 대시보드 |
| Elasticsearch | 9200 | 로그 저장소 |
| Logstash | 5044, 5000 | 로그 처리 |
| Kibana | 5601 | 로그 분석 |
| AlertManager | 9093 | 알림 관리 |

## 📊 모니터링 & 로깅

### Grafana 대시보드

**접속**: http://localhost:8080/grafana
**로그인**: admin / (GRAFANA_PASSWORD)

#### 사전 구성된 대시보드:
1. **애플리케이션 개요**
   - HTTP 요청 메트릭
   - 응답 시간 분석
   - 에러율 모니터링
   - 활성 사용자 수

2. **시스템 메트릭**
   - CPU, 메모리 사용률
   - 디스크 I/O
   - 네트워크 트래픽
   - Docker 컨테이너 상태

3. **데이터베이스 성능**
   - 쿼리 성능 분석
   - 연결 풀 모니터링
   - 슬로우 쿼리 추적
   - 테이블 크기 및 인덱스 사용률

### 로그 분석 (ELK Stack)

**접속**: http://localhost:8080/kibana

#### 수집되는 로그:
- 애플리케이션 로그 (INFO, WARN, ERROR)
- HTTP 액세스 로그
- 데이터베이스 쿼리 로그
- 보안 이벤트 로그
- 시스템 메트릭 로그

### 알림 설정

AlertManager를 통한 실시간 알림:
- **Slack**: 중요 알림 즉시 전송
- **Email**: 일일/주간 리포트
- **SMS**: 긴급 장애 알림 (Twilio 연동)

## 💾 백업 & 복원

### 자동 백업

\`\`\`bash
# 전체 백업 (데이터베이스 + Redis + 설정)
./scripts/backup-restore.sh backup

# 데이터베이스만 백업
./scripts/backup-restore.sh backup-db
\`\`\`

### 복원

\`\`\`bash
# 데이터베이스 복원
./scripts/backup-restore.sh restore-db ./backups/db_backup_20231201_120000.sql.gz
\`\`\`

### S3 백업 설정

\`.env.production\`에 S3 설정 추가:
\`\`\`env
BACKUP_S3_BUCKET=your-backup-bucket
BACKUP_S3_ACCESS_KEY=your-access-key
BACKUP_S3_SECRET_KEY=your-secret-key
\`\`\`

### 백업 스케줄링

cron을 이용한 자동 백업:
\`\`\`bash
# 매일 새벽 2시 백업
0 2 * * * /path/to/Finance-category-tracker/scripts/backup-restore.sh backup
\`\`\`

## 🔒 보안 설정

### SSL/TLS 설정

프로덕션 환경에서는 반드시 실제 SSL 인증서를 사용하세요:

\`\`\`bash
# Let's Encrypt 사용 예시
certbot certonly --standalone -d your-domain.com
cp /etc/letsencrypt/live/your-domain.com/fullchain.pem nginx/ssl/server.crt
cp /etc/letsencrypt/live/your-domain.com/privkey.pem nginx/ssl/server.key
\`\`\`

### 방화벽 설정

\`\`\`bash
# 기본 포트만 오픈
ufw allow 22    # SSH
ufw allow 80    # HTTP
ufw allow 443   # HTTPS
ufw allow 8080  # Admin Dashboard (IP 제한 권장)
ufw enable
\`\`\`

### 보안 헤더

Nginx 설정에 포함된 보안 헤더:
- `X-Frame-Options`
- `X-XSS-Protection`
- `X-Content-Type-Options`
- `Strict-Transport-Security`
- `Content-Security-Policy`

### Rate Limiting

API 호출 제한:
- 일반 API: 10req/s per IP
- 로그인 API: 1req/s per IP

## ⚡ 성능 최적화

### 데이터베이스 최적화

\`\`\`sql
-- 자동 설정된 성능 튜닝
-- shared_buffers: 256MB
-- effective_cache_size: 1GB
-- maintenance_work_mem: 64MB
-- max_connections: 100
\`\`\`

### Redis 캐싱

- 세션 데이터: 24시간 TTL
- API 응답: 5분 TTL
- 사용자 프로필: 1시간 TTL
- 정적 설정: 1일 TTL

### CDN 최적화

정적 자산의 CDN 배포:
\`\`\`nginx
# 1년 캐싱
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
\`\`\`

## 🔧 트러블슈팅

### 일반적인 문제들

#### 1. 컨테이너 시작 실패
\`\`\`bash
# 로그 확인
docker-compose -f docker-compose.production.yml logs [서비스명]

# 컨테이너 상태 확인
docker ps -a
\`\`\`

#### 2. 데이터베이스 연결 오류
\`\`\`bash
# PostgreSQL 연결 테스트
docker exec finance-postgres psql -U finance_user -d finance_tracker -c "SELECT 1;"

# 네트워크 확인
docker network ls
docker network inspect finance-category-tracker_app-network
\`\`\`

#### 3. 메모리 부족
\`\`\`bash
# 메모리 사용량 확인
docker stats

# 불필요한 이미지 정리
docker system prune -a
\`\`\`

#### 4. SSL 인증서 문제
\`\`\`bash
# 인증서 유효성 확인
openssl x509 -in nginx/ssl/server.crt -text -noout

# 인증서 갱신 (Let's Encrypt)
certbot renew
\`\`\`

### 로그 위치

- **애플리케이션 로그**: Docker logs 또는 ELK Stack
- **Nginx 로그**: 컨테이너 내 `/var/log/nginx/`
- **PostgreSQL 로그**: Docker logs
- **시스템 로그**: `/var/log/syslog`

### 성능 모니터링 명령어

\`\`\`bash
# 실시간 리소스 모니터링
htop

# Docker 리소스 사용량
docker stats --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"

# 네트워크 연결 상태
netstat -tuln

# 디스크 사용량
df -h
\`\`\`

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

---

**🎉 이제 Finance Category Tracker가 완전한 프로덕션 환경에서 실행됩니다!**

모니터링 대시보드를 통해 실시간으로 애플리케이션 상태를 확인하고, 자동 백업으로 데이터를 안전하게 보호하며, 확장 가능한 아키텍처로 성장하는 비즈니스 요구사항을 충족할 수 있습니다.
