import React, { useState, useEffect } from 'react';
import api from '../../services/api';
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
  onComplete?: () => void; // 선택적 prop 추가
}

export const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  const auth = useAuth() as { state?: { user?: User }, updateUser?: (data: Partial<User>) => Promise<void> };
  const user = auth?.state?.user;
  const updateUser = auth?.updateUser;
  const { darkMode } = useApp();
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone_number || '',
    ageGroup: user?.age_group || '20s',
    jobGroup: user?.job_group || 'etc',
    bio: user?.bio || ''
  });
  // 추천 카테고리 상태
  const [recommendedCategories, setRecommendedCategories] = useState<string[]>([]);
  const [loadingRecommend, setLoadingRecommend] = useState(false);

  // 나이대/직업군 변경 시 추천 카테고리 fetch
  useEffect(() => {
    const fetchRecommend = async () => {
      setLoadingRecommend(true);
      try {
        const res = await api.getRecommendedCategories(formData.ageGroup, formData.jobGroup);
        if (res.success && res.data) {
          setRecommendedCategories(res.data.recommended_categories);
        } else {
          setRecommendedCategories([]);
        }
      } catch {
        setRecommendedCategories([]);
      } finally {
        setLoadingRecommend(false);
      }
    };
    if (formData.ageGroup && formData.jobGroup) fetchRecommend();
  }, [formData.ageGroup, formData.jobGroup]);
  
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>(user?.profile_picture || '');
// ...이하 생략 (기존 코드 동일하게 복사)...
