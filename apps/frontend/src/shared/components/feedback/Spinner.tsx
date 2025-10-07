/**
 * 스피너 컴포넌트
 */
import React from 'react';

// 스피너 컴포넌트 props 정의
interface SpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  className?: string;
}

/**
 * 스피너 컴포넌트
 * @param param0 - 스피너 컴포넌트 props
 * @returns 스피너 컴포넌트
 */
export const Spinner: React.FC<SpinnerProps> = ({ 
  size = 'medium', 
  color = '#3B82F6',
  className = ''
}) => {
  const sizeMap = {
    small: '16px',
    medium: '24px',
    large: '32px'
  };

  return (
    <div
      className={className}
      style={{
        width: sizeMap[size],
        height: sizeMap[size],
        border: `2px solid #E5E7EB`,
        borderTop: `2px solid ${color}`,
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }}
    >
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};
