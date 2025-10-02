/**
 * Vite 빌드 도구 설정 파일
 * 
 * 주요 설정:
 * - React 19 지원 및 최적화
 * - TypeScript 지원
 * - 모듈 별칭 (alias) 설정
 * - 번들 최적화 및 청크 분할
 * - 개발 서버 설정
 * - 의존성 사전 번들링
 * 
 * @author Finance Category Tracker Team
 * @version 1.0.0
 */

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  // ==================================================
  // 플러그인 설정
  // ==================================================
  
  /** React 플러그인 등록 - JSX 변환 및 Hot Reload 지원 */
  plugins: [react()],
  
  // ==================================================
  // 모듈 해결 설정
  // ==================================================
  
  resolve: {
    /** 모듈 별칭 설정 - import 경로 단축 */
    alias: {
      '@': path.resolve(__dirname, './src'),                                              // 소스 디렉토리 별칭
    },
    /** React 19 호환성을 위한 모듈 중복 제거 */
    dedupe: ['react', 'react-dom'],
  },
  
  // ==================================================
  // 의존성 사전 번들링 설정
  // ==================================================
  
  /** React 19 및 주요 라이브러리 최적화 */
  optimizeDeps: {
    /** 사전 번들링할 라이브러리 목록 */
    include: [
      'react',                    // React 코어
      'react-dom',               // React DOM
      'react/jsx-runtime',       // JSX 런타임
      'react-router-dom',        // 라우팅
      'recharts',                // 차트 라이브러리
      'date-fns',                // 날짜 유틸리티
      'axios',                   // HTTP 클라이언트
      'lucide-react',            // 아이콘 라이브러리
      '@finance-tracker/shared'  // 공유 패키지
    ],
    /** 강제 사전 번들링 - 캐시 무시 */
    force: true,
  },
  build: {
    // 번들 최적화 - React 19에 맞게 수정
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // 노드 모듈 기반 청크 분할 (메모리 최적화)
          if (id.includes('node_modules')) {
            // React 코어
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-core';
            }
            // 라우팅
            if (id.includes('react-router-dom')) {
              return 'react-router';
            }
            // 차트 라이브러리
            if (id.includes('recharts') || id.includes('chart.js')) {
              return 'chart-vendor';
            }
            // UI 라이브러리
            if (id.includes('lucide-react') || id.includes('@heroicons')) {
              return 'ui-vendor';
            }
            // 유틸리티
            if (id.includes('date-fns') || id.includes('axios')) {
              return 'utils-vendor';
            }
            // 기타 벤더 라이브러리
            return 'vendor';
          }
        }
      }
    },
    // 빌드 성능 개선
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: process.env.NODE_ENV === 'development',
    // 청크 크기 경고 임계값 감소 (메모리 최적화)
    chunkSizeWarningLimit: 500,
    // CSS 코드 스플리팅
    cssCodeSplit: true,
    // 메모리 최적화 옵션
    assetsInlineLimit: 4096, // 4KB 이하 에셋은 인라인
    reportCompressedSize: false, // 빌드 시 크기 보고 비활성화로 성능 향상
    copyPublicDir: true
  },
  // 개발 서버 최적화
  server: {
    port: 3000,
    open: true,
    cors: true,
    // HMR 최적화
    hmr: {
      overlay: false
    },
    // 메모리 최적화
    watch: {
      ignored: ['**/node_modules/**', '**/dist/**'],
      usePolling: false
    }
  },
  // Preview 서버 설정
  preview: {
    port: 3000,
    open: true
  }
})