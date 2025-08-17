import React from 'react';
import { colors } from '../../styles/theme';

interface ProgressBarProps {
  percentage: number;
  color?: 'success' | 'warning' | 'error' | 'primary';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  animated?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  percentage,
  color = 'primary',
  size = 'md',
  showLabel = false,
  animated = false
}) => {
  const sizeMap = {
    sm: '4px',
    md: '8px',
    lg: '12px'
  };
  
  const colorMap = {
    success: colors.success[600],
    warning: colors.warning[500],
    error: colors.error[600],
    primary: colors.primary[600]
  };
  
  const getColor = () => {
    if (percentage >= 90) return colors.error[600];
    if (percentage >= 80) return colors.warning[500];
    return colorMap[color];
  };
  
  const clampedPercentage = Math.min(Math.max(percentage, 0), 100);
  
  return (
    <div style={{ width: '100%' }}>
      <div style={{
        width: '100%',
        height: sizeMap[size],
        backgroundColor: colors.gray[200],
        borderRadius: '9999px',
        overflow: 'hidden',
        position: 'relative'
      }}>
        <div
          style={{
            height: '100%',
            width: `${clampedPercentage}%`,
            backgroundColor: getColor(),
            borderRadius: '9999px',
            transition: animated ? 'width 0.5s ease-in-out' : 'none'
          }}
        />
      </div>
      
      {showLabel && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '4px',
          fontSize: '12px',
          color: colors.gray[600]
        }}>
          <span>{clampedPercentage.toFixed(1)}%</span>
        </div>
      )}
    </div>
  );
};
