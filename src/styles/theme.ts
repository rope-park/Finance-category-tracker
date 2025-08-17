// UI/UX 개선을 위한 공통 스타일과 컬러 시스템

export const colors = {
  // Primary Colors
  primary: {
    50: '#eff6ff',
    100: '#dbeafe', 
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a'
  },
  
  // Success Colors
  success: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b'
  },
  
  // Warning Colors
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f'
  },
  
  // Error Colors
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d'
  },
  
  // Gray Colors
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827'
  },
  
  // Dark Mode Colors
  dark: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a'
  }
};

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)'
};

export const animation = {
  transition: {
    fast: '0.15s ease-in-out',
    normal: '0.2s ease-in-out',
    slow: '0.3s ease-in-out'
  },
  
  scale: {
    hover: 'scale(1.02)',
    active: 'scale(0.98)'
  }
};

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  '3xl': '64px'
};

export const borderRadius = {
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '24px',
  full: '9999px'
};

// 테마별 스타일 헬퍼 함수
export const getThemeColors = (darkMode: boolean) => ({
  background: {
    primary: darkMode ? colors.dark[900] : colors.gray[50],
    secondary: darkMode ? colors.dark[800] : '#ffffff',
    tertiary: darkMode ? colors.dark[700] : colors.gray[100]
  },
  text: {
    primary: darkMode ? colors.dark[50] : colors.gray[900],
    secondary: darkMode ? colors.dark[300] : colors.gray[600],
    tertiary: darkMode ? colors.dark[400] : colors.gray[500]
  },
  border: {
    primary: darkMode ? colors.dark[700] : colors.gray[200],
    secondary: darkMode ? colors.dark[600] : colors.gray[300]
  }
});

// 공통 카드 스타일
export const getCardStyles = (darkMode: boolean, interactive: boolean = false) => ({
  backgroundColor: darkMode ? colors.dark[800] : '#ffffff',
  border: `1px solid ${darkMode ? colors.dark[700] : colors.gray[200]}`,
  borderRadius: borderRadius.lg,
  boxShadow: darkMode ? 'none' : shadows.sm,
  transition: animation.transition.normal,
  ...(interactive && {
    cursor: 'pointer',
    '&:hover': {
      transform: animation.scale.hover,
      boxShadow: darkMode ? `0 4px 12px rgba(0, 0, 0, 0.3)` : shadows.md
    },
    '&:active': {
      transform: animation.scale.active
    }
  })
});

// 공통 버튼 스타일
export const getButtonStyles = (variant: 'primary' | 'secondary' | 'ghost', darkMode: boolean) => {
  const baseStyles = {
    padding: `${spacing.sm} ${spacing.md}`,
    borderRadius: borderRadius.md,
    fontWeight: '500',
    transition: animation.transition.normal,
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm
  };

  switch (variant) {
    case 'primary':
      return {
        ...baseStyles,
        backgroundColor: colors.primary[600],
        color: '#ffffff',
        '&:hover': {
          backgroundColor: colors.primary[700]
        },
        '&:active': {
          backgroundColor: colors.primary[800]
        }
      };
    
    case 'secondary':
      return {
        ...baseStyles,
        backgroundColor: darkMode ? colors.dark[700] : colors.gray[100],
        color: darkMode ? colors.dark[100] : colors.gray[900],
        '&:hover': {
          backgroundColor: darkMode ? colors.dark[600] : colors.gray[200]
        }
      };
    
    case 'ghost':
      return {
        ...baseStyles,
        backgroundColor: 'transparent',
        color: darkMode ? colors.dark[300] : colors.gray[600],
        '&:hover': {
          backgroundColor: darkMode ? colors.dark[800] : colors.gray[100]
        }
      };
    
    default:
      return baseStyles;
  }
};
