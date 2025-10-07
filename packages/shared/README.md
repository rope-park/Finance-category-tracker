# Shared Package

Finance Tracker 애플리케이션을 위한 공유 패키지입니다. 상수, 타입, hooks, 유틸리티 함수들을 포함합니다.

## 📁 구조

```
packages/shared/
├── src/
│   ├── constants/          # 애플리케이션 상수들
│   │   ├── categories.ts   # 거래 카테고리 정의
│   │   ├── currencies.ts   # 통화 정의
│   │   ├── categoryUtils.ts # 카테고리 유틸리티 함수
│   │   ├── currencyUtils.ts # 통화 유틸리티 함수
│   │   └── index.ts
│   ├── types/              # TypeScript 타입 정의
│   │   ├── user.ts         # 사용자 관련 타입
│   │   ├── transactions.ts # 거래 관련 타입
│   │   ├── budget.ts       # 예산/목표 관련 타입
│   │   ├── api.ts          # API 응답 타입
│   │   ├── forms.ts        # 폼 관련 타입
│   │   ├── state.ts        # 상태 관리 타입
│   │   └── index.ts
│   ├── hooks/              # React Hooks
│   │   ├── useDebounce.ts  # 디바운스 hook
│   │   ├── useLocalStorage.ts # 로컬 스토리지 hook
│   │   ├── useCurrency.ts  # 통화 변환 hook
│   │   ├── useTransactions.ts # 거래 관리 hook
│   │   ├── useBudget.ts    # 예산 관리 hook
│   │   ├── useAsync.ts     # 비동기 상태 관리 hook
│   │   └── index.ts
│   ├── main.ts            # 메인 export 파일
│   └── index.ts
├── package.json
├── tsconfig.json
└── README.md
```

## 🚀 사용법

### 설치

```bash
# 프로젝트 루트에서
npm install
```

### Import 방법

```typescript
// 상수 사용
import { 
  INCOME_CATEGORIES, 
  EXPENSE_CATEGORIES, 
  CURRENCIES 
} from '@finance-tracker/shared';

// 타입 사용
import type { 
  Transaction, 
  Budget, 
  Category, 
  Currency 
} from '@finance-tracker/shared';

// Hooks 사용
import { 
  useTransactions, 
  useCurrency, 
  useDebounce 
} from '@finance-tracker/shared';

// 유틸리티 함수 사용
import { categoryUtils, currencyUtils } from '@finance-tracker/shared';
```

## 📊 주요 기능

### 1. 카테고리 시스템
- 36개의 미리 정의된 카테고리 (9개 수입 + 27개 지출)
- 카테고리별 메타데이터 (아이콘, 색상, 설명)
- 그룹화된 카테고리 구조

### 2. 통화 지원
- 달러, 유로, 엔화 등 이상의 주요 통화 지원
- 통화별 포맷팅 규칙
- 지역별 통화 그룹

### 3. React Hooks
- **useTransactions**: 거래 데이터 관리 및 분석
- **useBudget**: 예산 및 목표 관리
- **useCurrency**: 통화 변환 및 포맷팅
- **useAsync**: 비동기 상태 관리
- **useDebounce**: 입력값 디바운싱
- **useLocalStorage**: 로컬 스토리지 연동

### 4. 유틸리티 함수
- 카테고리 관련 헬퍼 함수
- 통화 포맷팅 및 변환 함수

## 🔧 개발

### 타입 체크
```bash
npm run type-check
```

### 빌드
```bash
npm run build
```

## 📝 예제

### 거래 관리
```typescript
import { useTransactions } from '@finance-tracker/shared';

function TransactionList() {
  const {
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getFilteredTransactions,
    getMonthlyStats
  } = useTransactions();

  // 거래 추가
  const handleAddTransaction = () => {
    addTransaction({
      category: 'food',
      amount: -15000,
      description: '점심식사',
      date: new Date().toISOString(),
    });
  };

  return (
    // JSX 컴포넌트
  );
}
```

### 통화 포맷팅
```typescript
import { useCurrency, currencyUtils } from '@finance-tracker/shared';

function PriceDisplay({ amount, currency = 'KRW' }) {
  const { formatCurrency } = useCurrency();
  
  return (
    <span>{formatCurrency(amount, currency)}</span>
  );
}
```

### 예산 관리
```typescript
import { useBudget } from '@finance-tracker/shared';

function BudgetDashboard() {
  const {
    budgets,
    addBudget,
    getBudgetAnalysis,
    getCategoryBudgetUsage
  } = useBudget();

  // 예산 분석 데이터 가져오기
  const analysis = getBudgetAnalysis(transactions);
  const usage = getCategoryBudgetUsage(transactions);

  return (
    // JSX 컴포넌트
  );
}
```

## 🤝 기여하기

새로운 상수나 타입을 추가할 때는:

1. 적절한 폴더에 파일을 생성
2. 타입 안전성을 보장
3. 관련 유틸리티 함수 추가
4. README 업데이트
5. 테스트 케이스 작성 (선택사항)

## 📄 라이센스

이 프로젝트는 MIT 라이센스 하에 있습니다.