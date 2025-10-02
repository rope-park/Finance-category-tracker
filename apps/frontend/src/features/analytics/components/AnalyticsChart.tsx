import React, { useMemo, memo } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  Title, 
  Tooltip, 
  Legend,
  ArcElement 
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import type { ChartData } from 'chart.js';
import ChartErrorBoundary from '../../analytics/components/ChartErrorBoundary';

// Chart.js 등록
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface Transaction {
  id: number;
  amount: number;
  description: string;
  category_key: string;
  transaction_date: string;
  transaction_type: 'income' | 'expense';
}

interface AnalyticsChartProps {
  transactions: Transaction[];
  type: 'monthly-trend' | 'category-breakdown' | 'income-vs-expense' | 'forecast';
  period?: 'week' | 'month' | 'year';
}

// 월별 트렌드 데이터 생성 함수
const generateMonthlyTrendData = (transactions: Transaction[]): ChartData<'line'> | null => {
  if (!transactions || transactions.length === 0) {
    return null;
  }

  const monthlyData: { [key: string]: { income: number; expense: number } } = {};
  
  transactions.forEach(transaction => {
    if (!transaction || !transaction.transaction_date || typeof transaction.amount !== 'number') {
      return; // 잘못된 데이터 건너뛰기
    }
    
    let date;
    try {
      date = new Date(transaction.transaction_date);
      if (isNaN(date.getTime())) {
        return; // 잘못된 날짜 건너뛰기
      }
    } catch {
      return; // 날짜 파싱 오류 건너뛰기
    }
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { income: 0, expense: 0 };
    }
    
    if (transaction.transaction_type === 'income') {
      monthlyData[monthKey].income += transaction.amount;
    } else {
      monthlyData[monthKey].expense += transaction.amount;
    }
  });

  const sortedMonths = Object.keys(monthlyData).sort();
  
  if (sortedMonths.length === 0) {
    return null;
  }

  const labels = sortedMonths.map(month => {
    const [year, monthNum] = month.split('-');
    return `${year}년 ${monthNum}월`;
  });

  return {
    labels,
    datasets: [
      {
        label: '수입',
        data: sortedMonths.map(month => monthlyData[month].income),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.1,
      },
      {
        label: '지출',
        data: sortedMonths.map(month => monthlyData[month].expense),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.1,
      }
    ],
  };
};

const generateCategoryBreakdownData = (transactions: Transaction[]): ChartData<'doughnut'> | null => {
  if (!transactions || transactions.length === 0) {
    return null;
  }

  const categoryData: { [key: string]: number } = {};
  
  transactions
    .filter(t => t && t.transaction_type === 'expense' && t.amount && t.category_key)
    .forEach(transaction => {
      categoryData[transaction.category_key] = (categoryData[transaction.category_key] || 0) + transaction.amount;
    });

  const categoryKeys = Object.keys(categoryData);
  
  if (categoryKeys.length === 0) {
    return null;
  }

  const colors = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
    '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
  ];

  return {
    labels: categoryKeys,
    datasets: [{
      data: Object.values(categoryData),
      backgroundColor: colors.slice(0, Object.keys(categoryData).length),
      borderWidth: 2,
      borderColor: '#fff',
    }],
  };
};

const generateIncomeVsExpenseData = (transactions: Transaction[]): ChartData<'bar'> | null => {
  if (!transactions || transactions.length === 0) {
    return null;
  }

  const last6Months: { month: string; income: number; expense: number }[] = [];
  const now = new Date();
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    last6Months.push({
      month: date.toLocaleDateString('ko-KR', { month: 'short' }),
      income: 0,
      expense: 0
    });
  }

  transactions.forEach(transaction => {
    const transactionDate = new Date(transaction.transaction_date);
    const monthIndex = last6Months.findIndex(m => {
      const targetDate = new Date(now.getFullYear(), now.getMonth() - (5 - last6Months.indexOf(m)), 1);
      return transactionDate.getMonth() === targetDate.getMonth() && 
             transactionDate.getFullYear() === targetDate.getFullYear();
    });

    if (monthIndex !== -1) {
      if (transaction.transaction_type === 'income') {
        last6Months[monthIndex].income += transaction.amount;
      } else {
        last6Months[monthIndex].expense += transaction.amount;
      }
    }
  });

  return {
    labels: last6Months.map(m => m.month),
    datasets: [
      {
        label: '수입',
        data: last6Months.map(m => m.income),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 1,
      },
      {
        label: '지출',
        data: last6Months.map(m => m.expense),
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 1,
      }
    ],
  };
};

