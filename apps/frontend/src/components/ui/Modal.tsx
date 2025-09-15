import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { colors, borderRadius } from '../../styles/theme';
import { useApp } from '../../hooks/useApp';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'small' | 'medium' | 'large' | 'extra-large';
  variant?: 'default' | 'glass' | 'elevated';
  showCloseButton?: boolean;
}

export const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'medium',
  variant = 'default',
  showCloseButton = true
}) => {
  const { darkMode } = useApp();

  // ESC 키로 모달 닫기 및 스크롤 관리
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // 스크롤 방지만 하고 위치는 건드리지 않음
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      if (isOpen) {
        // 모달이 닫힐 때 스크롤 복원
        document.body.style.overflow = '';
      }
    };
  }, [isOpen, onClose]);



  const sizeStyles = {
    small: { width: '400px', maxWidth: '90vw' },
    medium: { width: '600px', maxWidth: '90vw' },
    large: { width: '800px', maxWidth: '95vw' },
    'extra-large': { width: '1000px', maxWidth: '95vw' }
  };

  const getBackdropStyle = () => ({
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: darkMode 
      ? 'rgba(0, 0, 0, 0.8)' 
      : 'rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
    padding: '20px',
    opacity: 0,
    animation: 'fadeIn 0.3s ease-out forwards',
    // 강제로 뷰포트에 고정
    width: '100vw',
    height: '100vh',
  });

  // 모달을 화면 중앙에 정확히 배치
  const getModalStyle = () => {
    const baseStyle = {
      ...sizeStyles[size],
      maxHeight: '90vh',
      borderRadius: borderRadius.xl,
      overflow: 'hidden',
      // transform 대신 opacity와 scale만 사용
      animation: 'modalFadeIn 0.3s ease-out forwards',
      boxShadow: darkMode
        ? '0 25px 50px -12px rgba(0, 0, 0, 0.8)'
        : '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      // 백드롭의 flex로 중앙 정렬하므로 position fixed 제거
      position: 'relative' as const,
    };

    switch (variant) {
      case 'glass':
        return {
          ...baseStyle,
          background: darkMode
            ? 'rgba(31, 41, 55, 0.9)'
            : 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)',
          border: `1px solid ${darkMode ? 'rgba(75, 85, 99, 0.5)' : 'rgba(229, 231, 235, 0.5)'}`,
        };
      case 'elevated':
        return {
          ...baseStyle,
          backgroundColor: darkMode ? colors.gray[800] : '#ffffff',
          border: `1px solid ${darkMode ? colors.gray[700] : colors.gray[200]}`,
          boxShadow: darkMode
            ? '0 25px 50px -12px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(255, 255, 255, 0.05)'
            : '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)',
        };
      default:
        return {
          ...baseStyle,
          backgroundColor: darkMode ? colors.gray[900] : '#ffffff',
          border: `1px solid ${darkMode ? colors.gray[700] : colors.gray[200]}`,
        };
    }
  };

  const headerStyle = {
    padding: '24px 24px 20px',
    borderBottom: `1px solid ${darkMode ? colors.gray[700] : colors.gray[200]}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: darkMode 
      ? `linear-gradient(135deg, ${colors.gray[800]} 0%, ${colors.gray[900]} 100%)`
      : `linear-gradient(135deg, ${colors.gray[50]} 0%, #ffffff 100%)`,
  };

  const titleStyle = {
    fontSize: '24px',
    fontWeight: '700',
    color: darkMode ? '#ffffff' : colors.gray[900],
    margin: 0,
    fontFamily: "'Noto Sans KR', sans-serif",
    letterSpacing: '-0.025em'
  };

  const closeButtonStyle = {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    padding: '8px',
    color: darkMode ? colors.gray[400] : colors.gray[500],
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.lg,
    transform: 'rotate(0deg)',
  };

  const contentStyle = {
    padding: '28px 24px 24px',
    backgroundColor: darkMode ? colors.gray[900] : '#ffffff',
    maxHeight: 'calc(90vh - 120px)',
    overflowY: 'auto' as const,
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    // 백드롭 자체를 클릭했을 때만 모달 닫기 (모달 내부 클릭 시에는 닫지 않음)
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleCloseHover = (e: React.MouseEvent<HTMLButtonElement>, isEnter: boolean) => {
    if (isEnter) {
      e.currentTarget.style.backgroundColor = darkMode ? colors.gray[700] : colors.gray[100];
      e.currentTarget.style.transform = 'rotate(90deg) scale(1.1)';
    } else {
      e.currentTarget.style.backgroundColor = 'transparent';
      e.currentTarget.style.transform = 'rotate(0deg) scale(1)';
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <>
      <div
        style={{
          ...getBackdropStyle(),
          // CSS transform이 position:fixed를 깨뜨릴 수 있으므로 강제 재설정
          transform: 'none',
          willChange: 'auto',
        }}
        onClick={handleBackdropClick}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div style={getModalStyle()}>
          {/* Header */}
          <div style={headerStyle}>
            <h2 id="modal-title" style={titleStyle}>{title}</h2>
            {showCloseButton && (
              <button
                onClick={onClose}
                style={closeButtonStyle}
                onMouseEnter={(e) => handleCloseHover(e, true)}
                onMouseLeave={(e) => handleCloseHover(e, false)}
                aria-label="모달 닫기"
              >
                ✕
              </button>
            )}
          </div>
          {/* Content */}
          <div style={contentStyle}>
            {children}
          </div>
        </div>
      </div>
      {/* CSS 애니메이션 */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalFadeIn {
          from { 
            opacity: 0;
            filter: blur(2px);
          }
          to { 
            opacity: 1;
            filter: blur(0);
          }
        }
      `}</style>
    </>,
    document.body
  );
};