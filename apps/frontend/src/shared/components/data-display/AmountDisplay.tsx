import React, { useState } from 'react';
import { useApp } from '../../../app/hooks/useApp';
import { colors } from '../../../styles/theme';

interface AmountDisplayProps {
  amount: number;
  type?: 'income' | 'expense' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  showCurrency?: boolean;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export const AmountDisplay: React.FC<AmountDisplayProps> = ({ 
  amount, 
  type = 'neutral', 
  size = 'md', 
  showCurrency = true,
  style = {},
  onClick
}) => {
  const { amountHidden, darkMode } = useApp();
  const [temporarilyVisible, setTemporarilyVisible] = useState(false);

  // 디버깅을 위한 로그
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
      case 'income':
        return darkMode ? colors.success[400] : colors.success[600];
      case 'expense':
        return darkMode ? colors.error[400] : colors.error[600];
      default:
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
      // 2초 후 다시 숨김
      setTimeout(() => {
        setTemporarilyVisible(false);
      }, 2000);
    }
  };

  const displayText = shouldHide 
    ? '●●●●●' 
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