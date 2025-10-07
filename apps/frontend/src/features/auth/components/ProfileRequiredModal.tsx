/**
 * 프로필 설정이 필요한 경우 표시되는 모달 컴포넌트
 * 
 * 주요 기능:
 * - 프로필 설정 필요성을 사용자에게 알림
 * - 프로필 설정 페이지로 이동하는 버튼 제공
 * - 프로필 설정이 왜 필요한지에 대한 안내 메시지 포함
 */
import React from 'react';
import { Modal } from '../../../shared/components/data-display/Modal';
import { Button } from '../../../shared/components/forms/Button';
import { useApp } from '../../../app/hooks/useApp';
import { colors } from '../../../styles/theme';

// 프로필 설정 필요 모달 Props 인터페이스
interface ProfileRequiredModalProps {
  isOpen: boolean;
  onContinueToProfile: () => void;
}

/**
 * 프로필 설정 필요 모달 컴포넌트
 * @param param0 ProfileRequiredModalProps
 * @returns JSX.Element
 */
export const ProfileRequiredModal: React.FC<ProfileRequiredModalProps> = ({
  isOpen,
  onContinueToProfile
}) => {
  const { darkMode } = useApp();

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {}} // 닫기 버튼 비활성화
      title="프로필 설정 필수"
      showCloseButton={false} // X 버튼 숨기기
    >
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        gap: '24px',
        textAlign: 'center',
        padding: '20px 0'
      }}>
        {/* 경고 아이콘 */}
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${colors.warning[400]} 0%, ${colors.warning[600]} 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '40px',
          boxShadow: '0 8px 24px rgba(251, 191, 36, 0.3)'
        }}>
          ⚠️
        </div>

        {/* 메시지 */}
        <div>
          <h3 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: darkMode ? colors.gray[100] : colors.gray[900],
            margin: '0 0 12px 0'
          }}>
            프로필 설정이 필요합니다
          </h3>
          <p style={{
            fontSize: '16px',
            color: darkMode ? colors.gray[300] : colors.gray[600],
            lineHeight: '1.6',
            margin: '0 0 8px 0',
            maxWidth: '400px'
          }}>
            서비스 이용을 위해 프로필 설정을 완료해주세요.
          </p>
          <p style={{
            fontSize: '14px',
            color: darkMode ? colors.gray[400] : colors.gray[500],
            lineHeight: '1.5',
            margin: '0',
            maxWidth: '400px'
          }}>
            프로필 사진, 연락처, 나이대 등의 기본 정보를 입력하시면 더 나은 서비스를 제공받을 수 있습니다.
          </p>
        </div>

        {/* 액션 버튼 */}
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
          width: '100%',
          maxWidth: '300px'
        }}>
          <Button
            variant="primary"
            onClick={onContinueToProfile}
            icon="✏️"
            style={{ flex: 1 }}
          >
            프로필 설정하기
          </Button>
        </div>

        {/* 필수 안내 */}
        <div style={{
          padding: '16px',
          borderRadius: '12px',
          background: darkMode 
            ? `rgba(251, 191, 36, 0.1)` 
            : `rgba(251, 191, 36, 0.05)`,
          border: `1px solid ${darkMode ? 'rgba(251, 191, 36, 0.2)' : 'rgba(251, 191, 36, 0.15)'}`,
          maxWidth: '400px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '8px'
          }}>
            <span style={{ fontSize: '16px' }}>💡</span>
            <span style={{
              fontSize: '14px',
              fontWeight: '600',
              color: darkMode ? colors.warning[300] : colors.warning[700]
            }}>
              왜 프로필 설정이 필요한가요?
            </span>
          </div>
          <ul style={{
            fontSize: '13px',
            color: darkMode ? colors.gray[300] : colors.gray[600],
            margin: '0',
            paddingLeft: '20px',
            lineHeight: '1.5'
          }}>
            <li>개인화된 가계부 관리 서비스 제공</li>
            <li>연령대별 맞춤 재정 관리 팁 추천</li>
            <li>향후 소셜 기능 및 커뮤니티 이용</li>
            <li>계정 보안 및 복구를 위한 정보 활용</li>
          </ul>
        </div>
      </div>
    </Modal>
  );
};