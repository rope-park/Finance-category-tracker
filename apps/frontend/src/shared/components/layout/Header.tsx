/**
 * 헤더 레이아웃 컴포넌트
 */
import React, { useState } from 'react';
import { Button } from '../../../index';
import { LoginModal, RegisterModal } from '../../../index';
import { ProfileSettingsModal } from '../../../features/auth/components/ProfileSettingsModal';
import { useAuth } from '../../../features/auth/hooks/useAuth';
import { useApp } from '../../../app/hooks/useApp';
import { colors } from '../../../styles/theme';

// 헤더 컴포넌트의 Props 타입 정의
interface HeaderProps {
  onLogoClick?: () => void;
}

/**
 * 헤더 컴포넌트
 * @param param0 - 헤더 컴포넌트의 Props
 * @returns 헤더 컴포넌트
 */
export const Header: React.FC<HeaderProps> = ({ onLogoClick }) => {
  const { state: { user, isAuthenticated }, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useApp();
  
  const [showLoginModal, setShowLoginModal] = useState(false);      // 로그인 모달
  const [showRegisterModal, setShowRegisterModal] = useState(false);  // 회원가입 모달  
  const [showProfileModal, setShowProfileModal] = useState(false);     // 프로필 설정 모달

  const handleSwitchToRegister = () => {
    setShowLoginModal(false);
    setShowRegisterModal(true);
  };

  const handleSwitchToLogin = () => {
    setShowRegisterModal(false);
    setShowLoginModal(true);
  };

  const handleRegisterSuccess = () => {
    setShowProfileModal(true);
  };

  const handleLogout = () => {
    if (window.confirm('로그아웃 하시겠습니까?')) {
      logout();
    }
  };

  return (
    <>
      {/* 메인 헤더 영역 - 상단 고정되어 스크롤 시에도 항상 보임 */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',    
        alignItems: 'center',              
        padding: '16px 24px',             
        background: darkMode               
          ? `linear-gradient(135deg, ${colors.gray[900]} 0%, ${colors.gray[800]} 100%)`
          : `linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)`,
        borderBottom: `1px solid ${darkMode ? colors.gray[700] : colors.gray[200]}`, 
        boxShadow: darkMode              
          ? '0 2px 4px rgba(0, 0, 0, 0.3)' 
          : '0 2px 4px rgba(0, 0, 0, 0.1)',
        position: 'sticky',              
        top: 0,
        zIndex: 100                    
      }}>
        {/* 로고 영역 - 클릭 시 대시보드로 이동, 호버 시 애니메이션 효과 */}
        <div 
          onClick={onLogoClick}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',                                           
            cursor: onLogoClick ? 'pointer' : 'default',          
            transition: 'transform 0.2s ease'                     
          }}
          onMouseEnter={(e) => {
            // 마우스 호버 시 살짝 확대 효과
            if (onLogoClick) {
              e.currentTarget.style.transform = 'scale(1.05)';
            }
          }}
          onMouseLeave={(e) => {
            // 마우스 떠날 때 원래 크기로 복귀
            if (onLogoClick) {
              e.currentTarget.style.transform = 'scale(1)';
            }
          }}
        >
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: `linear-gradient(135deg, ${colors.primary[500]} 0%, ${colors.primary[600]} 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px'
          }}>
            💰
          </div>
          <div>
            <h1 className="logo-title heading-2 high-contrast" style={{
              margin: 0,
              color: darkMode ? colors.gray[100] : colors.gray[800]
            }}>
              가계부
            </h1>
            <p className="text-xs logo-subtitle readable-text" style={{
              margin: 0,
              color: darkMode ? colors.gray[400] : colors.gray[600]
            }}>
              스마트 자금 관리 도구
            </p>
          </div>
        </div>

        {/* 사용자 영역 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          {/* 다크모드 토글 */}
          <button
            onClick={toggleDarkMode}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              border: `1px solid ${darkMode ? colors.gray[600] : colors.gray[300]}`,
              background: darkMode ? colors.gray[700] : colors.gray[100],
              color: darkMode ? colors.gray[200] : colors.gray[700],
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px'
            }}
            title={darkMode ? '라이트 모드로 변경' : '다크 모드로 변경'}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>

          {isAuthenticated && user ? (
            // 로그인된 상태
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              {/* 사용자 정보 */}
              <button
                className="profile-button"
                onClick={() => setShowProfileModal(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  background: darkMode 
                    ? 'rgba(59, 130, 246, 0.1)' 
                    : 'rgba(59, 130, 246, 0.05)',
                  border: `1px solid ${darkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = darkMode 
                    ? 'rgba(59, 130, 246, 0.15)' 
                    : 'rgba(59, 130, 246, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = darkMode 
                    ? 'rgba(59, 130, 246, 0.1)' 
                    : 'rgba(59, 130, 246, 0.05)';
                }}
                title="프로필 설정"
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: user.avatar 
                    ? `url(${user.avatar}) center/cover`
                    : `linear-gradient(135deg, ${colors.primary[400]} 0%, ${colors.primary[600]} 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  color: 'white',
                  fontWeight: '600',
                  overflow: 'hidden'
                }}>
                  {!user.avatar && user.name.charAt(0).toUpperCase()}
                </div>
                <div className="user-info" style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start'
                }}>
                  <div className="text-sm high-contrast" style={{
                    fontWeight: '600',
                    color: darkMode ? colors.gray[100] : colors.gray[800]
                  }}>
                    {user.name}님
                  </div>
                </div>
                <div className="settings-icon" style={{
                  fontSize: '14px',
                  color: darkMode ? colors.gray[500] : colors.gray[400],
                  marginLeft: '4px'
                }}>
                  ⚙️
                </div>
              </button>

              {/* 로그아웃 버튼 */}
              <Button
                variant="secondary"
                size="sm"
                onClick={handleLogout}
                icon="🚪"
              >
                로그아웃
              </Button>
            </div>
          ) : (
            // 로그인되지 않은 상태
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowLoginModal(true)}
                icon="🔐"
              >
                로그인
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowRegisterModal(true)}
                icon="✨"
              >
                회원가입
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* 로그인 모달 */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSwitchToRegister={handleSwitchToRegister}
      />

      {/* 회원가입 모달 */}
      <RegisterModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onSwitchToLogin={handleSwitchToLogin}
        onRegisterSuccess={handleRegisterSuccess}
      />

      {/* 프로필 설정 모달 */}
      <ProfileSettingsModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />

      {/* 헤더 반응형 스타일 */}
      <style>{`
        /* 태블릿 크기 이하에서 사용자 정보 텍스트와 설정 아이콘 숨기기 */
        @media (max-width: 768px) {
          .user-info {
            display: none !important;
          }
          .settings-icon {
            display: none !important;
          }
          .logo-subtitle {
            display: none !important;
          }
        }
        
        /* 모바일 크기에서 프로필 버튼 패딩 줄이기 */
        @media (max-width: 640px) {
          .profile-button {
            padding: 8px !important;
            gap: 0 !important;
          }
        }
        
        /* 아주 작은 화면에서는 로고 텍스트도 숨기기 */
        @media (max-width: 480px) {
          .logo-title {
            display: none !important;
          }
          .profile-button {
            padding: 6px !important;
          }
        }
      `}</style>
    </>
  );
};