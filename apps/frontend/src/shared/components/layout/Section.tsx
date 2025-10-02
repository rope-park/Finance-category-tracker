import React from 'react';
import { colors } from '../../../styles/theme';
import { useApp } from '../../../app/hooks/useApp';

interface SectionProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  icon?: string;
  className?: string;
}

export const Section: React.FC<SectionProps> = ({
  title,
  subtitle,
  children,
  icon,
  className = ''
}) => {
  const { darkMode } = useApp();
  
  return (
    <section
      className={className}
      style={{ marginBottom: '32px' }}
      aria-labelledby="section-title"
      tabIndex={-1}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '16px',
        }}
      >
        {icon && <span style={{ fontSize: '24px' }} aria-hidden="true">{icon}</span>}
        <div>
          <h2
            id="section-title"
            style={{
              fontSize: '24px',
              fontWeight: 700,
              color: darkMode ? colors.dark[50] : colors.gray[900],
              margin: 0,
              fontFamily: "'Noto Sans KR', sans-serif",
              letterSpacing: '-0.025em',
            }}
            tabIndex={0}
            aria-live="polite"
          >
            {title}
          </h2>
          {subtitle && (
            <p
              style={{
                fontSize: '16px',
                color: darkMode ? colors.dark[400] : colors.gray[600],
                margin: '4px 0 0 0',
                fontFamily: "'Noto Sans KR', sans-serif",
              }}
              tabIndex={0}
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {children}
    </section>
  );
};