const generateForecastData = (transactions: Transaction[]): ChartData<'line'> | null => {
  if (!transactions || transactions.length === 0) {
    return null;
  }

  const last6Months: { month: string; income: number; expense: number }[] = [];
  const now = new Date();
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    last6Months.push({
      month: date.toLocaleDateString('ko-KR', { month: 'short' }),
      income: 0,
      expense: 0
    });
  }

  transactions.forEach(transaction => {
    const transactionDate = new Date(transaction.transaction_date);
    const monthIndex = last6Months.findIndex(m => {
      const targetDate = new Date(now.getFullYear(), now.getMonth() - (5 - last6Months.indexOf(m)), 1);
      return transactionDate.getMonth() === targetDate.getMonth() && 
             transactionDate.getFullYear() === targetDate.getFullYear();
    });

    if (monthIndex !== -1) {
      if (transaction.transaction_type === 'income') {
        last6Months[monthIndex].income += transaction.amount;
      } else {
        last6Months[monthIndex].expense += transaction.amount;
      }
    }
  });

  // 평균 계산
  const avgIncome = last6Months.reduce((sum, m) => sum + m.income, 0) / 6;
  const avgExpense = last6Months.reduce((sum, m) => sum + m.expense, 0) / 6;

  // 다음 달 예측 추가
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const labels = [
    ...last6Months.map(m => m.month),
    nextMonth.toLocaleDateString('ko-KR', { month: 'short' }) + ' (예측)'
  ];

  return {
    labels,
    datasets: [
      {
        label: '실제 수입',
        data: [...last6Months.map(m => m.income), null],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.1,
      },
      {
        label: '실제 지출',
        data: [...last6Months.map(m => m.expense), null],
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.1,
      },
      {
        label: '예상 수입',
        data: [...Array(6).fill(null), avgIncome],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.3)',
        borderDash: [5, 5],
        tension: 0.1,
      },
      {
        label: '예상 지출',
        data: [...Array(6).fill(null), avgExpense],
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.3)',
        borderDash: [5, 5],
        tension: 0.1,
      }
    ],
  };
};

// 차트 옵션 상수로 이동하여 메모리 최적화
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const chartOptions: any = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    tooltip: {
      mode: 'index' as const,
      intersect: false,
      callbacks: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        label: function(context: any) {
          return `${context.dataset.label}: ${Number(context.parsed.y).toLocaleString()}원`;
        }
      }
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        callback: function(value: any) {
          return Number(value).toLocaleString() + '원';
        }
      }
    }
  },
  interaction: {
    intersect: false,
  },
};

const AnalyticsChart: React.FC<AnalyticsChartProps> = memo(({ 
  transactions, 
  type
}) => {
  // 데이터 처리 최적화 - useMemo로 계산 결과 캐시
  const chartData = useMemo(() => {
    if (!transactions.length) return null;

    switch (type) {
      case 'monthly-trend':
        return generateMonthlyTrendData(transactions);
      case 'category-breakdown':
        return generateCategoryBreakdownData(transactions);
      case 'income-vs-expense':
        return generateIncomeVsExpenseData(transactions);
      case 'forecast':
        return generateForecastData(transactions);
      default:
        return null;
    }
  }, [transactions, type]);

  if (!chartData) {
    return (
      <div className="flex items-center justify-center h-64 rounded-lg bg-gray-50">
        <div className="text-gray-500">차트를 생성하는 중...</div>
      </div>
    );
  }

  return (
    <ChartErrorBoundary>
      <div className="h-64">
        {type === 'monthly-trend' && chartData && (
          <Line 
            data={chartData as ChartData<'line'>} 
            options={chartOptions} 
            key={`monthly-trend-${transactions.length}`}
          />
        )}
        {type === 'category-breakdown' && chartData && (
          <Doughnut 
            data={chartData as ChartData<'doughnut'>} 
            options={chartOptions}
            key={`category-breakdown-${transactions.length}`}
          />
        )}
        {type === 'income-vs-expense' && chartData && (
          <Bar 
            data={chartData as ChartData<'bar'>} 
            options={chartOptions}
            key={`income-vs-expense-${transactions.length}`}
          />
        )}
        {type === 'forecast' && chartData && (
          <Line 
            data={chartData as ChartData<'line'>} 
            options={chartOptions}
            key={`forecast-${transactions.length}`}
          />
        )}
      </div>
    </ChartErrorBoundary>
  );
});

AnalyticsChart.displayName = 'AnalyticsChart';

export default AnalyticsChart;