# Finance Category Tracker - Backend

개인 재정 관리 및 카테고리 추적을 위한 고성능 REST API 서버입니다.

## 🚀 주요 기능

### ✨ 핵심 기능
- **사용자 인증 및 권한 관리** - JWT 기반 보안 인증
- **거래 관리** - 수입/지출 거래 추적 및 관리
- **예산 관리** - 카테고리별 예산 설정 및 모니터링
- **통계 및 분석** - 재정 데이터 분석 및 시각화
- **카테고리 시스템** - 스마트 카테고리 분류 및 추천

### 🛡️ 보안 기능
- **다중 레이어 보안** - Rate Limiting, XSS 방지, SQL Injection 차단
- **고급 에러 처리** - 구조화된 에러 관리 및 로깅
- **입력 검증** - 포괄적인 데이터 유효성 검사
- **IP 필터링** - 화이트리스트/블랙리스트 기반 접근 제어

### 📊 모니터링 및 운영
- **실시간 성능 모니터링** - 응답 시간, 메모리 사용량, CPU 사용률 추적
- **구조화된 로깅** - Winston 기반 로깅 시스템
- **헬스체크** - 서버 및 데이터베이스 상태 모니터링
- **API 문서화** - Swagger/OpenAPI 자동 문서 생성

## 🏗️ 기술 스택

### 백엔드 프레임워크
- **Node.js** + **TypeScript**
- **Express.js** - 웹 프레임워크
- **PostgreSQL** - 주 데이터베이스

### 보안 및 미들웨어
- **Helmet** - 보안 헤더 설정
- **express-rate-limit** - API 요청 제한
- **express-slow-down** - 점진적 속도 제한
- **xss** - XSS 공격 방지
- **validator** - 입력 검증

### 모니터링 및 로깅
- **Winston** - 구조화된 로깅
- **Performance Hooks** - 성능 측정
- **Custom Metrics** - 실시간 메트릭 수집

### API 문서화
- **Swagger JSDoc** - API 문서 자동 생성
- **Swagger UI Express** - 인터랙티브 API 문서

## 📋 사전 요구사항

- Node.js 18.0.0 이상
- PostgreSQL 13.0 이상
- npm 또는 yarn 패키지 매니저

## 🛠️ 설치 및 설정

### 1. 저장소 클론
```bash
git clone <repository-url>
cd Finance-category-tracker/apps/backend
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 환경 변수 설정
```bash
cp .env.example .env
```

`.env` 파일을 편집하여 다음 설정을 구성하세요:

```env
# 서버 설정
NODE_ENV=development
PORT=8000
API_BASE_URL=http://localhost:8000

# 데이터베이스 설정
DB_HOST=localhost
DB_PORT=5432
DB_NAME=finance_tracker
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# JWT 설정
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h

# 로깅 설정
LOG_LEVEL=info
LOG_FILE_PATH=./logs
```

### 4. 데이터베이스 설정
PostgreSQL 데이터베이스를 생성하고 스키마를 설정하세요:

```sql
CREATE DATABASE finance_tracker;
-- 필요한 테이블 생성 쿼리 실행
```

### 5. 서버 실행
```bash
# 개발 모드
npm run dev

# 프로덕션 모드
npm start

# 테스트 실행
npm test
```

## 📚 API 문서

서버가 실행되면 다음 URL에서 API 문서를 확인할 수 있습니다:

- **API 문서**: http://localhost:8000/api-docs
- **헬스체크**: http://localhost:8000/api/health
- **메트릭**: http://localhost:8000/api/metrics
- **시스템 정보**: http://localhost:8000/api/system

## 🔍 모니터링 엔드포인트

### 헬스체크
```bash
GET /api/health          # 전체 시스템 상태
GET /api/health/database # 데이터베이스 연결 상태
```

### 성능 메트릭
```bash
GET /api/metrics   # 상세 성능 메트릭
GET /api/system    # 시스템 정보
```

### 개발 도구 (개발 환경에서만)
```bash
POST /api/metrics/reset  # 메트릭 초기화
```

## 🛡️ 보안 기능

### Rate Limiting
- **일반 API**: 15분당 100회 요청
- **인증 API**: 15분당 5회 요청
- **민감한 작업**: 1시간당 3회 요청

### 보안 헤더
- Content Security Policy (CSP)
- HTTP Strict Transport Security (HSTS)
- X-Frame-Options
- X-Content-Type-Options

### 입력 검증
- XSS 공격 방지
- SQL Injection 차단
- 파일 업로드 보안
- 요청 크기 제한

## 📊 로깅 시스템

### 로그 레벨
- **error**: 에러 및 예외 상황
- **warn**: 경고 상황
- **info**: 일반 정보
- **http**: HTTP 요청/응답
- **debug**: 디버깅 정보

### 로그 카테고리
- **HTTP 요청**: 모든 API 요청/응답 로깅
- **데이터베이스**: 쿼리 실행 및 성능 로깅
- **인증**: 로그인/로그아웃 이벤트
- **보안**: 보안 이벤트 및 위협 탐지
- **성능**: 성능 관련 메트릭 및 경고

## 🔧 개발 도구

### 스크립트
```bash
npm run dev        # 개발 서버 (hot reload)
npm run build      # TypeScript 컴파일
npm start          # 프로덕션 서버
npm test           # 테스트 실행
npm run test:watch # 테스트 감시 모드
npm run lint       # ESLint 검사
```

### 디버깅
```bash
# 디버그 모드로 실행
DEBUG=app:* npm run dev

# 특정 모듈 디버깅
DEBUG=app:database npm run dev
```

## 📈 성능 최적화

### 데이터베이스 최적화
- 연결 풀 관리
- 쿼리 최적화
- 트랜잭션 관리
- 자동 재시도 로직

### 메모리 관리
- 메모리 사용량 모니터링
- 가비지 컬렉션 최적화
- 메모리 누수 감지

### 응답 시간 최적화
- 비동기 처리
- 캐싱 전략
- 압축 및 최적화

## 🧪 테스트

### 테스트 종류
- **단위 테스트**: 개별 함수 및 모듈 테스트
- **통합 테스트**: API 엔드포인트 테스트
- **성능 테스트**: 로드 테스트 및 스트레스 테스트

### 테스트 실행
```bash
npm test              # 전체 테스트
npm run test:unit     # 단위 테스트만
npm run test:integration # 통합 테스트만
npm run test:coverage # 커버리지 리포트
```

## 🚀 배포

### 프로덕션 배포 체크리스트
- [ ] 환경 변수 설정 확인
- [ ] 데이터베이스 마이그레이션
- [ ] 보안 설정 검토
- [ ] 로깅 설정 확인
- [ ] 모니터링 설정
- [ ] SSL/TLS 인증서 설정
- [ ] 백업 시스템 구성

### Docker 배포 (선택사항)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 8000
CMD ["npm", "start"]
```

## 🤝 기여 가이드

1. Fork 후 기능 브랜치 생성
2. 코드 변경 및 테스트 작성
3. ESLint 및 Prettier 규칙 준수
4. 커밋 메시지 컨벤션 따르기
5. Pull Request 생성

## 📝 라이선스

MIT License - 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 📞 지원 및 문의

- **이슈 리포트**: GitHub Issues
- **기능 요청**: GitHub Discussions

---

💡 **팁**: 개발 중에는 `LOG_LEVEL=debug`로 설정하여 상세한 로그를 확인할 수 있습니다.
