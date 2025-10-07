/**
 * 폼 관련 공통 타입들
 */

// 폼 필드 타입
export type FormFieldType = 
  | 'text' 
  | 'email' 
  | 'password' 
  | 'number' 
  | 'tel' 
  | 'url'
  | 'textarea' 
  | 'select' 
  | 'multiselect'
  | 'checkbox' 
  | 'radio' 
  | 'date' 
  | 'datetime-local'
  | 'file' 
  | 'hidden';

// 폼 필드 검증 규칙
export interface ValidationRule {
  required?: boolean;                          // 필수 여부
  min?: number;                                // 최소값
  max?: number;                                // 최대값
  minLength?: number;                          // 최소 길이
  maxLength?: number;                          // 최대 길이
  pattern?: RegExp;                            // 정규식 패턴
  email?: boolean;                             // 이메일 형식 검증
  url?: boolean;                               // URL 형식 검증
  custom?: (value: any) => boolean | string;   // 사용자 정의 검증
}

// 폼 필드 정의
export interface FormField {
  name: string;                                        // 필드 이름
  type: FormFieldType;                                 // 필드 타입
  label: string;                                       // 라벨 텍스트
  placeholder?: string;                                // 플레이스홀더
  defaultValue?: any;                                  // 기본값
  options?: Array<{ label: string; value: any }>;     // 선택 옵션
  validation?: ValidationRule;                         // 검증 규칙
  disabled?: boolean;                                  // 비활성 여부
  readonly?: boolean;                                  // 읽기 전용 여부
  description?: string;                                // 설명 텍스트
  group?: string;                                      // 그룹 이름
}

// 폼 에러
export interface FormError {
  field: string;    // 에러가 발생한 필드
  message: string;  // 에러 메시지
  code?: string;    // 에러 코드
}

// 폼 상태
export interface FormState<T = Record<string, any>> {
  values: T;                          // 폼 데이터
  errors: FormError[];                // 에러 목록
  touched: Record<string, boolean>;   // 터치된 필드
  isSubmitting: boolean;              // 제출 중 여부
  isValid: boolean;                   // 유효성 여부
  isDirty: boolean;                   // 변경 여부
}

// 폼 제출 결과
export interface FormSubmitResult<T = any> {
  success: boolean;      // 성공 여부
  data?: T;              // 응답 데이터
  errors?: FormError[];  // 에러 목록
  message?: string;      // 메시지
}

// 드롭다운/선택 옵션
export interface SelectOption<T = any> {
  label: string;        // 표시 텍스트
  value: T;             // 옵션 값
  disabled?: boolean;   // 비활성 여부
  description?: string; // 설명
  icon?: string;        // 아이콘
  color?: string;       // 색상
}

// 그룹화된 선택 옵션
export interface GroupedSelectOption<T = any> {
  label: string;               // 그룹 라벨
  options: SelectOption<T>[];  // 옵션 목록
}

// 체크박스/라디오 그룹
export interface CheckboxGroup {
  name: string;                      // 그룹 이름
  options: SelectOption[];           // 옵션 목록
  value: any[];                      // 선택된 값
  onChange: (value: any[]) => void;  // 변경 핸들러
}

// 파일 업로드 제약
export interface FileUploadConstraints {
  maxSize: number;         // 최대 파일 크기(bytes)
  allowedTypes: string[];  // 허용된 파일 타입
  maxFiles?: number;       // 최대 파일 수
  minFiles?: number;       // 최소 파일 수
}

// 폼 스키마 (동적 폼 생성용)
export interface FormSchema<T = Record<string, any>> {
  title?: string;           // 폼 제목
  description?: string;     // 폼 설명
  fields: FormField[];      // 필드 목록
  groups?: Array<{          // 필드 그룹
    name: string;           // 그룹 이름
    title: string;          // 그룹 제목
    fields: string[];       // 그룹에 포함된 필드
  }>;
  submitLabel?: string;     // 제출 버튼 텍스트
  cancelLabel?: string;     // 취소 버튼 텍스트
  validation?: (values: T) => FormError[]; // 폼 전체 검증
}