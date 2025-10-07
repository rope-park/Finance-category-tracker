/**
 * ESLint 린터 설정 파일
 * 
 * React + TypeScript 프로젝트를 위한 ESLint 설정.
 * 코드 품질과 일관성을 유지하기 위한 규칙들 정의함.
 * 
 * 주요 설정:
 * - TypeScript 지원
 * - React Hooks 규칙
 * - React Refresh 지원 (개발 시 Hot Reload)
 * - 브라우저 환경 전역 변수 지원
 * 
 * @author Ju Eul Park (rope-park)
 */

// ESLint 기본 설정 및 플러그인 import
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { globalIgnores } from 'eslint/config'

export default tseslint.config([
  /** 빌드 출력 디렉토리 무시 */
  globalIgnores(['dist']),
  
  {
    /** TypeScript 파일들에 적용할 설정 */
    files: ['**/*.{ts,tsx}'],
    
    /** 확장할 설정들 */
    extends: [
      js.configs.recommended,                      // JavaScript 기본 권장 규칙
      tseslint.configs.recommended,               // TypeScript 권장 규칙
      reactHooks.configs['recommended-latest'],   // React Hooks 최신 권장 규칙
      reactRefresh.configs.vite,                 // Vite React Refresh 설정
    ],
    
    /** 언어 및 환경 설정 */
    languageOptions: {
      ecmaVersion: 2020,           // ES2020 문법 지원
      globals: globals.browser,    // 브라우저 전역 변수 지원 (window, document 등)
    },
  },
])
