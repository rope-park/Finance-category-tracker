/**
 * 폼 관련 타입들
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
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  email?: boolean;
  url?: boolean;
  custom?: (value: any) => boolean | string;
}

// 폼 필드 정의
export interface FormField {
  name: string;
  type: FormFieldType;
  label: string;
  placeholder?: string;
  defaultValue?: any;
  options?: Array<{ label: string; value: any }>;
  validation?: ValidationRule;
  disabled?: boolean;
  readonly?: boolean;
  description?: string;
  group?: string;
}

// 폼 에러
export interface FormError {
  field: string;
  message: string;
  code?: string;
}

// 폼 상태
export interface FormState<T = Record<string, any>> {
  values: T;
  errors: FormError[];
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
}

// 폼 제출 결과
export interface FormSubmitResult<T = any> {
  success: boolean;
  data?: T;
  errors?: FormError[];
  message?: string;
}

// 드롭다운/선택 옵션
export interface SelectOption<T = any> {
  label: string;
  value: T;
  disabled?: boolean;
  description?: string;
  icon?: string;
  color?: string;
}

// 그룹화된 선택 옵션
export interface GroupedSelectOption<T = any> {
  label: string;
  options: SelectOption<T>[];
}

// 체크박스/라디오 그룹
export interface CheckboxGroup {
  name: string;
  options: SelectOption[];
  value: any[];
  onChange: (value: any[]) => void;
}

// 파일 업로드 제약
export interface FileUploadConstraints {
  maxSize: number; // bytes
  allowedTypes: string[];
  maxFiles?: number;
  minFiles?: number;
}

// 폼 스키마 (동적 폼 생성용)
export interface FormSchema<T = Record<string, any>> {
  title?: string;
  description?: string;
  fields: FormField[];
  groups?: Array<{
    name: string;
    title: string;
    fields: string[];
  }>;
  submitLabel?: string;
  cancelLabel?: string;
  validation?: (values: T) => FormError[];
}