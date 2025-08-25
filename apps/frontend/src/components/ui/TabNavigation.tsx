import React from 'react';
import { colors } from '../../styles/theme';
import { useApp } from '../../hooks/useApp';

interface Tab {
  id: string;
  label: string;
  icon: string;
}

interface TabNavigationProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  tabs,
  activeTab,
  onTabChange
}) => {
  const { darkMode } = useApp();
  
  return (
    <div style={{
      display: 'flex',
      gap: '8px',
      marginBottom: '24px',
      borderBottom: `1px solid ${darkMode ? colors.dark[700] : colors.gray[200]}`,
      paddingBottom: '0'
    }}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          style={{
            padding: '12px 20px',
            backgroundColor: activeTab === tab.id ? 
              (darkMode ? colors.dark[700] : colors.gray[100]) : 'transparent',
            color: activeTab === tab.id ? 
              (darkMode ? colors.dark[100] : colors.gray[900]) : 
              (darkMode ? colors.dark[400] : colors.gray[600]),
            border: 'none',
            borderRadius: '8px 8px 0 0',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            fontFamily: "'Noto Sans KR', sans-serif",
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease',
            outline: 'none'
          }}
          onMouseEnter={(e) => {
            if (activeTab !== tab.id) {
              e.currentTarget.style.backgroundColor = darkMode ? colors.dark[700] : colors.gray[100];
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== tab.id) {
              e.currentTarget.style.backgroundColor = 'transparent';
            }
          }}
        >
          <span>{tab.icon}</span>
          {tab.label}
        </button>
      ))}
    </div>
  );
};