/**
 * 프로필 설정 모달 컴포넌트
 * 
 * 주요 기능:
 * - 프로필 사진 업로드 및 미리보기
 * - 기본 정보 수정 (닉네임, 이메일, 전화번호)
 * - 나이대 선택 및 자동 카테고리 추천
 * - 자기소개 작성
 * - 다크모드 지원
 * - 로딩 상태 표시
 * - 프로필 완성 상태 업데이트
 */

import React, { useState, useEffect } from 'react';
import api from '../../../app/services/api';
import { Modal, Button, Input } from '../../../index';
import { useAuth } from '../hooks/useAuth';
import { useApp } from '../../../app/hooks/useApp';
import { colors, borderRadius } from '../../../styles/theme';
import type { User } from '../../../index';

// 프로필 설정 모달 Props 인터페이스
interface ProfileSettingsModalProps {
  isOpen: boolean;                      // 모달 표시 여부
  onClose: () => void;                  // 모달 닫기 콜백
  onComplete?: () => void;              // 프로필 설정 완료 시 콜백 (선택적)
}

/**
 * 프로필 설정 모달 컴포넌트
 * @param param0 ProfileSettingsModalProps
 * @returns JSX.Element
 */
export const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  // 인증 관련 훅: 사용자 정보와 업데이트 함수
  const auth = useAuth() as { state?: { user?: User }, updateUser?: (data: Partial<User>) => Promise<void> };
  const user = auth?.state?.user;
  const updateUser = auth?.updateUser;
  const { darkMode } = useApp();
  
  // 프로필 폼 데이터 상태 관리 (기존 사용자 정보로 초기화)
  const [formData, setFormData] = useState({
    name: user?.name || '',       
    email: user?.email || '',         
    phone: user?.phone_number || '',  
    ageGroup: user?.age_group || '20s', 
    bio: user?.bio || ''          
  });
  
  // 나이대 기반 추천 카테고리 상태 관리
  const [recommendedCategories, setRecommendedCategories] = useState<string[]>([]);
  const [loadingRecommend, setLoadingRecommend] = useState(false);

  // 나이대가 변경될 때마다 추천 카테고리 API 호출
  useEffect(() => {
    const fetchRecommend = async () => {
      setLoadingRecommend(true);
      try {
        const res = await api.getRecommendedCategories(formData.ageGroup);
        if (res.success && res.data) {
          // API 응답 형식 처리: 직접 배열 또는 recommended_categories 속성
          const categories = Array.isArray(res.data) ? res.data : res.data.recommended_categories;
          setRecommendedCategories(categories || []);
        } else {
          setRecommendedCategories([]);
        }
      } catch {
        // API 에러 시 빈 배열로 설정
        setRecommendedCategories([]);
      } finally {
        setLoadingRecommend(false);
      }
    };
    // 나이대가 설정되어 있을 때만 실행
    if (formData.ageGroup) fetchRecommend();
  }, [formData.ageGroup]);  // 나이대 변경 시마다 실행
  
  // 프로필 사진 관련 상태 관리
  const [avatarFile, setAvatarFile] = useState<File | null>(null);                    // 선택된 사진 파일
  const [avatarPreview, setAvatarPreview] = useState<string>(user?.profile_picture || '');  // 사진 미리보기 URL
  const [isLoading, setIsLoading] = useState(false);                                 // 폼 제출 로딩 상태

  // 입력 필드 변경 처리 함수
  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 프로필 사진 파일 선택 처리 함수
  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      
      // FileReader를 사용하여 이미지 미리보기 생성
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // 프로필 업데이트 폼 제출 처리 함수
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let avatarUrl = avatarPreview;
      
      if (avatarFile) {
        // TODO: 실제 프로덕션에서는 서버로 파일 업로드 필요
        // 현재는 로컬 Object URL 사용 (임시 방편)
        avatarUrl = URL.createObjectURL(avatarFile);
      }

      // 업데이트할 사용자 데이터 객체 생성
      const updatedUserData: Partial<User> = {
        name: formData.name,           
        // email: formData.email,  // 보안상 이유로 이메일 변경 비활성화
        phone_number: formData.phone,
        age_group: formData.ageGroup as unknown as User['age_group'],
        profile_picture: avatarUrl,
        bio: formData.bio,
        profile_completed: true,                                        
        updated_at: new Date().toISOString()                           
      };
      
      // 사용자 정보 업데이트 API 호출
      if (updateUser) {
        await updateUser(updatedUserData);
        alert('프로필이 성공적으로 업데이트되었습니다!');
      } else {
        throw new Error('updateUser 함수가 존재하지 않습니다.');
      }
      
      // 완료 콜백 또는 모달 닫기
      if (onComplete) {
        onComplete();     // 회원가입 후 프로필 설정 완료 시 사용
      } else {
        onClose();        // 일반적인 프로필 수정 시 사용
      }
    } catch (error) {
      console.error('프로필 업데이트 오류:', error);
      alert('프로필 업데이트 중 오류가 발생했습니다: ' + (error instanceof Error ? error.message : '알 수 없는 오류'));
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
      {/* 프로필 업데이트 폼: 세로 방향 레이아웃으로 간격 24px */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* 프로필 사진 업로드 섹션 */}
        <div style={{ textAlign: 'center' }}>
          {/* 원형 프로필 사진 또는 기본 아바타 */}
          <div style={{
            width: '120px',
            height: '120px',
            borderRadius: '50%',            
            margin: '0 auto 16px',
            background: avatarPreview 
              ? `url(${avatarPreview}) center/cover`  // 사진이 있으면 배경 이미지로 사용
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
            {/* 사진이 없을 때 닉네임 첫 글자 또는 기본 아이콘 표시 */}
            {!avatarPreview && (formData.name.charAt(0).toUpperCase() || '👤')}
          </div>
          
          {/* 사진 변경 버튼 (숨겨진 파일 입력 포함) */}
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
            {/* 숨겨진 파일 입력 필드 (label로 클릭 이벤트 연결) */}
            <input
              type="file"
              accept="image/*"            
              onChange={handleAvatarChange}
              style={{ display: 'none' }}   
            />
          </label>
        </div>

        {/* 기본 정보 입력 섹션: 2열 그리드 레이아웃 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {/* 닉네임 입력 필드 */}
          <Input
            label="닉네임"
            value={formData.name}
            onChange={(value) => handleInputChange('name', value)}
            placeholder="닉네임을 입력하세요"
            required
          />
          {/* 이메일 입력 필드 (현재는 수정 불가) */}
          <Input
            label="이메일"
            type="email"
            value={formData.email}
            onChange={(value) => handleInputChange('email', value)}
            placeholder="이메일을 입력하세요"
            required
          />
        </div>
        {/* 두 번째 행: 전화번호와 나이대 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {/* 전화번호 입력 필드 */}
          <Input
            label="전화번호"
            value={formData.phone}
            onChange={(value) => handleInputChange('phone', value)}
            placeholder="010-1234-5678"
          />
          {/* 나이대 선택 및 추천 카테고리 섹션 */}
          <div>
            {/* 나이대 라벨 */}
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '500',
              color: darkMode ? colors.gray[300] : colors.gray[700]
            }}>
              나이대
            </label>
            {/* 나이대 선택 드롭다운 */}
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
              <option value="10s">10대</option>
              <option value="20s">20대</option>
              <option value="30s">30대</option>
              <option value="40s">40대</option>
              <option value="50s">50대</option>
              <option value="60s+">60대 이상</option>
            </select>

            {/* 나이대 기반 추천 카테고리 표시 영역 */}
            <div style={{ marginTop: '8px' }}>
              <b>추천 카테고리</b>:{' '}
              {/* 로딩 상태 또는 추천 카테고리 목록 표시 */}
              {loadingRecommend ? '로딩 중...' : recommendedCategories && recommendedCategories.length > 0 ? (
                recommendedCategories.map((cat) => (
                  <span key={cat} style={{
                    display: 'inline-block',
                    background: colors.primary[100],      // 배경 색상
                    color: colors.primary[700],           // 글자 색상
                    borderRadius: borderRadius.sm,
                    padding: '2px 8px',
                    marginRight: '6px',
                    fontSize: '13px',
                  }}>{cat}</span>
                ))
              ) : '없음'}
              {/* 추천 카테고리 바로 적용 버튼 (TODO: 실제 기능 구현 필요) */}
              {recommendedCategories.length > 0 && (
                <button
                  type="button"
                  style={{ marginLeft: 8, fontSize: 13, color: colors.success[600], background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                  onClick={() => alert('추천 카테고리를 예산/카테고리 설정에 바로 적용하는 기능 구현 필요')}
                >
                  추천 카테고리 바로 적용
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 자기소개 입력 영역 */}
        <div>
          {/* 자기소개 라벨 */}
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: '14px',
            fontWeight: '500',
            color: darkMode ? colors.gray[300] : colors.gray[700]
          }}>
            자기소개
          </label>
          {/* 다중 행 텍스트 입력 영역 */}
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

        {/* 버튼 그룹: 취소와 저장 버튼 */}
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end',                                                      
          paddingTop: '16px',
          borderTop: `1px solid ${darkMode ? colors.gray[600] : colors.gray[200]}`         
        }}>
          {/* 취소 버튼 */}
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}                                                       
          >
            취소
          </Button>
          {/* 저장 버튼 */}
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