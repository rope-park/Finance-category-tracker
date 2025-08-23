// 반응형 타이포그래피 시스템
export const typography = {
  // 화면 크기별 기본 폰트 크기
  fontSize: {
    xs: '12px',   // 480px 이하
    sm: '14px',   // 640px 이하  
    md: '16px',   // 768px 이하
    lg: '18px',   // 1024px 이하
    xl: '20px'    // 1024px 이상
  },
  
  // 제목 크기
  heading: {
    h1: {
      xs: '20px',
      sm: '24px',
      md: '28px',
      lg: '32px',
      xl: '36px'
    },
    h2: {
      xs: '18px',
      sm: '20px',
      md: '22px',
      lg: '24px',
      xl: '26px'
    },
    h3: {
      xs: '16px',
      sm: '18px',
      md: '20px',
      lg: '22px',
      xl: '24px'
    },
    h4: {
      xs: '14px',
      sm: '16px',
      md: '18px',
      lg: '20px',
      xl: '20px'
    }
  },
  
  // 본문 텍스트
  body: {
    large: {
      xs: '14px',
      sm: '15px',
      md: '16px',
      lg: '17px',
      xl: '18px'
    },
    normal: {
      xs: '12px',
      sm: '13px',
      md: '14px',
      lg: '15px',
      xl: '16px'
    },
    small: {
      xs: '10px',
      sm: '11px',
      md: '12px',
      lg: '13px',
      xl: '14px'
    }
  },
  
  // 라인 높이
  lineHeight: {
    tight: '1.2',
    normal: '1.5',
    relaxed: '1.6',
    loose: '1.8'
  },
  
  // 글자 간격
  letterSpacing: {
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em'
  },
  
  // 폰트 굵기
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800'
  }
};

// 반응형 CSS 생성 함수
export const responsiveFont = (sizes: Record<string, string>) => `
  font-size: ${sizes.xs};
  
  @media (min-width: 480px) {
    font-size: ${sizes.sm};
  }
  
  @media (min-width: 640px) {
    font-size: ${sizes.md};
  }
  
  @media (min-width: 768px) {
    font-size: ${sizes.lg};
  }
  
  @media (min-width: 1024px) {
    font-size: ${sizes.xl};
  }
`;

// 반응형 스타일 생성 유틸리티
export const createResponsiveStyle = (property: string, values: Record<string, string>) => `
  ${property}: ${values.xs};
  
  @media (min-width: 480px) {
    ${property}: ${values.sm};
  }
  
  @media (min-width: 640px) {
    ${property}: ${values.md};
  }
  
  @media (min-width: 768px) {
    ${property}: ${values.lg};
  }
  
  @media (min-width: 1024px) {
    ${property}: ${values.xl};
  }
`;

// 반응형 패딩/마진
export const spacing = {
  xs: {
    xs: '4px',
    sm: '6px', 
    md: '8px',
    lg: '10px',
    xl: '12px'
  },
  sm: {
    xs: '8px',
    sm: '10px',
    md: '12px', 
    lg: '14px',
    xl: '16px'
  },
  md: {
    xs: '12px',
    sm: '14px',
    md: '16px',
    lg: '18px', 
    xl: '20px'
  },
  lg: {
    xs: '16px',
    sm: '18px',
    md: '20px',
    lg: '22px',
    xl: '24px'
  },
  xl: {
    xs: '20px',
    sm: '22px',
    md: '24px',
    lg: '26px',
    xl: '32px'
  },
  '2xl': {
    xs: '24px',
    sm: '28px',
    md: '32px',
    lg: '36px',
    xl: '40px'
  }
};
