/**
 * 대시보드 차트 컴포넌트
 * 
 * 주요 기능:
 * - 월별 수입/지출/잔액 추이를 보여주는 라인차트
 * - 카테고리별 지출 비중을 보여주는 파이차트
 * - 반응형 디자인으로 모든 화면 크기에 대응
 * - 인터랙티브 툴팁과 범례 제공
 * - 색상 코딩을 통한 직관적인 데이터 구분
 */

import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend, PieChart, Pie, Cell } from 'recharts';

// 월별 트렌드 데이터 타입 인터페이스
type TrendItem = {
  month: string;
  income: number;
  expense: number;
  balance: number;
};

// 카테고리별 지출 데이터 타입 인터페이스
type CategoryItem = {
  category_name: string;
  total_amount: number;
};

// DashboardCharts 컴포넌트의 Props 인터페이스
interface DashboardChartsProps {
  trend: TrendItem[];
  categories: CategoryItem[];
}

/**
 * DashboardCharts 컴포넌트
 * @param param0 - 대시보드 차트 컴포넌트의 Props
 * @returns 대시보드 차트 컴포넌트
 */
export const DashboardCharts: React.FC<DashboardChartsProps> = ({ trend, categories }) => {
  // 파이차트 색상 배열
  const COLORS = [
    '#0088FE', // 파란색 - 주요 카테고리
    '#00C49F', // 청록색 - 수입 관련
    '#FFBB28', // 노란색 - 생활비
    '#FF8042', // 주황색 - 식비
    '#A28BFE', // 보라색 - 문화/여가
    '#FF6B6B', // 빨간색 - 교통비
    '#FFD6E0', // 연한 분홍색 - 의료비
    '#B2F7EF', // 연한 청록색 - 교육비
    '#F7D6E0', // 연한 분홍색 - 기타
    '#A2E8DD'  // 연한 민트색 - 예비
  ];

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
