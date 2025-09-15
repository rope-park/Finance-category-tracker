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
  
  // 접근성: role, aria-selected, tabIndex, 키보드 내비게이션 등 적용
  const tabRefs = React.useRef<(HTMLButtonElement | null)[]>([]);
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const idx = tabs.findIndex((tab) => tab.id === activeTab);
    if (e.key === 'ArrowRight') {
      const next = (idx + 1) % tabs.length;
      onTabChange(tabs[next].id);
      tabRefs.current[next]?.focus();
    } else if (e.key === 'ArrowLeft') {
      const prev = (idx - 1 + tabs.length) % tabs.length;
      onTabChange(tabs[prev].id);
      tabRefs.current[prev]?.focus();
    }
  };
  return (
    <div
      style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '24px',
        borderBottom: `1px solid ${darkMode ? colors.dark[700] : colors.gray[200]}`,
        paddingBottom: '0',
      }}
      role="tablist"
      aria-label="탭 내비게이션"
      onKeyDown={handleKeyDown}
    >
      {tabs.map((tab, i) => (
        <button
          key={tab.id}
          ref={el => { if (el) tabRefs.current[i] = el; }}
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
            outline: activeTab === tab.id ? `2px solid ${colors.primary[500]}` : 'none',
          }}
          role="tab"
          aria-selected={activeTab === tab.id}
          aria-controls={`tabpanel-${tab.id}`}
          id={`tab-${tab.id}`}
          tabIndex={activeTab === tab.id ? 0 : -1}
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
          <span aria-hidden="true">{tab.icon}</span>
          {tab.label}
        </button>
      ))}
    </div>
  );
};