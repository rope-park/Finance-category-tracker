import React, { type CSSProperties } from 'react';
import { colors, shadows, borderRadius } from '../../styles/theme';
import { useApp } from '../../hooks/useApp';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: CSSProperties;
  interactive?: boolean;
  padding?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  variant?: 'default' | 'gradient' | 'glass' | 'elevated';
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  style = {},
  interactive = false,
  padding = 'md',
  onClick,
  variant = 'default',
  hoverable = false
}) => {
  const { darkMode } = useApp();
  
  const paddingValues = {
    sm: '16px',
    md: '24px',
    lg: '32px'
  };

  const getVariantStyle = () => {
    switch (variant) {
      case 'gradient':
        return {
          background: darkMode
            ? `linear-gradient(135deg, ${colors.dark[800]} 0%, ${colors.dark[900]} 100%)`
            : `linear-gradient(135deg, #ffffff 0%, ${colors.gray[50]} 100%)`,
          border: `1px solid ${darkMode ? colors.dark[700] : colors.gray[200]}`,
          boxShadow: darkMode 
            ? '0 4px 6px rgba(0, 0, 0, 0.3)' 
            : '0 4px 6px rgba(0, 0, 0, 0.05)'
        };
      case 'glass':
        return {
          background: darkMode
            ? 'rgba(31, 41, 55, 0.8)'
            : 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)',
          border: `1px solid ${darkMode ? 'rgba(75, 85, 99, 0.5)' : 'rgba(229, 231, 235, 0.5)'}`,
          boxShadow: darkMode 
            ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
            : '0 8px 32px rgba(0, 0, 0, 0.1)'
        };
      case 'elevated':
        return {
          backgroundColor: darkMode ? colors.dark[800] : '#ffffff',
          border: `1px solid ${darkMode ? colors.dark[700] : colors.gray[200]}`,
          boxShadow: darkMode
            ? '0 10px 25px rgba(0, 0, 0, 0.5)'
            : '0 10px 25px rgba(0, 0, 0, 0.1)'
        };
      default:
        return {
          backgroundColor: darkMode ? colors.dark[800] : '#ffffff',
          border: `1px solid ${darkMode ? colors.dark[700] : colors.gray[200]}`,
          boxShadow: darkMode ? 'none' : shadows.sm
        };
    }
  };

  const cardStyle: CSSProperties = {
    ...getVariantStyle(),
    borderRadius: borderRadius.xl,
    padding: paddingValues[padding],
    fontFamily: "'Noto Sans KR', sans-serif",
    transform: 'translateY(0)',
    cursor: (interactive || onClick || hoverable) ? 'pointer' : 'default',
    position: 'relative',
    overflow: 'hidden',
    ...style
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (interactive || onClick || hoverable) {
      e.currentTarget.style.transform = 'translateY(-3px)';
      
      if (variant === 'elevated') {
        e.currentTarget.style.boxShadow = darkMode
          ? '0 15px 35px rgba(0, 0, 0, 0.6)'
          : '0 15px 35px rgba(0, 0, 0, 0.15)';
      } else if (variant === 'glass') {
        e.currentTarget.style.boxShadow = darkMode 
          ? '0 12px 40px rgba(0, 0, 0, 0.4)' 
          : '0 12px 40px rgba(0, 0, 0, 0.15)';
      } else {
        e.currentTarget.style.boxShadow = darkMode 
          ? '0 8px 25px rgba(0, 0, 0, 0.4)' 
          : '0 8px 25px rgba(0, 0, 0, 0.15)';
      }
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    if (interactive || onClick || hoverable) {
      e.currentTarget.style.transform = 'translateY(0)';
      const variantStyle = getVariantStyle();
      e.currentTarget.style.boxShadow = variantStyle.boxShadow as string || 'none';
    }
  };

  return (
    <div
      className={className}
      style={cardStyle}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
};
