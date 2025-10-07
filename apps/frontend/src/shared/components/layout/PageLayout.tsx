/**
 * 페이지 레이아웃 컴포넌트
 */
import React from 'react';
import { colors } from '../../../styles/theme';
import { useApp } from '../../../app/hooks/useApp';

// 페이지 레이아웃 컴포넌트 props 정의
interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * 페이지 레이아웃 컴포넌트
 * @param param0 - 페이지 레이아웃 컴포넌트 props
 * @returns 페이지 레이아웃 컴포넌트
 */
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