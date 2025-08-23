import React, { useState, useEffect } from 'react';
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

const AnalyticsChart: React.FC<AnalyticsChartProps> = ({ 
  transactions, 
  type, 
  period = 'month' 
}) => {
  

  const [chartData, setChartData] = useState<ChartData<'line'> | ChartData<'bar'> | ChartData<'doughnut'> | null>(null);

  useEffect(() => {
    if (!transactions.length) return;

    switch (type) {
      case 'monthly-trend':
        setChartData(generateMonthlyTrendData(transactions));
        break;
      case 'category-breakdown':
        setChartData(generateCategoryBreakdownData(transactions));
        break;
      case 'income-vs-expense':
        setChartData(generateIncomeVsExpenseData(transactions));
        break;
      case 'forecast':
        setChartData(generateForecastData(transactions));
        break;
    }
  }, [transactions, type, period]);
  // 최근 6개월 평균을 기반으로 다음 달 예측(수입/지출)
  const generateForecastData = (transactions: Transaction[]) => {
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
      const monthIndex = last6Months.findIndex(month => {
        const monthDate = new Date();
        monthDate.setMonth(monthDate.getMonth() - (5 - last6Months.indexOf(month)));
        return transactionDate.getMonth() === monthDate.getMonth() &&
               transactionDate.getFullYear() === monthDate.getFullYear();
      });
      if (monthIndex !== -1) {
        if (transaction.transaction_type === 'income') {
          last6Months[monthIndex].income += transaction.amount;
        } else {
          last6Months[monthIndex].expense += Math.abs(transaction.amount);
        }
      }
    });
    // 예측값: 최근 6개월 평균
    const avgIncome = Math.round(last6Months.reduce((sum, m) => sum + m.income, 0) / 6);
    const avgExpense = Math.round(last6Months.reduce((sum, m) => sum + m.expense, 0) / 6);
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1).toLocaleDateString('ko-KR', { month: 'short' });
    const labels = [...last6Months.map(m => m.month), nextMonth];
    return {
      labels,
      datasets: [
        {
          label: '수입',
          data: [...last6Months.map(m => m.income), avgIncome],
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          borderDash: [0, 0, 0, 0, 0, 0, 6], // 마지막(예측) 점선
          tension: 0.1
        },
        {
          label: '지출',
          data: [...last6Months.map(m => m.expense), avgExpense],
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          borderDash: [0, 0, 0, 0, 0, 0, 6],
          tension: 0.1
        }
      ]
    };
  };

  const generateMonthlyTrendData = (transactions: Transaction[]) => {
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
      const monthIndex = last6Months.findIndex(month => {
        const monthDate = new Date();
        monthDate.setMonth(monthDate.getMonth() - (5 - last6Months.indexOf(month)));
        return transactionDate.getMonth() === monthDate.getMonth() && 
               transactionDate.getFullYear() === monthDate.getFullYear();
      });

      if (monthIndex !== -1) {
        if (transaction.transaction_type === 'income') {
          last6Months[monthIndex].income += transaction.amount;
        } else {
          last6Months[monthIndex].expense += Math.abs(transaction.amount);
        }
      }
    });

    return {
      labels: last6Months.map(month => month.month),
      datasets: [
        {
          label: '수입',
          data: last6Months.map(month => month.income),
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          tension: 0.1
        },
        {
          label: '지출',
          data: last6Months.map(month => month.expense),
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          tension: 0.1
        }
      ]
    };
  };

  const generateCategoryBreakdownData = (transactions: Transaction[]) => {
    const categoryTotals: { [key: string]: number } = {};
    const expenseTransactions = transactions.filter(t => t.transaction_type === 'expense');

    expenseTransactions.forEach(transaction => {
      const category = transaction.category_key || '기타';
      categoryTotals[category] = (categoryTotals[category] || 0) + Math.abs(transaction.amount);
    });

    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);
    
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
      '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'
    ];

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: colors.slice(0, labels.length),
          borderColor: colors.slice(0, labels.length),
          borderWidth: 2
        }
      ]
    };
  };

  const generateIncomeVsExpenseData = (transactions: Transaction[]) => {
    const totalIncome = transactions
      .filter(t => t.transaction_type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpense = transactions
      .filter(t => t.transaction_type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    return {
      labels: ['수입', '지출'],
      datasets: [
        {
          data: [totalIncome, totalExpense],
          backgroundColor: ['#22C55E', '#EF4444'],
          borderColor: ['#16A34A', '#DC2626'],
          borderWidth: 2
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true
        }
      },
      tooltip: {
        callbacks: {
          label: function(
            context: import('chart.js').TooltipItem<'line' | 'bar' | 'doughnut'>
          ) {
            if (type === 'category-breakdown' || type === 'income-vs-expense') {
              return `${context.label}: ${context.parsed.toLocaleString()}원`;
            }
            return `${context.dataset.label || ''}: ${context.parsed.toLocaleString()}원`;
          }
        }
      }
    },
    scales: type === 'monthly-trend' ? {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: string | number) {
            return Number(value).toLocaleString() + '원';
          }
        }
      }
    } : {}
  };

  if (!chartData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">차트를 생성하는 중...</div>
      </div>
    );
  }

  return (
    <div className="h-64">
      {type === 'monthly-trend' && <Line data={chartData as ChartData<'line'>} options={chartOptions} />}
      {type === 'category-breakdown' && <Doughnut data={chartData as ChartData<'doughnut'>} options={chartOptions} />}
      {type === 'income-vs-expense' && <Bar data={chartData as ChartData<'bar'>} options={chartOptions} />}
      {type === 'forecast' && <Line data={chartData as ChartData<'line'>} options={chartOptions} />}
    </div>
  );
};

export default AnalyticsChart;
