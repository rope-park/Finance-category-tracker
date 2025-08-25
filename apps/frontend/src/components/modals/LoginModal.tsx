import React, { useState } from 'react';
import { Modal, Input, Button } from '../ui';
import { useAuth } from '../../hooks/useAuth';
import { useApp } from '../../hooks/useApp';
import { colors } from '../../styles/theme';
import type { LoginFormData } from '../../types/auth';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onSwitchToRegister
}) => {
  const { login, state: { isLoading, error }, clearError } = useAuth();
  const { darkMode } = useApp();

  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 클라이언트 유효성 검사
    const newErrors: Record<string, string> = {};
    
    if (!formData.email.trim()) {
      newErrors.email = '이메일을 입력해주세요.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식을 입력해주세요.';
    }
    
    if (!formData.password.trim()) {
      newErrors.password = '비밀번호를 입력해주세요.';
    } else if (formData.password.length < 6) {
      newErrors.password = '비밀번호는 6자 이상이어야 합니다.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    clearError();

    try {
      await login(formData);
      onClose();
      // 로그인 성공 시 폼 초기화
      setFormData({
        email: '',
        password: '',
        rememberMe: false
      });
    } catch (error) {
      // 에러는 AuthContext에서 처리됨
      console.error('Login error:', error);
    }
  };

  const handleClose = () => {
    setFormData({
      email: '',
      password: '',
      rememberMe: false
    });
    setErrors({});
    clearError();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="🔐 로그인"
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
            ? 'rgba(59, 130, 246, 0.1)' 
            : 'rgba(59, 130, 246, 0.05)',
          borderRadius: '12px',
          border: `1px solid ${darkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)'}`
        }}>
          <h3 style={{
            margin: '0 0 8px 0',
            fontSize: '18px',
            fontWeight: '600',
            color: darkMode ? colors.gray[100] : colors.gray[800]
          }}>
            환영합니다! 👋
          </h3>
          <p style={{
            margin: 0,
            fontSize: '14px',
            color: darkMode ? colors.gray[400] : colors.gray[600]
          }}>
            로그인하여 개인 맞춤 가계부를 이용하세요
          </p>
        </div>

        {/* 로그인 폼 */}
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
            placeholder="비밀번호를 입력하세요"
            required
            error={errors.password}
            darkMode={darkMode}
            icon="🔒"
          />

          {/* 로그인 유지 및 비밀번호 찾기 */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '14px'
          }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              color: darkMode ? colors.gray[300] : colors.gray[700]
            }}>
              <input
                type="checkbox"
                checked={formData.rememberMe}
                onChange={(e) => setFormData(prev => ({ ...prev, rememberMe: e.target.checked }))}
                style={{
                  width: '16px',
                  height: '16px',
                  accentColor: colors.primary[500]
                }}
              />
              로그인 상태 유지
            </label>
            
            <button
              type="button"
              style={{
                background: 'none',
                border: 'none',
                color: colors.primary[500],
                fontSize: '14px',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
              onClick={() => alert('비밀번호 찾기 기능은 추후 구현 예정입니다.')}
            >
              비밀번호 찾기
            </button>
          </div>

          {/* 로그인 버튼 */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            icon="🚀"
            loading={isLoading}
            style={{ marginTop: '8px' }}
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </Button>

          {/* 데모 계정 안내 */}
          <div style={{
            padding: '12px',
            background: darkMode 
              ? 'rgba(34, 197, 94, 0.1)' 
              : 'rgba(34, 197, 94, 0.05)',
            borderRadius: '8px',
            border: `1px solid ${darkMode ? 'rgba(34, 197, 94, 0.2)' : 'rgba(34, 197, 94, 0.1)'}`
          }}>
            <div style={{ marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: darkMode ? colors.success[400] : colors.success[700] }}>
              💡 데모 계정
            </div>
            <div style={{ fontSize: '13px', color: darkMode ? colors.gray[300] : colors.gray[600] }}>
              <div style={{ marginBottom: '8px' }}>
                <strong>완성된 계정:</strong><br/>
                이메일: test@example.com<br/>
                비밀번호: password123
              </div>
              <div>
                <strong>미완성 계정:</strong><br/>
                이메일: incomplete@test.com<br/>
                비밀번호: test123
              </div>
            </div>
          </div>
        </form>

        {/* 회원가입 링크 */}
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
            아직 계정이 없으신가요?{' '}
          </span>
          <button
            type="button"
            onClick={onSwitchToRegister}
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
            회원가입하기
          </button>
        </div>
      </div>
    </Modal>
  );
};