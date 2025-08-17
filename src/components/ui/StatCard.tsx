import React from 'react';
import { Card } from './Card';
import { colors } from '../../styles/theme';
import { useApp } from '../../hooks/useApp';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: string;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  subtitle,
  trend,
  onClick
}) => {
  const { darkMode } = useApp();
  
  return (
    <Card interactive={!!onClick} onClick={onClick}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        {icon && (
          <span style={{ fontSize: '24px' }}>{icon}</span>
        )}
        <h3 style={{
          fontSize: '18px',
          fontWeight: '600',
          color: darkMode ? colors.dark[100] : colors.gray[900],
          margin: 0,
          fontFamily: "'Noto Sans KR', sans-serif"
        }}>
          {title}
        </h3>
      </div>
      
      <div style={{ marginBottom: '8px' }}>
        <span style={{
          fontSize: '28px',
          fontWeight: '700',
          color: darkMode ? colors.dark[50] : colors.gray[900],
          fontFamily: "'Noto Sans KR', sans-serif"
        }}>
          {value}
        </span>
      </div>
      
      {subtitle && (
        <p style={{
          fontSize: '14px',
          color: darkMode ? colors.dark[400] : colors.gray[600],
          margin: '0 0 8px 0',
          fontFamily: "'Noto Sans KR', sans-serif"
        }}>
          {subtitle}
        </p>
      )}
      
      {trend && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <span style={{
            color: trend.isPositive ? colors.success[600] : colors.error[600],
            fontSize: '14px',
            fontWeight: '500'
          }}>
            {trend.isPositive ? '↗' : '↘'} {Math.abs(trend.value)}%
          </span>
          <span style={{
            fontSize: '12px',
            color: darkMode ? colors.dark[500] : colors.gray[500]
          }}>
            전월 대비
          </span>
        </div>
      )}
    </Card>
  );
};
