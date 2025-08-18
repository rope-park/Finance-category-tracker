import React from 'react';
import { colors } from '../../styles/theme';

interface ToggleProps {
  enabled: boolean;
  onChange: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export const Toggle: React.FC<ToggleProps> = ({
  enabled,
  onChange,
  size = 'md'
}) => {
  const sizeConfig = {
    sm: { width: '36px', height: '20px', circle: '16px', offset: '18px' },
    md: { width: '48px', height: '24px', circle: '20px', offset: '26px' },
    lg: { width: '60px', height: '30px', circle: '26px', offset: '32px' }
  };
  
  const config = sizeConfig[size];
  
  return (
    <button
      onClick={onChange}
      style={{
        width: config.width,
        height: config.height,
        backgroundColor: enabled ? colors.success[500] : colors.gray[400],
        border: 'none',
        borderRadius: '12px',
        position: 'relative',
        cursor: 'pointer',
        transition: 'background-color 0.2s ease',
        outline: 'none'
      }}
    >
      <div style={{
        width: config.circle,
        height: config.circle,
        backgroundColor: colors.gray[50],
        borderRadius: '50%',
        position: 'absolute',
        top: '2px',
        left: enabled ? config.offset : '2px',
        transition: 'left 0.2s ease',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }} />
    </button>
  );
};
