/**
 * React 애플리케이션 진입점 (Entry Point)
 * 
 * Finance Category Tracker 프론트엔드 애플리케이션의 최상위 진입점.
 * React 19의 createRoot API를 사용하여 애플리케이션을 DOM에 마운트.
 * StrictMode를 적용하여 개발 중 잠재적 문제 조기 발견 가능.
 * 
 * 주요 기능:
 * - React 19의 새로운 Root API를 사용한 애플리케이션 초기화
 * - StrictMode를 통한 개발 시 엄격한 검사 모드 적용
 * - 전역 CSS 스타일 파일 로드
 * - DOM 요소 존재 여부 검증 및 오류 처리
 * 
 * @author Ju Eul Park (rope-park)
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// DOM에서 React 애플리케이션이 마운트될 컨테이너 요소를 찾음
const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element not found');
}

// React 19의 createRoot API를 사용하여 루트 렌더러 생성
const root = createRoot(container);

// StrictMode로 감싸서 개발 중 잠재적 문제를 조기 발견할 수 있도록 함
// StrictMode는 개발 모드에서만 동작하며 프로덕션 빌드에는 영향을 주지 않음
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
