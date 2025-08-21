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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-md animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        ))}
        <div className="col-span-full text-center text-gray-500">
          데이터를 불러오는 중...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
        <div className="text-red-600 text-center">{error}</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-8">
        <div className="text-gray-500 text-center">데이터가 없습니다.</div>
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* 총 수입 */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-sm font-medium text-gray-500 mb-2">총 수입</h3>
        <p className="text-2xl font-bold text-green-600">
          {formatCurrency(data.totalIncome).replace('₩', '')}원
        </p>
      </div>

      {/* 총 지출 */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-sm font-medium text-gray-500 mb-2">총 지출</h3>
        <p className="text-2xl font-bold text-red-600">
          {formatCurrency(data.totalExpense).replace('₩', '')}원
        </p>
      </div>

      {/* 잔액 */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-sm font-medium text-gray-500 mb-2">잔액</h3>
        <p className={`text-2xl font-bold ${isPositiveBalance ? 'text-green-600' : 'text-red-600'}`}>
          {formatCurrency(data.balance).replace('₩', '')}원
        </p>
      </div>

      {/* 전월 대비 변화 */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-sm font-medium text-gray-500 mb-2">전월 대비</h3>
        <p className={`text-2xl font-bold ${isPositiveChange ? 'text-green-600' : 'text-red-600'}`}>
          {isPositiveChange ? '+' : ''}{data.monthlyChange.toFixed(1)}%
        </p>
      </div>

      {/* 이번 달 거래 수 */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-sm font-medium text-gray-500 mb-2">이번 달 거래</h3>
        <p className="text-2xl font-bold text-blue-600">
          {data.transactionCount}개
        </p>
      </div>

      {/* 주요 지출 카테고리 */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-sm font-medium text-gray-500 mb-2">주요 지출 카테고리</h3>
        <p className="text-2xl font-bold text-purple-600">
          {data.topCategory}
        </p>
      </div>
    </div>
  );
};

export default DashboardSummary;
