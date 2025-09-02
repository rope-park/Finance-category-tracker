import React from 'react';


interface GridBreakpoints {
  mobile?: number;
  tablet?: number;
  desktop?: number;
}

interface GridProps {
  children: React.ReactNode;
  columns?: number | string;
  gap?: string;
  className?: string;
  style?: React.CSSProperties;
  breakpoints?: GridBreakpoints;
}

export const Grid: React.FC<GridProps> = ({
  children,
  columns = 'repeat(auto-fit, minmax(300px, 1fr))',
  gap = '20px',
  className = '',
  style = {},
  breakpoints
}) => {
  // 반응형 컬럼 스타일 생성
  let gridTemplateColumns = typeof columns === 'number' ? `repeat(${columns}, 1fr)` : columns;
  let responsiveStyle = {};
  if (breakpoints) {
    responsiveStyle = {
      '--grid-mobile': `repeat(${breakpoints.mobile || 1}, 1fr)`,
      '--grid-tablet': `repeat(${breakpoints.tablet || 2}, 1fr)`,
      '--grid-desktop': `repeat(${breakpoints.desktop || 4}, 1fr)`
    };
    gridTemplateColumns = 'var(--grid-mobile)';
  }
  return (
    <div
      className={className}
      style={{
        display: 'grid',
        gridTemplateColumns,
        gap,
        ...responsiveStyle,
        ...style
      }}
    >
      {children}
      <style>{`
        @media (min-width: 600px) {
          .${className} { grid-template-columns: var(--grid-tablet) !important; }
        }
        @media (min-width: 1024px) {
          .${className} { grid-template-columns: var(--grid-desktop) !important; }
        }
      `}</style>
    </div>
  );
};