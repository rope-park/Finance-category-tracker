# 개인 금융 트래커 (Personal Finance Tracker)

Toss Payments API와 연동된 개인 금융 관리 대시보드입니다. 카테고리별 소비 내역을 추적하고 예산 한도를 설정하여 스마트한 금융 관리를 할 수 있습니다.

## 🚀 주요 기능

### 📊 대시보드
- 월별 수입/지출 요약
- 실시간 잔액 표시
- 카테고리별 소비 현황

### 💰 예산 관리
- 카테고리별 예산 한도 설정
- 예산 사용률 시각화
- 예산 초과 시 자동 경고

### 🔔 스마트 알림
- 예산 한도 근접 시 경고 알림
- 예산 초과 시 즉시 알림
- 알림 히스토리 관리

### 📱 거래 내역
- Toss Payments API 연동
- 실시간 거래 내역 동기화
- 카테고리별 거래 분류

## 🛠️ 기술 스택

- **Frontend**: React.js, TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **API Integration**: Toss Payments API
- **Deployment**: Vercel
- **Build Tool**: Vite

## 🚀 시작하기

### 1. 프로젝트 설치
```bash
npm install
```

### 2. 환경 변수 설정
```bash
cp .env.example .env.local
```

`.env.local` 파일에서 Toss Payments API 키를 설정하세요:
```
VITE_TOSS_CLIENT_KEY=your_client_key_here
VITE_TOSS_SECRET_KEY=your_secret_key_here
```

### 3. 개발 서버 실행
```bash
npm run dev
```

### 4. 빌드
```bash
npm run build
```

## 📋 카테고리 종류

- 🍽️ **식비**: 식당, 카페, 배달음식 등
- 🚗 **교통비**: 지하철, 버스, 택시, 주유비 등
- 🛍️ **쇼핑**: 의류, 잡화, 온라인 쇼핑 등
- 🎬 **엔터테인먼트**: 영화, 게임, 공연 등
- 💡 **공과금**: 전기, 가스, 수도, 통신비 등
- 🏥 **의료비**: 병원, 약국, 건강관리 등
- 📚 **교육비**: 학비, 도서, 강의 등
- 📝 **기타**: 기타 모든 지출

## 🚀 Vercel 배포

### 1. Vercel CLI 설치
```bash
npm i -g vercel
```

### 2. 로그인 및 배포
```bash
vercel login
vercel --prod
```

### 3. 환경 변수 설정
Vercel 대시보드에서 환경 변수를 설정하세요:
- `VITE_TOSS_CLIENT_KEY`
- `VITE_TOSS_SECRET_KEY`

## 📱 향후 기능 추가 계획

- [ ] 월별/연별 통계 리포트
- [ ] 지출 패턴 분석
- [ ] 카테고리별 트렌드 차트
- [ ] 예산 추천 AI
- [ ] 다중 계정 연동
- [ ] 목표 저축액 설정
- [ ] CSV/Excel 내보내기
- [ ] 가계부 공유 기능
