import React from 'react';
import { Card } from './Card';
import { colors } from '../../styles/theme';
import { useApp } from '../../hooks/useApp';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: string | number;
    trend: 'up' | 'down' | 'neutral';
  };
  icon?: string;
  color?: 'blue' | 'green' | 'red' | 'purple' | 'orange';
  onClick?: () => void;
  className?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  icon,
  color = 'blue',
  onClick,
  className = ''
}) => {
  const { darkMode } = useApp();

  const colorStyles = {
    blue: {
      gradient: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
      light: darkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)',
      text: darkMode ? '#60A5FA' : '#2563EB'
    },
    green: {
      gradient: 'linear-gradient(135deg, #10B981, #059669)',
      light: darkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)',
      text: darkMode ? '#34D399' : '#059669'
    },
    red: {
      gradient: 'linear-gradient(135deg, #EF4444, #DC2626)',
      light: darkMode ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)',
      text: darkMode ? '#F87171' : '#DC2626'
    },
    purple: {
      gradient: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
      light: darkMode ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.1)',
      text: darkMode ? '#A78BFA' : '#7C3AED'
    },
    orange: {
      gradient: 'linear-gradient(135deg, #F59E0B, #D97706)',
      light: darkMode ? 'rgba(245, 158, 11, 0.2)' : 'rgba(245, 158, 11, 0.1)',
      text: darkMode ? '#FCD34D' : '#D97706'
    }
  };

  const changeColors = {
    up: darkMode ? '#34D399' : '#059669',
    down: darkMode ? '#F87171' : '#DC2626',
    neutral: darkMode ? '#9CA3AF' : '#6B7280'
  };

  const changeIcons = {
    up: '📈',
    down: '📉',
    neutral: '➡️'
  };

  return (
    <Card
      variant="elevated"
      onClick={onClick}
      hoverable={!!onClick}
      className={`overflow-hidden ${className}`}
      style={{ position: 'relative' }}
    >
      {/* 배경 데코레이션 */}
      <div 
        style={{
          position: 'absolute',
          top: '-20px',
          right: '-20px',
          width: '80px',
          height: '80px',
          background: colorStyles[color].gradient,
          borderRadius: '50%',
          opacity: 0.1,
          transform: 'rotate(45deg)'
        }}
      />
      
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* 헤더 */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          marginBottom: '16px' 
        }}>
          <p className="text-sm readable-text" style={{ 
            fontWeight: '500',
            color: darkMode ? colors.gray[400] : colors.gray[600],
            margin: 0
          }}>
            {title}
          </p>
          {icon && (
            <div style={{
              width: '40px',
              height: '40px',
              background: colorStyles[color].gradient,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              boxShadow: `0 4px 12px ${colorStyles[color].light}`
            }}>
              {icon}
            </div>
          )}
        </div>

        {/* 메인 값 */}
        <div style={{ marginBottom: '12px' }}>
          <h3 className="text-3xl high-contrast" style={{ 
            fontWeight: '700',
            color: darkMode ? '#ffffff' : colors.gray[900],
            margin: 0,
            lineHeight: 1
          }}>
            {value}
          </h3>
        </div>

        {/* 변화량 */}
        {change && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px' 
          }}>
            <span style={{ fontSize: '16px' }}>
              {changeIcons[change.trend]}
            </span>
            <span className="text-sm high-contrast" style={{ 
              fontWeight: '600',
              color: changeColors[change.trend]
            }}>
              {change.value}
            </span>
            <span className="text-xs" style={{ 
              color: darkMode ? colors.gray[500] : colors.gray[500]
            }}>
              vs 지난달
            </span>
          </div>
        )}
      </div>
    </Card>
  );
};