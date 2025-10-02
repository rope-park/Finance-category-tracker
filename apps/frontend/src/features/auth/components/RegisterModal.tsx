import React, { useState } from 'react';
import { Modal, Input, Button } from '../../../index';
import { useAuth } from '../hooks/useAuth';
import { useApp } from '../../../app/hooks/useApp';
import { colors } from '../../../styles/theme';
import type { RegisterFormData } from '../../../index';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
  onRegisterSuccess?: () => void; // 회원가입 성공 시 콜백
}

export const RegisterModal: React.FC<RegisterModalProps> = ({
  isOpen,
  onClose,
  onSwitchToLogin,
  onRegisterSuccess
}) => {
  const { register, state: { isLoading, error }, clearError } = useAuth();
  const { darkMode } = useApp();

  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 클라이언트 유효성 검사
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = '이름을 입력해주세요.';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = '이름은 2자 이상이어야 합니다.';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = '이메일을 입력해주세요.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식을 입력해주세요.';
    }
    
    if (!formData.password.trim()) {
      newErrors.password = '비밀번호를 입력해주세요.';
    } else if (formData.password.length < 8) {
      newErrors.password = '비밀번호는 8자 이상이어야 합니다.';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = '비밀번호는 대문자, 소문자, 숫자를 포함해야 합니다.';
    }
    
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = '비밀번호 확인을 입력해주세요.';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
    }
    
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = '이용약관에 동의해주세요.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    clearError();

    try {
      await register(formData);
      onClose();
      // 회원가입 성공 시 프로필 설정 모달 열기
      if (onRegisterSuccess) {
        onRegisterSuccess();
      }
      // 회원가입 성공 시 폼 초기화
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        agreeToTerms: false
      });
    } catch (error) {
      // 에러는 AuthContext에서 처리됨
      console.error('Register error:', error);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreeToTerms: false
    });
    setErrors({});
    clearError();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="🎉 회원가입"
      size="small"
      variant="elevated"
    >
      <div style={{
        background: darkMode 
          ? `linear-gradient(135deg, ${colors.gray[800]} 0%, ${colors.gray[900]} 100%)`
          : `linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)`,
        borderRadius: '16px',
        padding: '24px',
        margin: '-24px -24px 0 -24px'
      }}>
        {/* 헤더 */}
        <div style={{
          textAlign: 'center',
          marginBottom: '24px',
          padding: '16px',
          background: darkMode 
            ? 'rgba(34, 197, 94, 0.1)' 
            : 'rgba(34, 197, 94, 0.05)',
          borderRadius: '12px',
          border: `1px solid ${darkMode ? 'rgba(34, 197, 94, 0.2)' : 'rgba(34, 197, 94, 0.1)'}`
        }}>
          <h3 style={{
            margin: '0 0 8px 0',
            fontSize: '18px',
            fontWeight: '600',
            color: darkMode ? colors.gray[100] : colors.gray[800]
          }}>
            새로운 시작을 환영합니다! 🚀
          </h3>
          <p style={{
            margin: 0,
            fontSize: '14px',
            color: darkMode ? colors.gray[400] : colors.gray[600]
          }}>
            무료로 가입하고 스마트한 가계부 관리를 시작하세요
          </p>
        </div>

        {/* 회원가입 폼 */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* 에러 메시지 */}
          {error && (
            <div style={{
              padding: '12px',
              background: darkMode 
                ? 'rgba(239, 68, 68, 0.1)' 
                : 'rgba(239, 68, 68, 0.05)',
              borderRadius: '8px',
              border: `1px solid ${darkMode ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)'}`
            }}>
              <span style={{
                fontSize: '14px',
                color: darkMode ? colors.error[400] : colors.error[600]
              }}>
                ❌ {error.message}
              </span>
            </div>
          )}

          {/* 이름 */}
          <Input
            label="이름"
            type="text"
            value={formData.name}
            onChange={(value) => setFormData(prev => ({ ...prev, name: value }))}
            placeholder="이름을 입력하세요"
            required
            error={errors.name}
            darkMode={darkMode}
            icon="👤"
          />

          {/* 이메일 */}
          <Input
            label="이메일"
            type="email"
            value={formData.email}
            onChange={(value) => setFormData(prev => ({ ...prev, email: value }))}
            placeholder="이메일을 입력하세요"
            required
            error={errors.email}
            darkMode={darkMode}
            icon="📧"
          />

          {/* 비밀번호 */}
          <Input
            label="비밀번호"
            type="password"
            value={formData.password}
            onChange={(value) => setFormData(prev => ({ ...prev, password: value }))}
            placeholder="비밀번호를 입력하세요 (8자 이상)"
            required
            error={errors.password}
            darkMode={darkMode}
            icon="🔒"
          />

          {/* 비밀번호 확인 */}
          <Input
            label="비밀번호 확인"
            type="password"
            value={formData.confirmPassword}
            onChange={(value) => setFormData(prev => ({ ...prev, confirmPassword: value }))}
            placeholder="비밀번호를 다시 입력하세요"
            required
            error={errors.confirmPassword}
            darkMode={darkMode}
            icon="🔐"
          />

          {/* 이용약관 동의 */}
          <div style={{ marginTop: '8px' }}>
            <label style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
              cursor: 'pointer',
              color: darkMode ? colors.gray[300] : colors.gray[700],
              fontSize: '14px',
              lineHeight: '1.5'
            }}>
              <input
                type="checkbox"
                checked={formData.agreeToTerms}
                onChange={(e) => setFormData(prev => ({ ...prev, agreeToTerms: e.target.checked }))}
                style={{
                  width: '16px',
                  height: '16px',
                  marginTop: '2px',
                  accentColor: colors.primary[500]
                }}
              />
              <span>
                <strong>이용약관</strong> 및 <strong>개인정보처리방침</strong>에 동의합니다.
                <br/>
                <span style={{ fontSize: '12px', color: darkMode ? colors.gray[500] : colors.gray[500] }}>
                  회원가입 시 자동으로 동의됩니다.
                </span>
              </span>
            </label>
            {errors.agreeToTerms && (
              <div style={{
                color: colors.error[500],
                fontSize: '12px',
                marginTop: '4px'
              }}>
                {errors.agreeToTerms}
              </div>
            )}
          </div>

          {/* 회원가입 버튼 */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            icon="✨"
            loading={isLoading}
            style={{ marginTop: '8px' }}
          >
            {isLoading ? '가입 중...' : '회원가입 완료'}
          </Button>

          {/* 비밀번호 가이드 */}
          <div style={{
            padding: '12px',
            background: darkMode 
              ? 'rgba(59, 130, 246, 0.1)' 
              : 'rgba(59, 130, 246, 0.05)',
            borderRadius: '8px',
            border: `1px solid ${darkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)'}`
          }}>
            <div style={{ marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: darkMode ? colors.primary[400] : colors.primary[700] }}>
              🔐 안전한 비밀번호 가이드
            </div>
            <div style={{ fontSize: '12px', color: darkMode ? colors.gray[300] : colors.gray[600], lineHeight: '1.4' }}>
              • 8자 이상의 길이<br/>
              • 대문자와 소문자 포함<br/>
              • 숫자 포함<br/>
              • 특수문자 포함 권장
            </div>
          </div>
        </form>

        {/* 로그인 링크 */}
        <div style={{
          textAlign: 'center',
          marginTop: '24px',
          paddingTop: '20px',
          borderTop: `1px solid ${darkMode ? colors.gray[700] : colors.gray[200]}`
        }}>
          <span style={{
            fontSize: '14px',
            color: darkMode ? colors.gray[400] : colors.gray[600]
          }}>
            이미 계정이 있으신가요?{' '}
          </span>
          <button
            type="button"
            onClick={onSwitchToLogin}
            style={{
              background: 'none',
              border: 'none',
              color: colors.primary[500],
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            로그인하기
          </button>
        </div>
      </div>
    </Modal>
  );
};