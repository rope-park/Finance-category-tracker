import React from 'react';

interface GridProps {
  children: React.ReactNode;
  columns?: number | string;
  gap?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const Grid: React.FC<GridProps> = ({
  children,
  columns = 'repeat(auto-fit, minmax(300px, 1fr))',
  gap = '20px',
  className = '',
  style = {}
}) => {
  return (
    <div
      className={className}
      style={{
        display: 'grid',
        gridTemplateColumns: typeof columns === 'number' ? `repeat(${columns}, 1fr)` : columns,
        gap,
        ...style
      }}
    >
      {children}
    </div>
  );
};
