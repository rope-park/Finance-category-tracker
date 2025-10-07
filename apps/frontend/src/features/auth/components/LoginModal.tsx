/**
 * 로그인 모달 컴포넌트
 * 
 * 주요 기능:
 * - 이메일/비밀번호 기반 로그인
 * - 클라이언트 사이드 유효성 검사
 * - 로그인 상태 유지 옵션
 * - 데모 계정 안내
 * - 회원가입 페이지로 전환
 * - 다크모드 지원
 * - 로딩 상태 표시
 */

import React, { useState } from 'react';
import { Modal, Input, Button } from '../../../index';
import { useAuth } from '../hooks/useAuth';
import { useApp } from '../../../app/hooks/useApp';
import { colors } from '../../../styles/theme';
import type { LoginFormData } from '../../../index';

// 로그인 모달 Props 인터페이스
interface LoginModalProps {
  isOpen: boolean;                      // 모달 표시 여부
  onClose: () => void;                  // 모달 닫기 콜백
  onSwitchToRegister: () => void;       // 회원가입 모달로 전환 콜백
}

/**
 * 로그인 모달 컴포넌트
 * @param param0 LoginModalProps
 * @returns JSX.Element
 */
export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onSwitchToRegister
}) => {
  const { login, state: { isLoading, error }, clearError } = useAuth();
  const { darkMode } = useApp();

  // 로그인 폼 데이터 상태 관리
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',          
    password: '',         
    rememberMe: false   
  });

  // 유효성 검사 에러 메시지 상태
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 클라이언트 유효성 검사 수행
    const newErrors: Record<string, string> = {};
    
    // 이메일 유효성 검사
    if (!formData.email.trim()) {
      newErrors.email = '이메일을 입력해주세요.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식을 입력해주세요.';
    }
    
    // 비밀번호 유효성 검사
    if (!formData.password.trim()) {
      newErrors.password = '비밀번호를 입력해주세요.';
    } else if (formData.password.length < 6) {
      newErrors.password = '비밀번호는 6자 이상이어야 합니다.';
    }

    // 유효성 검사 실패 시 에러 표시하고 종료
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // 에러 상태 초기화
    setErrors({});
    clearError();

    try {
      await login(formData);
      onClose();
      // 폼 데이터 초기화 (보안상 중요)
      setFormData({
        email: '',
        password: '',
        rememberMe: false
      });
    } catch (error) {
      // 에러는 AuthContext에서 전역적으로 처리됨
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
      {/* 메인 컨테이너: 그라데이션 배경과 둥근 모서리 적용 */}
      <div style={{
        background: darkMode 
          ? `linear-gradient(135deg, ${colors.gray[800]} 0%, ${colors.gray[900]} 100%)`
          : `linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)`,
        borderRadius: '16px',
        padding: '24px',
        margin: '-24px -24px 0 -24px'
      }}>
        {/* 환영 메시지 헤더 섹션 */}
        <div style={{
          textAlign: 'center',
          marginBottom: '24px',
          padding: '16px',
          background: darkMode 
            ? 'rgba(59, 130, 246, 0.1)'     // 다크모드: 파란색 투명 배경
            : 'rgba(59, 130, 246, 0.05)',   // 라이트모드: 연한 파란색 배경
          borderRadius: '12px',
          border: `1px solid ${darkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)'}`
        }}>
          {/* 메인 타이틀 */}
          <h3 style={{
            margin: '0 0 8px 0',
            fontSize: '18px',
            fontWeight: '600',
            color: darkMode ? colors.gray[100] : colors.gray[800]
          }}>
            환영합니다! 👋
          </h3>
          {/* 서브 타이틀 */}
          <p style={{
            margin: 0,
            fontSize: '14px',
            color: darkMode ? colors.gray[400] : colors.gray[600]
          }}>
            로그인하여 개인 맞춤 가계부를 이용하세요
          </p>
        </div>

        {/* 로그인 폼: 세로 방향 레이아웃으로 간격 20px */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* 서버 에러 메시지 표시 영역 */}
          {error && (
            <div style={{
              padding: '12px',
              background: darkMode 
                ? 'rgba(239, 68, 68, 0.1)'     // 다크모드: 빨간색 투명 배경
                : 'rgba(239, 68, 68, 0.05)',   // 라이트모드: 연한 빨간색 배경
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

          {/* 이메일 입력 필드 */}
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

          {/* 비밀번호 입력 필드 */}
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

          {/* 로그인 옵션 섹션: 로그인 유지 체크박스와 비밀번호 찾기 링크 */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '14px'
          }}>
            {/* 로그인 상태 유지 체크박스 */}
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
                  accentColor: colors.primary[500]  // 체크박스 강조 색상
                }}
              />
              로그인 상태 유지
            </label>
            
            {/* 비밀번호 찾기 링크 (현재는 알림창 표시) */}
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

          {/* 로그인 제출 버튼: 로딩 상태 표시 및 아이콘 포함 */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            icon="🚀"
            loading={isLoading}             // 로그인 중 로딩 스피너 표시
            style={{ marginTop: '8px' }}
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </Button>

          {/* 데모 계정 안내 섹션: 테스트용 계정 정보 제공 */}
          <div style={{
            padding: '12px',
            background: darkMode 
              ? 'rgba(34, 197, 94, 0.1)'     // 다크모드: 초록색 투명 배경
              : 'rgba(34, 197, 94, 0.05)',   // 라이트모드: 연한 초록색 배경
            borderRadius: '8px',
            border: `1px solid ${darkMode ? 'rgba(34, 197, 94, 0.2)' : 'rgba(34, 197, 94, 0.1)'}`
          }}>
            {/* 데모 계정 제목 */}
            <div style={{ marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: darkMode ? colors.success[400] : colors.success[700] }}>
              💡 데모 계정
            </div>
            {/* 데모 계정 정보 */}
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

        {/* 회원가입 전환 링크 섹션 */}
        <div style={{
          textAlign: 'center',
          marginTop: '24px',
          paddingTop: '20px',
          borderTop: `1px solid ${darkMode ? colors.gray[700] : colors.gray[200]}`  
        }}>
          {/* 안내 텍스트 */}
          <span style={{
            fontSize: '14px',
            color: darkMode ? colors.gray[400] : colors.gray[600]
          }}>
            아직 계정이 없으신가요?{' '}
          </span>
          {/* 회원가입 모달로 전환하는 버튼 */}
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