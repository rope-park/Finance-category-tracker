import React, { type CSSProperties } from 'react';
import { colors, borderRadius } from '../../styles/theme';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'success' | 'warning' | 'error' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  darkMode?: boolean;
  onClick?: () => void;
  style?: CSSProperties;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  darkMode = false,
  onClick,
  style = {},
  className = '',
  type = 'button',
}) => {
  const sizeStyles = {
    sm: { padding: '8px 12px', fontSize: '13px', minHeight: '36px' },
    md: { padding: '12px 20px', fontSize: '14px', minHeight: '44px' },
    lg: { padding: '16px 24px', fontSize: '16px', minHeight: '52px' }
  };

  const getVariantStyles = () => ({
    primary: {
      background: darkMode 
        ? `linear-gradient(135deg, ${colors.primary[600]}, ${colors.primary[700]})` 
        : `linear-gradient(135deg, ${colors.primary[500]}, ${colors.primary[600]})`,
      color: 'white',
      border: 'none',
      boxShadow: darkMode 
        ? `0 4px 14px ${colors.primary[600]}33` 
        : `0 4px 14px ${colors.primary[500]}33`,
    },
    secondary: {
      backgroundColor: 'transparent',
      color: darkMode ? colors.gray[200] : colors.gray[700],
      border: `2px solid ${darkMode ? colors.gray[600] : colors.gray[300]}`,
      boxShadow: 'none',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: darkMode ? colors.primary[400] : colors.primary[600],
      border: 'none',
      boxShadow: 'none',
    },
    success: {
      background: darkMode 
        ? `linear-gradient(135deg, ${colors.success[600]}, ${colors.success[700]})` 
        : `linear-gradient(135deg, ${colors.success[500]}, ${colors.success[600]})`,
      color: 'white',
      border: 'none',
      boxShadow: darkMode 
        ? `0 4px 14px ${colors.success[600]}33` 
        : `0 4px 14px ${colors.success[500]}33`,
    },
    warning: {
      background: darkMode 
        ? `linear-gradient(135deg, ${colors.warning[600]}, ${colors.warning[700]})` 
        : `linear-gradient(135deg, ${colors.warning[500]}, ${colors.warning[600]})`,
      color: 'white',
      border: 'none',
      boxShadow: darkMode 
        ? `0 4px 14px ${colors.warning[600]}33` 
        : `0 4px 14px ${colors.warning[500]}33`,
    },
    error: {
      background: darkMode 
        ? `linear-gradient(135deg, ${colors.error[600]}, ${colors.error[700]})` 
        : `linear-gradient(135deg, ${colors.error[500]}, ${colors.error[600]})`,
      color: 'white',
      border: 'none',
      boxShadow: darkMode 
        ? `0 4px 14px ${colors.error[600]}33` 
        : `0 4px 14px ${colors.error[500]}33`,
    },
    gradient: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      border: 'none',
      boxShadow: '0 4px 14px rgba(102, 126, 234, 0.4)',
    }
  });

  const variantStyles = getVariantStyles();

  const baseStyle: CSSProperties = {
    ...sizeStyles[size],
    ...variantStyles[variant],
    borderRadius: borderRadius.lg,
    fontWeight: '600',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    fontFamily: "'Noto Sans KR', sans-serif",
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: fullWidth ? '100%' : 'auto',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    transform: 'translateY(0)',
    outline: 'none',
    position: 'relative',
    overflow: 'hidden',
    ...style
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled) {
      e.currentTarget.style.transform = 'translateY(-1px)';
      if (variant === 'primary' || variant === 'success' || variant === 'warning' || variant === 'error' || variant === 'gradient') {
        e.currentTarget.style.boxShadow = (variantStyles[variant].boxShadow as string) + ', 0 8px 25px rgba(0, 0, 0, 0.15)';
      }
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled) {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = variantStyles[variant].boxShadow as string || 'none';
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLButtonElement>) => {
    if (!disabled) {
      e.currentTarget.style.boxShadow = `0 0 0 3px ${
        variant === 'primary' ? colors.primary[200] :
        variant === 'success' ? colors.success[200] :
        variant === 'warning' ? colors.warning[200] :
        variant === 'error' ? colors.error[200] :
        colors.gray[200]
      }`;
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLButtonElement>) => {
    e.currentTarget.style.boxShadow = variantStyles[variant].boxShadow as string || 'none';
  };

  const renderIcon = () => {
    if (loading) {
      return (
        <div 
          style={{ 
            width: '16px',
            height: '16px',
            border: '2px solid currentColor',
            borderTop: '2px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            display: 'inline-block'
          }}
        />
      );
    }
    
    if (icon) {
      return <span style={{ fontSize: '16px' }}>{icon}</span>;
    }
    
    return null;
  };

  return (
    <button
      type={type}
      onClick={disabled || loading ? undefined : onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      disabled={disabled || loading}
      style={baseStyle}
      className={className}
    >
      {iconPosition === 'left' && renderIcon()}
      <span style={{ opacity: loading ? 0.7 : 1 }}>{children}</span>
      {iconPosition === 'right' && renderIcon()}
    </button>
  );
};

// 스핀 애니메이션을 위한 CSS
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);