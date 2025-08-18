import React from 'react';
import { colors } from '../../styles/theme';
import { useApp } from '../../hooks/useApp';

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  className = ''
}) => {
  const { darkMode } = useApp();
  
  return (
    <div 
      className={className}
      style={{
        padding: '32px',
        backgroundColor: darkMode ? colors.dark[900] : colors.gray[50],
        minHeight: '100vh',
        fontFamily: "'Noto Sans KR', sans-serif"
      }}
    >
      {children}
    </div>
  );
};
