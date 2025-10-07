/**
 * 회원가입 모달 컴포넌트
 * 
 * 주요 기능:
 * - 사용자 정보 입력 폼 (이름, 이메일, 비밀번호)
 * - 강력한 클라이언트 사이드 유효성 검사
 * - 비밀번호 강도 검증 (대소문자, 숫자 포함)
 * - 비밀번호 확인 매칭 검사
 * - 이용약관 동의 체크박스
 * - 회원가입 성공 시 콜백 처리
 * - 로그인 페이지로 전환
 * - 다크모드 지원
 * - 로딩 상태 표시
 */

import React, { useState } from 'react';
import { Modal, Input, Button } from '../../../index';
import { useAuth } from '../hooks/useAuth';
import { useApp } from '../../../app/hooks/useApp';
import { colors } from '../../../styles/theme';
import type { RegisterFormData } from '../../../index';

// 회원가입 모달 Props 인터페이스
interface RegisterModalProps {
  isOpen: boolean;                      // 모달 표시 여부
  onClose: () => void;                  // 모달 닫기 콜백
  onSwitchToLogin: () => void;          // 로그인 모달로 전환 콜백
  onRegisterSuccess?: () => void;       // 회원가입 성공 시 콜백 (프로필 설정 모달 등)
}

/**
 * 회원가입 모달 컴포넌트
 * @param param0 RegisterModalProps
 * @returns JSX.Element
 */
export const RegisterModal: React.FC<RegisterModalProps> = ({
  isOpen,
  onClose,
  onSwitchToLogin,
  onRegisterSuccess
}) => {
  // AuthContext에서 회원가입 함수와 상태 가져오기
  const { register, state: { isLoading, error }, clearError } = useAuth();
  const { darkMode } = useApp();

  // 회원가입 폼 데이터 상태 관리
  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // 폼 제출 처리 함수
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    
    // 이름 유효성 검사
    if (!formData.name.trim()) {
      newErrors.name = '이름을 입력해주세요.';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = '이름은 2자 이상이어야 합니다.';
    }
    
    // 이메일 유효성 검사
    if (!formData.email.trim()) {
      newErrors.email = '이메일을 입력해주세요.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식을 입력해주세요.';
    }
    
    // 비밀번호 강도 검사 (8자 이상, 대소문자, 숫자 포함)
    if (!formData.password.trim()) {
      newErrors.password = '비밀번호를 입력해주세요.';
    } else if (formData.password.length < 8) {
      newErrors.password = '비밀번호는 8자 이상이어야 합니다.';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = '비밀번호는 대문자, 소문자, 숫자를 포함해야 합니다.';
    }
    
    // 비밀번호 확인 매칭 검사
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = '비밀번호 확인을 입력해주세요.';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
    }
    
    // 이용약관 동의 검사
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = '이용약관에 동의해주세요.';
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
      // 회원가입 API 호출
      await register(formData);
      // 회원가입 성공 시 모달 닫기
      onClose();
      // 회원가입 성공 시 프로필 설정 모달 열기 (옵션)
      if (onRegisterSuccess) {
        onRegisterSuccess();
      }
      // 보안상 중요: 폼 데이터 초기화
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        agreeToTerms: false
      });
    } catch (error) {
      // 에러는 AuthContext에서 전역적으로 처리됨
      console.error('Register error:', error);
    }
  };

  // 모달 닫기 처리 함수
  const handleClose = () => {
    // 폼 데이터 초기화
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreeToTerms: false
    });
    // 에러 상태 초기화
    setErrors({});
    clearError();
    // 모달 닫기
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
      {/* 메인 컴테이너: 그라디언트 배경과 둥근 모서리 적용 */}
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
            ? 'rgba(34, 197, 94, 0.1)'     // 다크모드: 초록색 투명 배경
            : 'rgba(34, 197, 94, 0.05)',   // 라이트모드: 연한 초록색 배경
          borderRadius: '12px',
          border: `1px solid ${darkMode ? 'rgba(34, 197, 94, 0.2)' : 'rgba(34, 197, 94, 0.1)'}`
        }}>
          {/* 메인 타이틀 */}
          <h3 style={{
            margin: '0 0 8px 0',
            fontSize: '18px',
            fontWeight: '600',
            color: darkMode ? colors.gray[100] : colors.gray[800]
          }}>
            새로운 시작을 환영합니다! 🚀
          </h3>
          {/* 서브 타이틀 */}
          <p style={{
            margin: 0,
            fontSize: '14px',
            color: darkMode ? colors.gray[400] : colors.gray[600]
          }}>
            무료로 가입하고 스마트한 가계부 관리를 시작하세요
          </p>
        </div>

        {/* 회원가입 폼: 세로 방향 레이아웃으로 간격 20px */}
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

          {/* 이름 입력 필드 (2자 이상 요구) */}
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

          {/* 이메일 입력 필드 (이메일 형식 검증) */}
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

          {/* 비밀번호 입력 필드 (8자 이상, 대소문자, 숫자 포함) */}
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

          {/* 비밀번호 확인 입력 필드 (매칭 검증) */}
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

          {/* 이용약관 및 개인정보처리방침 동의 체크박스 */}
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
              {/* 동의 체크박스 */}
              <input
                type="checkbox"
                checked={formData.agreeToTerms}
                onChange={(e) => setFormData(prev => ({ ...prev, agreeToTerms: e.target.checked }))}
                style={{
                  width: '16px',
                  height: '16px',
                  marginTop: '2px',
                  accentColor: colors.primary[500]  // 체크박스 강조 색상
                }}
              />
              {/* 동의 항목 텍스트 */}
              <span>
                <strong>이용약관</strong> 및 <strong>개인정보처리방침</strong>에 동의합니다.
                <br/>
                <span style={{ fontSize: '12px', color: darkMode ? colors.gray[500] : colors.gray[500] }}>
                  회원가입 시 자동으로 동의됩니다.
                </span>
              </span>
            </label>
            {/* 동의 체크박스 에러 메시지 */}
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

          {/* 회원가입 제출 버튼: 로딩 상태 표시 및 아이콘 포함 */}
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

          {/* 비밀번호 보안 가이드 섹션: 사용자에게 비밀번호 요구사항 안내 */}
          <div style={{
            padding: '12px',
            background: darkMode 
              ? 'rgba(59, 130, 246, 0.1)'   // 다크모드: 파란색 투명 배경
              : 'rgba(59, 130, 246, 0.05)', // 라이트모드: 연한 파란색 배경
            borderRadius: '8px',
            border: `1px solid ${darkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)'}`
          }}>
            {/* 가이드 제목 */}
            <div style={{ marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: darkMode ? colors.primary[400] : colors.primary[700] }}>
              🔐 안전한 비밀번호 가이드
            </div>
            {/* 비밀번호 요구사항 목록 */}
            <div style={{ fontSize: '12px', color: darkMode ? colors.gray[300] : colors.gray[600], lineHeight: '1.4' }}>
              • 8자 이상의 길이<br/>
              • 대문자와 소문자 포함<br/>
              • 숫자 포함<br/>
              • 특수문자 포함 권장
            </div>
          </div>
        </form>

        {/* 로그인 전환 링크 섹션 */}
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
            이미 계정이 있으신가요?{' '}
          </span>
          {/* 로그인 모달로 전환하는 버튼 */}
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