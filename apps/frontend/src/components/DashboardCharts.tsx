import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend, PieChart, Pie, Cell } from 'recharts';

type TrendItem = {
  month: string;
  income: number;
  expense: number;
  balance: number;
};

type CategoryItem = {
  category_name: string;
  total_amount: number;
};

interface DashboardChartsProps {
  trend: TrendItem[];
  categories: CategoryItem[];
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({ trend, categories }) => {
  // trend: [{ month, income, expense, balance }]
  // categories: [{ category_name, total_amount }]
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28BFE', '#FF6B6B', '#FFD6E0', '#B2F7EF', '#F7D6E0', '#A2E8DD'];

  return (
    <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', marginBottom: 32 }}>
      {/* 월별 수입/지출/잔액 라인차트 */}
      <div style={{ flex: 1, minWidth: 350, height: 300 }}>
        <h4 style={{ margin: '0 0 8px 0' }}>월별 수입/지출/잔액</h4>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={trend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="income" stroke="#00C49F" name="수입" />
            <Line type="monotone" dataKey="expense" stroke="#FF6B6B" name="지출" />
            <Line type="monotone" dataKey="balance" stroke="#0088FE" name="잔액" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {/* 카테고리별 지출 파이차트 */}
      <div style={{ flex: 1, minWidth: 350, height: 300 }}>
        <h4 style={{ margin: '0 0 8px 0' }}>카테고리별 지출 비중</h4>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie data={categories} dataKey="total_amount" nameKey="category_name" cx="50%" cy="50%" outerRadius={80} label>
              {categories.map((_, idx) => (
                <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
