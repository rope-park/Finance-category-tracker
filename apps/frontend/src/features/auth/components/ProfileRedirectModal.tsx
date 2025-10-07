/**
 * 프로필 설정 리다이렉트 모달 컴포넌트
 * 
 * 주요 기능:
 * - 프로필 설정이 완료되지 않은 사용자를 위한 안내 모달
 * - 5초 카운트다운 후 자동으로 프로필 설정 페이지로 이동
 * - 즉시 이동 버튼 제공
 */
import React, { useEffect, useState } from 'react';
import { Modal } from '../../../shared/components/data-display/Modal';
import { Button } from '../../../shared/components/forms/Button';
import { useApp } from '../../../app/hooks/useApp';
import { colors } from '../../../styles/theme';

// 프로필 리다이렉트 모달 Props 인터페이스
interface ProfileRedirectModalProps {
  isOpen: boolean;
  onProceed: () => void;
}

/**
 * 프로필 리다이렉트 모달 컴포넌트
 * @param param0 ProfileRedirectModalProps
 * @returns JSX.Element
 */
export const ProfileRedirectModal: React.FC<ProfileRedirectModalProps> = ({
  isOpen,
  onProceed
}) => {
  const { darkMode } = useApp();
  const [countdown, setCountdown] = useState(5);

  // 5초 카운트다운 후 자동으로 프로필 설정으로 이동
  useEffect(() => {
    if (!isOpen) {
      setCountdown(5);
      return;
    }

    // 카운트다운 타이머 설정
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onProceed();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, onProceed]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {}} // 닫기 비활성화
      title="프로필 설정 필요"
      showCloseButton={false}
    >
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        gap: '24px',
        textAlign: 'center',
        padding: '20px 0'
      }}>
        {/* 안내 아이콘 */}
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${colors.primary[400]} 0%, ${colors.primary[600]} 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '40px',
          boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3)',
          animation: 'pulse 2s infinite'
        }}>
          👤
        </div>

        {/* 메시지 */}
        <div>
          <h3 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: darkMode ? colors.gray[100] : colors.gray[900],
            margin: '0 0 12px 0'
          }}>
            프로필 설정이 완료되지 않았습니다
          </h3>
          <p style={{
            fontSize: '16px',
            color: darkMode ? colors.gray[300] : colors.gray[600],
            lineHeight: '1.6',
            margin: '0 0 8px 0',
            maxWidth: '400px'
          }}>
            서비스 이용을 위해 프로필 설정 화면으로 이동합니다.
          </p>
          <p style={{
            fontSize: '14px',
            color: darkMode ? colors.gray[400] : colors.gray[500],
            lineHeight: '1.5',
            margin: '0',
            maxWidth: '400px'
          }}>
            프로필 설정을 완료하시면 모든 기능을 이용하실 수 있습니다.
          </p>
        </div>

        {/* 카운트다운 */}
        <div style={{
          padding: '16px 24px',
          borderRadius: '50px',
          background: darkMode 
            ? `rgba(59, 130, 246, 0.15)` 
            : `rgba(59, 130, 246, 0.1)`,
          border: `2px solid ${darkMode ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)'}`,
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${colors.primary[500]} 0%, ${colors.primary[600]} 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            fontWeight: '700',
            color: 'white'
          }}>
            {countdown}
          </div>
          <span style={{
            fontSize: '14px',
            fontWeight: '600',
            color: darkMode ? colors.primary[300] : colors.primary[700]
          }}>
            초 후 자동으로 이동합니다
          </span>
        </div>

        {/* 즉시 이동 버튼 */}
        <Button
          variant="primary"
          onClick={onProceed}
          icon="🚀"
          style={{ minWidth: '180px' }}
        >
          지금 바로 설정하기
        </Button>

        {/* 안내 정보 */}
        <div style={{
          padding: '16px',
          borderRadius: '12px',
          background: darkMode 
            ? `rgba(34, 197, 94, 0.1)` 
            : `rgba(34, 197, 94, 0.05)`,
          border: `1px solid ${darkMode ? 'rgba(34, 197, 94, 0.2)' : 'rgba(34, 197, 94, 0.15)'}`,
          maxWidth: '400px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '8px'
          }}>
            <span style={{ fontSize: '16px' }}>✨</span>
            <span style={{
              fontSize: '14px',
              fontWeight: '600',
              color: darkMode ? colors.success[300] : colors.success[700]
            }}>
              프로필 설정하면 이런 혜택이!
            </span>
          </div>
          <ul style={{
            fontSize: '13px',
            color: darkMode ? colors.gray[300] : colors.gray[600],
            margin: '0',
            paddingLeft: '20px',
            lineHeight: '1.5'
          }}>
            <li>개인 맞춤형 가계부 관리 서비스</li>
            <li>연령대별 재정 관리 팁 제공</li>
            <li>프로필 기반 보안 강화</li>
            <li>향후 소셜 기능 이용 가능</li>
          </ul>
        </div>
      </div>

      {/* 애니메이션 스타일 */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
      `}</style>
    </Modal>
  );
};