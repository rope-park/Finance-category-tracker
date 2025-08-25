import React from 'react';

interface SummaryData {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  monthlyChange: number;
  transactionCount: number;
  topCategory: string;
}

interface DashboardSummaryProps {
  data: SummaryData | null;
  isLoading?: boolean;
  error?: string;
}

const DashboardSummary: React.FC<DashboardSummaryProps> = ({ 
  data, 
  isLoading = false, 
  error 
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="p-6 bg-white rounded-lg shadow-md animate-pulse">
            <div className="h-4 mb-2 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        ))}
        <div className="text-center text-gray-500 col-span-full">
          데이터를 불러오는 중...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 mb-8 border border-red-200 rounded-lg bg-red-50">
        <div className="text-center text-red-600">{error}</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-4 mb-8 border border-gray-200 rounded-lg bg-gray-50">
        <div className="text-center text-gray-500">데이터가 없습니다.</div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const isPositiveBalance = data.balance >= 0;
  const isPositiveChange = data.monthlyChange >= 0;

  return (
    <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3">
      {/* 총 수입 */}
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h3 className="mb-2 text-sm font-medium text-gray-500">총 수입</h3>
        <p className="text-2xl font-bold text-green-600">
          {formatCurrency(data.totalIncome).replace('₩', '')}원
        </p>
      </div>

      {/* 총 지출 */}
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h3 className="mb-2 text-sm font-medium text-gray-500">총 지출</h3>
        <p className="text-2xl font-bold text-red-600">
          {formatCurrency(data.totalExpense).replace('₩', '')}원
        </p>
      </div>

      {/* 잔액 */}
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h3 className="mb-2 text-sm font-medium text-gray-500">잔액</h3>
        <p className={`text-2xl font-bold ${isPositiveBalance ? 'text-green-600' : 'text-red-600'}`}>
          {formatCurrency(data.balance).replace('₩', '')}원
        </p>
      </div>

      {/* 전월 대비 변화 */}
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h3 className="mb-2 text-sm font-medium text-gray-500">전월 대비</h3>
        <p className={`text-2xl font-bold ${isPositiveChange ? 'text-green-600' : 'text-red-600'}`}>
          {isPositiveChange ? '+' : ''}{data.monthlyChange.toFixed(1)}%
        </p>
      </div>

      {/* 이번 달 거래 수 */}
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h3 className="mb-2 text-sm font-medium text-gray-500">이번 달 거래</h3>
        <p className="text-2xl font-bold text-blue-600">
          {data.transactionCount}개
        </p>
      </div>

      {/* 주요 지출 카테고리 */}
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h3 className="mb-2 text-sm font-medium text-gray-500">주요 지출 카테고리</h3>
        <p className="text-2xl font-bold text-purple-600">
          {data.topCategory}
        </p>
      </div>
    </div>
  );
};

export default DashboardSummary;
