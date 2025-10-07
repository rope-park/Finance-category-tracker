/**
 * 금액 표시 컴포넌트
 */
import React, { useState } from 'react';
import { useApp } from '../../../app/hooks/useApp';
import { colors } from '../../../styles/theme';

// AmountDisplay 컴포넌트의 Props 타입 정의
interface AmountDisplayProps {
  amount: number;                                
  type?: 'income' | 'expense' | 'neutral';        
  size?: 'sm' | 'md' | 'lg';                  
  showCurrency?: boolean;                      
  style?: React.CSSProperties;                  
  onClick?: () => void;                      
}

// AmountDisplay 메인 컴포넌트
export const AmountDisplay: React.FC<AmountDisplayProps> = ({ 
  amount, 
  type = 'neutral',       // 기본값: 중립 (회색)
  size = 'md',            // 기본값: 중간 크기
  showCurrency = true,    // 기본값: 통화 단위 표시
  style = {},             // 기본값: 빈 스타일 객체
  onClick
}) => {
  const { amountHidden, darkMode } = useApp();
  const [temporarilyVisible, setTemporarilyVisible] = useState(false);

  console.log('💰 AmountDisplay 렌더링:', { 
    amount, 
    type, 
    amountHidden, 
    temporarilyVisible 
  });

  const formatAmount = (value: number) => {
    return new Intl.NumberFormat('ko-KR').format(Math.abs(value));
  };

  const getColor = () => {
    switch (type) {
      case 'income':    // 수입: 녹색 계열
        return darkMode ? colors.success[400] : colors.success[600];
      case 'expense':   // 지출: 빨간색 계열  
        return darkMode ? colors.error[400] : colors.error[600];
      default:          // 중립: 회색 계열
        return darkMode ? colors.dark[100] : colors.gray[900];
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'sm':      
        return '14px';
      case 'lg':      
        return '24px';
      default:         
        return '16px';
    }
  };

  const shouldHide = amountHidden && !temporarilyVisible;

  const handleClick = () => {
    if (onClick) {
      onClick();
    }

    if (amountHidden) {
      setTemporarilyVisible(true);
      setTimeout(() => {
        setTemporarilyVisible(false);
      }, 2000);
    }
  };

  const displayText = shouldHide 
    ? '●●●●●'  // 개인정보 보호를 위한 마스킹
    : `${type === 'expense' ? '-' : type === 'income' ? '+' : ''}${formatAmount(amount)}${showCurrency ? '원' : ''}`;

  return (
    <span
      onClick={handleClick}
      style={{
        color: getColor(),                    
        fontSize: getFontSize(),
        fontWeight: '600',
        fontFamily: "'Noto Sans KR', sans-serif",
        cursor: amountHidden ? 'pointer' : onClick ? 'pointer' : 'default',
        userSelect: 'none',
        transition: 'all 0.2s ease',        
        ...style                            
      }}
      title={amountHidden ? '클릭하여 금액 보기' : undefined} 
    >
      {displayText}
    </span>
  );
};