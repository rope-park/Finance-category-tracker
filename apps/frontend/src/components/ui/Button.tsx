/**
 * 재사용 가능한 버튼 컴포넌트
 * 
 * 주요 기능:
 * - 다양한 버튼 스타일 (primary, secondary, ghost, success, warning, error, gradient)
 * - 3가지 크기 옵션 (sm, md, lg)
 * - 로딩 상태 지원
 * - 아이콘 지원 (왼쪽/오른쪽 위치)
 * - 다크모드 대응
 * - 접근성 지원 (ARIA 속성)
 * 
 * @author Finance Category Tracker Team
 * @version 1.0.0
 */

import React, { type CSSProperties } from 'react';
import { colors, borderRadius } from '../../styles/theme';

/** Button 컴포넌트 Props */
interface ButtonProps {
  /** 버튼 내용 (텍스트, 아이콘 등) */
  children: React.ReactNode;
  /** 버튼 스타일 변형 */
  variant?: 'primary' | 'secondary' | 'ghost' | 'success' | 'warning' | 'error' | 'gradient';
  /** 버튼 크기 */
  size?: 'sm' | 'md' | 'lg';
  /** 비활성화 여부 */
  disabled?: boolean;
  /** 로딩 상태 여부 */
  loading?: boolean;
  /** 아이콘 문자열 */
  icon?: string;
  /** 아이콘 위치 */
  iconPosition?: 'left' | 'right';
  /** 전체 너비 사용 여부 */
  fullWidth?: boolean;
  /** 다크모드 사용 여부 */
  darkMode?: boolean;
  /** 클릭 이벤트 핸들러 */
  onClick?: () => void;
  /** 커스텀 스타일 */
  style?: CSSProperties;
  /** 커스텀 CSS 클래스 */
  className?: string;
  /** 버튼 HTML 타입 */
  type?: 'button' | 'submit' | 'reset';
  /** 접근성: 버튼 라벨 */
  'aria-label'?: string;
  /** 접근성: 설명 요소 ID */
  'aria-describedby'?: string;
  /** 접근성: 확장 상태 */
  'aria-expanded'?: boolean;
  /** 접근성: 눌린 상태 */
  'aria-pressed'?: boolean;
  /** 접근성: 역할 */
  role?: string;
  /** 접근성: 탭 순서 */
  tabIndex?: number;
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
  ...rest
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
    transform: 'translateY(0)',
    outline: 'none',
    position: 'relative',
    overflow: 'hidden',
    minHeight: '44px', // 모바일 터치 영역 확대
    minWidth: '44px',
    touchAction: 'manipulation',
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
      className={`ui-btn ${className}`.trim()}
      aria-busy={loading ? 'true' : undefined}
      aria-disabled={disabled ? 'true' : undefined}
      tabIndex={disabled ? -1 : 0}
      {...rest}
    >
      {iconPosition === 'left' && renderIcon()}
      <span style={{ opacity: loading ? 0.7 : 1 }}>{children}</span>
      {iconPosition === 'right' && renderIcon()}
      {loading && (
        <span 
          style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, overflow: 'hidden' }} 
          aria-live="polite"
          role="status"
        >
          로딩 중
        </span>
      )}
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