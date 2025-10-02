import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../../app/hooks/useApp';
import { colors, shadows, borderRadius, animation } from '../../../styles/theme';

interface TooltipProps {
  children: React.ReactNode;
  text: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  disabled?: boolean;
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  children,
  text,
  position = 'top',
  delay = 300,
  disabled = false,
  className = ''
}) => {
  const { darkMode } = useApp();
  const [isVisible, setIsVisible] = useState(false);
  const [shouldShow, setShouldShow] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const showTooltip = () => {
    if (disabled || !text) return;
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setShouldShow(true);
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
    setTimeout(() => setShouldShow(false), 150); // 애니메이션 완료 후 DOM에서 제거
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const getTooltipStyle = () => {
    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      zIndex: 1000,
      padding: '8px 12px',
      backgroundColor: darkMode ? colors.dark[700] : colors.gray[900],
      color: darkMode ? colors.dark[50] : '#ffffff',
      fontSize: '12px',
      lineHeight: '1.4',
      borderRadius: borderRadius.md,
      boxShadow: darkMode ? shadows.lg : shadows.xl,
      opacity: isVisible ? 1 : 0,
      transform: `scale(${isVisible ? 1 : 0.95})`,
      transition: animation.transition.fast,
      pointerEvents: 'none',
      maxWidth: '200px',
      wordWrap: 'break-word',
      whiteSpace: 'normal'
    };

    // 위치에 따른 스타일 조정
    switch (position) {
      case 'top':
        return {
          ...baseStyle,
          bottom: '100%',
          left: '50%',
          transform: `translateX(-50%) scale(${isVisible ? 1 : 0.95})`,
          marginBottom: '8px'
        };
      case 'bottom':
        return {
          ...baseStyle,
          top: '100%',
          left: '50%',
          transform: `translateX(-50%) scale(${isVisible ? 1 : 0.95})`,
          marginTop: '8px'
        };
      case 'left':
        return {
          ...baseStyle,
          right: '100%',
          top: '50%',
          transform: `translateY(-50%) scale(${isVisible ? 1 : 0.95})`,
          marginRight: '8px'
        };
      case 'right':
        return {
          ...baseStyle,
          left: '100%',
          top: '50%',
          transform: `translateY(-50%) scale(${isVisible ? 1 : 0.95})`,
          marginLeft: '8px'
        };
      default:
        return baseStyle;
    }
  };

  const getArrowStyle = () => {
    const arrowSize = 6;
    const arrowColor = darkMode ? colors.dark[700] : colors.gray[900];
    
    const baseArrowStyle: React.CSSProperties = {
      position: 'absolute',
      width: 0,
      height: 0,
      borderStyle: 'solid'
    };

    switch (position) {
      case 'top':
        return {
          ...baseArrowStyle,
          top: '100%',
          left: '50%',
          marginLeft: `-${arrowSize}px`,
          borderLeftWidth: `${arrowSize}px`,
          borderRightWidth: `${arrowSize}px`,
          borderTopWidth: `${arrowSize}px`,
          borderBottomWidth: 0,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderTopColor: arrowColor,
          borderBottomColor: 'transparent'
        };
      case 'bottom':
        return {
          ...baseArrowStyle,
          bottom: '100%',
          left: '50%',
          marginLeft: `-${arrowSize}px`,
          borderLeftWidth: `${arrowSize}px`,
          borderRightWidth: `${arrowSize}px`,
          borderTopWidth: 0,
          borderBottomWidth: `${arrowSize}px`,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderTopColor: 'transparent',
          borderBottomColor: arrowColor
        };
      case 'left':
        return {
          ...baseArrowStyle,
          left: '100%',
          top: '50%',
          marginTop: `-${arrowSize}px`,
          borderTopWidth: `${arrowSize}px`,
          borderBottomWidth: `${arrowSize}px`,
          borderLeftWidth: `${arrowSize}px`,
          borderRightWidth: 0,
          borderTopColor: 'transparent',
          borderBottomColor: 'transparent',
          borderLeftColor: arrowColor,
          borderRightColor: 'transparent'
        };
      case 'right':
        return {
          ...baseArrowStyle,
          right: '100%',
          top: '50%',
          marginTop: `-${arrowSize}px`,
          borderTopWidth: `${arrowSize}px`,
          borderBottomWidth: `${arrowSize}px`,
          borderLeftWidth: 0,
          borderRightWidth: `${arrowSize}px`,
          borderTopColor: 'transparent',
          borderBottomColor: 'transparent',
          borderLeftColor: 'transparent',
          borderRightColor: arrowColor
        };
      default:
        return baseArrowStyle;
    }
  };

  // 접근성: id, aria-describedby, role, tabIndex 등 적용
  const tooltipId = `tooltip-${Math.random().toString(36).substr(2, 9)}`;
  return (
    <div
      ref={containerRef}
      className={className}
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
      tabIndex={0}
      aria-describedby={tooltipId}
      role="button"
    >
      {children}
      {shouldShow && (
        <div
          ref={tooltipRef}
          style={getTooltipStyle()}
          id={tooltipId}
          role="tooltip"
          aria-live="polite"
        >
          {text}
          <div style={getArrowStyle()} />
        </div>
      )}
    </div>
  );
};

export default Tooltip;
