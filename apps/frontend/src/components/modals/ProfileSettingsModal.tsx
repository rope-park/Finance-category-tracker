import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useAuth } from '../../hooks/useAuth';
import { useApp } from '../../hooks/useApp';
import { colors, borderRadius } from '../../styles/theme';
import type { User } from '../../types/auth';

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({
  isOpen,
  onClose
}) => {
  const { state: { user }, updateUser } = useAuth();
  const { darkMode } = useApp();
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    ageGroup: user?.ageGroup || '20대' as const,
    bio: user?.bio || ''
  });
  
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>(user?.avatar || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      
      // 미리보기 생성
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 실제 프로젝트에서는 서버에 업로드
      let avatarUrl = avatarPreview;
      
      if (avatarFile) {
        // 여기서는 임시로 File URL 사용 (실제로는 서버 업로드)
        avatarUrl = URL.createObjectURL(avatarFile);
      }

      const updatedUserData: Partial<User> = {
        ...formData,
        avatar: avatarUrl,
        profileCompleted: true // 프로필 설정 완료 표시
      };

      updateUser(updatedUserData);
      
      // 성공 메시지
      alert('프로필이 성공적으로 업데이트되었습니다!');
      onClose();
    } catch (error) {
      console.error('프로필 업데이트 오류:', error);
      alert('프로필 업데이트 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="프로필 설정"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* 프로필 사진 */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            margin: '0 auto 16px',
            background: avatarPreview 
              ? `url(${avatarPreview}) center/cover`
              : `linear-gradient(135deg, ${colors.primary[400]} 0%, ${colors.primary[600]} 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '48px',
            color: 'white',
            border: `3px solid ${darkMode ? colors.gray[600] : colors.gray[200]}`,
            position: 'relative',
            overflow: 'hidden'
          }}>
            {!avatarPreview && (formData.name.charAt(0).toUpperCase() || '👤')}
          </div>
          
          <label style={{
            display: 'inline-block',
            padding: '8px 16px',
            background: darkMode ? colors.gray[700] : colors.gray[100],
            color: darkMode ? colors.gray[200] : colors.gray[700],
            borderRadius: borderRadius.md,
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            📷 사진 변경
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              style={{ display: 'none' }}
            />
          </label>
        </div>

        {/* 기본 정보 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Input
            label="닉네임"
            value={formData.name}
            onChange={(value) => handleInputChange('name', value)}
            placeholder="닉네임을 입력하세요"
            required
          />
          
          <Input
            label="이메일"
            type="email"
            value={formData.email}
            onChange={(value) => handleInputChange('email', value)}
            placeholder="이메일을 입력하세요"
            required
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Input
            label="전화번호"
            value={formData.phone}
            onChange={(value) => handleInputChange('phone', value)}
            placeholder="010-1234-5678"
          />
          
          <div>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '500',
              color: darkMode ? colors.gray[300] : colors.gray[700]
            }}>
              나이대
            </label>
            <select
              value={formData.ageGroup}
              onChange={(e) => handleInputChange('ageGroup', e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: `2px solid ${darkMode ? colors.gray[600] : colors.gray[300]}`,
                borderRadius: borderRadius.lg,
                background: darkMode ? colors.gray[700] : '#ffffff',
                color: darkMode ? colors.gray[100] : colors.gray[900],
                fontSize: '16px',
                outline: 'none'
              }}
            >
              <option value="10대">10대</option>
              <option value="20대">20대</option>
              <option value="30대">30대</option>
              <option value="40대">40대</option>
              <option value="50대">50대</option>
              <option value="60대 이상">60대 이상</option>
            </select>
          </div>
        </div>

        {/* 자기소개 */}
        <div>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: '14px',
            fontWeight: '500',
            color: darkMode ? colors.gray[300] : colors.gray[700]
          }}>
            자기소개
          </label>
          <textarea
            value={formData.bio}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            placeholder="간단한 자기소개를 작성해주세요..."
            rows={4}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: `2px solid ${darkMode ? colors.gray[600] : colors.gray[300]}`,
              borderRadius: borderRadius.lg,
              background: darkMode ? colors.gray[700] : '#ffffff',
              color: darkMode ? colors.gray[100] : colors.gray[900],
              fontSize: '16px',
              outline: 'none',
              resize: 'vertical',
              fontFamily: 'inherit'
            }}
          />
        </div>

        {/* 버튼 그룹 */}
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end',
          paddingTop: '16px',
          borderTop: `1px solid ${darkMode ? colors.gray[600] : colors.gray[200]}`
        }}>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            취소
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={isLoading}
            icon="💾"
          >
            저장
          </Button>
        </div>
      </form>
    </Modal>
  );
};
