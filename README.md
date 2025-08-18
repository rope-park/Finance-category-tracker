# 🏦 Finance Category Tracker

> 개인 재정 관리를 위한 풀스택 웹 애플리케이션

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

## 📋 목차

- [프로젝트 소개](#-프로젝트-소개)
- [주요 기능](#-주요-기능)
- [기술 스택](#-기술-스택)
- [프로젝트 구조](#-프로젝트-구조)
- [시작하기](#-시작하기)
- [개발 가이드](#-개발-가이드)
- [API 문서](#-api-문서)
- [배포](#-배포)
- [기여하기](#-기여하기)

## 🚀 프로젝트 소개

Finance Category Tracker는 개인의 수입과 지출을 체계적으로 관리할 수 있는 웹 애플리케이션입니다. 직관적인 UI와 강력한 분석 기능을 통해 사용자의 금융 습관을 개선하고 예산 관리를 돕습니다.

### ✨ 주요 기능

- 🔐 **사용자 인증**: JWT 기반 회원가입/로그인
- 💰 **거래 관리**: 수입/지출 내역 추가, 수정, 삭제
- 📊 **카테고리별 분류**: 식비, 교통비, 엔터테인먼트 등 다양한 카테고리
- 🎯 **예산 설정**: 카테고리별 월간/연간 예산 관리
- 📈 **통계 및 분석**: 시각적 차트와 리포트
- 👤 **프로필 관리**: 개인정보 및 설정 관리
- 🌙 **다크 모드**: 사용자 편의성을 위한 테마 지원
- 📱 **반응형 디자인**: 모바일/태블릿/데스크톱 지원

## 🛠 기술 스택

### Frontend
- **React 19** - UI 라이브러리
- **TypeScript** - 타입 안전성
- **Vite** - 빌드 도구
- **Tailwind CSS** - 스타일링
- **Recharts** - 데이터 시각화
- **Lucide React** - 아이콘
- **React Router Dom** - 라우팅

### Backend
- **Node.js** - 런타임 환경
- **Express.js** - 웹 프레임워크
- **TypeScript** - 타입 안전성
- **PostgreSQL** - 데이터베이스
- **JWT** - 인증
- **bcryptjs** - 비밀번호 암호화
- **Helmet** - 보안 미들웨어
- **Morgan** - 로깅

### 개발 도구
- **ESLint** - 코드 품질
- **Prettier** - 코드 포맷팅
- **Nodemon** - 개발 서버
- **Concurrently** - 병렬 스크립트 실행

## 📁 프로젝트 구조

```
finance-category-tracker/
├── apps/
│   ├── frontend/                 # React 프론트엔드
│   │   ├── public/              # 정적 파일
│   │   ├── src/
│   │   │   ├── components/      # 재사용 가능한 컴포넌트
│   │   │   ├── pages/          # 페이지 컴포넌트
│   │   │   ├── context/        # React Context
│   │   │   ├── hooks/          # 커스텀 훅
│   │   │   ├── services/       # API 서비스
│   │   │   ├── types/          # TypeScript 타입
│   │   │   └── utils/          # 유틸리티 함수
│   │   ├── package.json
│   │   └── vite.config.ts
│   │
│   └── backend/                 # Node.js 백엔드
│       ├── src/
│       │   ├── controllers/     # 비즈니스 로직
│       │   ├── middleware/      # Express 미들웨어
│       │   ├── routes/         # API 라우트
│       │   ├── config/         # 설정 파일
│       │   ├── types/          # TypeScript 타입
│       │   ├── utils/          # 유틸리티 함수
│       │   └── services/       # 비즈니스 서비스
│       ├── scripts/            # 데이터베이스 스크립트
│       ├── tests/              # 테스트 파일
│       └── package.json
│
├── packages/
│   └── shared/                  # 공유 타입 및 유틸리티
│       ├── src/
│       │   └── index.ts        # 공유 타입 정의
│       └── package.json
│
├── package.json                 # 루트 패키지 설정
├── .gitignore
└── README.md
```

## 🚀 시작하기

### 필수 조건

- Node.js 18.0.0 이상
- npm 9.0.0 이상
- PostgreSQL 12 이상

### 설치 및 실행

1. **저장소 클론**
   ```bash
   git clone https://github.com/rope-park/Finance-category-tracker.git
   cd Finance-category-tracker
   ```

2. **의존성 설치**
   ```bash
   npm run install:all
   ```

3. **데이터베이스 설정**
   - PostgreSQL 서버 실행
   - 데이터베이스 생성: `finance_tracker`
   - `apps/backend/.env` 파일 설정:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=finance_tracker
   DB_USER=postgres
   DB_PASSWORD=your_password
   JWT_SECRET=your_jwt_secret
   ```

4. **개발 서버 실행**
   ```bash
   npm run dev
   ```
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3001

## 💻 개발 가이드

### 스크립트 명령어

```bash
# 전체 프로젝트
npm run dev              # 프론트엔드 + 백엔드 동시 실행
npm run build            # 전체 빌드
npm run test             # 전체 테스트
npm run lint             # 전체 린트 검사

# 프론트엔드만
npm run dev:frontend     # 프론트엔드만 실행
npm run build:frontend   # 프론트엔드만 빌드

# 백엔드만
npm run dev:backend      # 백엔드만 실행
npm run build:backend    # 백엔드만 빌드
```

### 코드 스타일

- **ESLint** 설정을 준수합니다
- **Prettier**로 코드 포맷팅을 합니다
- **TypeScript** 타입 정의를 철저히 합니다
- **함수형 컴포넌트**와 **React Hooks**를 사용합니다

## 📚 API 문서

### 인증 API
- `POST /api/auth/register` - 회원가입
- `POST /api/auth/login` - 로그인
- `GET /api/auth/me` - 현재 사용자 정보
- `GET /api/auth/verify` - 토큰 검증

### 거래 API
- `GET /api/transactions` - 거래 목록 조회
- `POST /api/transactions` - 거래 생성
- `PUT /api/transactions/:id` - 거래 수정
- `DELETE /api/transactions/:id` - 거래 삭제
- `GET /api/transactions/stats/monthly` - 월간 통계

### 예산 API
- `GET /api/budgets` - 예산 목록 조회
- `POST /api/budgets` - 예산 생성
- `PUT /api/budgets/:id` - 예산 수정
- `DELETE /api/budgets/:id` - 예산 삭제

### 사용자 API
- `PATCH /api/users/profile` - 프로필 업데이트
- `GET /api/users/settings` - 사용자 설정 조회
- `PATCH /api/users/settings` - 사용자 설정 업데이트

## 🌐 배포

### Vercel (Frontend)
```bash
npm run build:frontend
cd apps/frontend
vercel --prod
```

### Railway/Heroku (Backend)
```bash
npm run build:backend
# Railway 또는 Heroku 배포 설정
```

## 🤝 기여하기

1. Fork 프로젝트
2. Feature 브랜치 생성 (`git checkout -b feature/AmazingFeature`)
3. 변경사항 커밋 (`git commit -m 'Add some AmazingFeature'`)
4. 브랜치에 Push (`git push origin feature/AmazingFeature`)
5. Pull Request 생성

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 👤 작성자

**Kelly**
- GitHub: [@rope-park](https://github.com/rope-park)

## 🙏 감사의 말

이 프로젝트를 개발하는 데 도움을 준 모든 오픈소스 라이브러리와 커뮤니티에 감사드립니다.
