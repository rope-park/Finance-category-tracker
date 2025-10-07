/**
 * 범위 슬라이더 폼 컴포넌트
 */
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { colors } from '../../../styles/theme';

// RangeSlider 컴포넌트의 Props 타입 정의
interface RangeSliderProps {
  min: number;
  max: number;
  step?: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  label?: string;
  formatValue?: (value: number) => string;
  darkMode?: boolean;
}

/**
 * 범위 슬라이더 폼 컴포넌트
 * @param param0 - RangeSlider 컴포넌트 props
 * @returns RangeSlider 컴포넌트
 */
export const RangeSlider: React.FC<RangeSliderProps> = ({
  min,
  max,
  step = 1000,
  value,
  onChange,
  label,
  formatValue = (val) => val.toString(),
  darkMode = false
}) => {
  const [isDragging, setIsDragging] = useState<'min' | 'max' | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  const getPercentage = useCallback((val: number) => {
    return ((val - min) / (max - min)) * 100;
  }, [min, max]);

  const getValue = useCallback((percentage: number) => {
    const val = min + (percentage * (max - min)) / 100;
    return Math.round(val / step) * step;
  }, [min, max, step]);

  const handleMouseDown = (handle: 'min' | 'max') => {
    setIsDragging(handle);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !sliderRef.current) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const percentage = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const newValue = getValue(percentage);

    if (isDragging === 'min') {
      const newMin = Math.min(newValue, value[1]);
      onChange([newMin, value[1]]);
    } else {
      const newMax = Math.max(newValue, value[0]);
      onChange([value[0], newMax]);
    }
  }, [isDragging, getValue, value, onChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(null);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const minPercentage = getPercentage(value[0]);
  const maxPercentage = getPercentage(value[1]);

  return (
    <div style={{ width: '100%' }}>
      {label && (
        <label style={{
          display: 'block',
          marginBottom: '8px',
          fontSize: '14px',
          fontWeight: '600',
          color: darkMode ? colors.dark[100] : colors.gray[900],
          fontFamily: "'Noto Sans KR', sans-serif"
        }}>
          {label}
        </label>
      )}
      
      {/* 값 표시 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '16px',
        fontSize: '12px',
        color: darkMode ? colors.dark[300] : colors.gray[600],
        fontFamily: "'Noto Sans KR', sans-serif"
      }}>
        <span>{formatValue(value[0])}</span>
        <span>{formatValue(value[1])}</span>
      </div>

      {/* 슬라이더 */}
      <div
        ref={sliderRef}
        style={{
          position: 'relative',
          height: '6px',
          backgroundColor: darkMode ? colors.dark[600] : colors.gray[200],
          borderRadius: '3px',
          cursor: 'pointer'
        }}
      >
        {/* 활성 구간 */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: `${minPercentage}%`,
            width: `${maxPercentage - minPercentage}%`,
            height: '6px',
            backgroundColor: colors.primary[500],
            borderRadius: '3px'
          }}
        />

        {/* 최소값 핸들 */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: `${minPercentage}%`,
            transform: 'translate(-50%, -50%)',
            width: '20px',
            height: '20px',
            backgroundColor: colors.primary[500],
            borderRadius: '50%',
            cursor: 'grab',
            boxShadow: darkMode 
              ? '0 2px 8px rgba(0, 0, 0, 0.3)' 
              : '0 2px 8px rgba(0, 0, 0, 0.1)',
            border: `3px solid ${darkMode ? colors.dark[700] : '#ffffff'}`,
            transition: 'transform 0.1s ease',
            ...(isDragging === 'min' && {
              transform: 'translate(-50%, -50%) scale(1.1)',
              cursor: 'grabbing'
            })
          }}
          onMouseDown={() => handleMouseDown('min')}
        />

        {/* 최대값 핸들 */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: `${maxPercentage}%`,
            transform: 'translate(-50%, -50%)',
            width: '20px',
            height: '20px',
            backgroundColor: colors.primary[500],
            borderRadius: '50%',
            cursor: 'grab',
            boxShadow: darkMode 
              ? '0 2px 8px rgba(0, 0, 0, 0.3)' 
              : '0 2px 8px rgba(0, 0, 0, 0.1)',
            border: `3px solid ${darkMode ? colors.dark[700] : '#ffffff'}`,
            transition: 'transform 0.1s ease',
            ...(isDragging === 'max' && {
              transform: 'translate(-50%, -50%) scale(1.1)',
              cursor: 'grabbing'
            })
          }}
          onMouseDown={() => handleMouseDown('max')}
        />
      </div>

      {/* 범위 표시 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '8px',
        fontSize: '12px',
        color: darkMode ? colors.dark[400] : colors.gray[500],
        fontFamily: "'Noto Sans KR', sans-serif"
      }}>
        <span>{formatValue(min)}</span>
        <span>{formatValue(max)}</span>
      </div>
    </div>
  );
};