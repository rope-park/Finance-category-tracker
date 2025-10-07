/**
 * 테마 및 디자인 시스템 설정 파일
 * 
 * 앱 전체에서 사용할 색상, 폰트, 간격 등의 디자인 토큰 정의.
 * 일관된 UI/UX 경험을 제공하기 위한 중앙집중식 스타일 관리.
 * 
 * 주요 구성:
 * - 색상 팔레트 (주요, 성공, 경고, 에러 등)
 * - 타이포그래피 설정
 * - 간격 및 레이아웃 값
 * - 그림자 및 테두리 스타일
 * 
 * @author Ju Eul Park (rope-park)
 */

/**
 * 앱 전체 색상 팔레트 정의
 * 각 색상별로 50(가장 연함)부터 900(가장 진함)까지의 단계별 색상 제공
 */
export const colors = {
  /** 주 브랜드 색상 (파란색 계열) - 버튼, 링크, 강조 요소에 사용 */
  primary: {
    50: '#eff6ff',   // 매우 연한 파란색 (배경용)
    100: '#dbeafe',  // 연한 파란색
    200: '#bfdbfe',  // 밝은 파란색
    300: '#93c5fd',  // 중간 파란색
    400: '#60a5fa',  // 진한 파란색
    500: '#3b82f6',  // 기본 파란색 (메인 브랜드 컬러)
    600: '#2563eb',  // 더 진한 파란색 (hover 효과)
    700: '#1d4ed8',  // 매우 진한 파란색
    800: '#1e40af',  // 어두운 파란색
    900: '#1e3a8a'   // 가장 어두운 파란색
  },
  
  /** 성공 상태 색상 (초록색 계열) - 성공 메시지, 긍정적 피드백에 사용 */
  success: {
    50: '#ecfdf5',   // 매우 연한 초록색
    100: '#d1fae5',  // 연한 초록색
    200: '#a7f3d0',  // 밝은 초록색
    300: '#6ee7b7',  // 중간 초록색
    400: '#34d399',  // 진한 초록색
    500: '#10b981',  // 기본 초록색 (성공 메인 컬러)
    600: '#059669',  // 더 진한 초록색
    700: '#047857',  // 매우 진한 초록색
    800: '#065f46',  // 어두운 초록색
    900: '#064e3b'   // 가장 어두운 초록색
  },
  
  /** 경고 상태 색상 (노란색 계열) - 경고 메시지, 주의 필요 알림에 사용 */
  warning: {
    50: '#fffbeb',  // 매우 연한 노란색
    100: '#fef3c7', // 연한 노란색
    200: '#fde68a', // 밝은 노란색
    300: '#fcd34d', // 중간 노란색
    400: '#fbbf24', // 진한 노란색
    500: '#f59e0b', // 기본 노란색 (경고 메인 컬러)
    600: '#d97706', // 더 진한 노란색
    700: '#b45309', // 매우 진한 노란색
    800: '#92400e', // 어두운 노란색
    900: '#78350f'  // 가장 어두운 노란색
  },

  /** 에러 상태 색상 (빨간색 계열) - 에러 메시지, 부정적 피드백에 사용 */
  error: {
    50: '#fef2f2',  // 매우 연한 빨간색
    100: '#fee2e2', // 연한 빨간색
    200: '#fecaca', // 밝은 빨간색
    300: '#fca5a5', // 중간 빨간색
    400: '#f87171', // 진한 빨간색
    500: '#ef4444', // 기본 빨간색 (에러 메인 컬러)
    600: '#dc2626', // 더 진한 빨간색
    700: '#b91c1c', // 매우 진한 빨간색
    800: '#991b1b', // 어두운 빨간색
    900: '#7f1d1d'  // 가장 어두운 빨간색
  },

  /** 회색 상태 색상 (회색 계열) - 중립적 메시지, 비활성 요소에 사용 */
  gray: {
    50: '#f9fafb',  // 매우 연한 회색
    100: '#f3f4f6', // 연한 회색
    200: '#e5e7eb', // 밝은 회색
    300: '#d1d5db', // 중간 회색
    400: '#9ca3af', // 진한 회색
    500: '#6b7280', // 기본 회색 (회색 메인 컬러)
    600: '#4b5563', // 더 진한 회색
    700: '#374151', // 매우 진한 회색
    800: '#1f2937', // 어두운 회색
    900: '#111827'  // 가장 어두운 회색
  },

  /** 다크 모드 색상 */
  dark: {
    50: '#f8fafc',  // 매우 연한 다크 색상
    100: '#f1f5f9', // 연한 다크 색상
    200: '#e2e8f0', // 밝은 다크 색상
    300: '#cbd5e1', // 중간 다크 색상
    400: '#94a3b8', // 진한 다크 색상
    500: '#64748b', // 기본 다크 색상 (다크 메인 컬러)
    600: '#475569', // 더 진한 다크 색상
    700: '#334155', // 매우 진한 다크 색상
    800: '#1e293b', // 어두운 다크 색상
    900: '#0f172a'  // 가장 어두운 다크 색상
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