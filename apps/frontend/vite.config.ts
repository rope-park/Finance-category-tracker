/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@finance-tracker/shared': path.resolve(__dirname, '../../packages/shared/src'),
    },
  },
  build: {
    // 번들 최적화
    rollupOptions: {
      output: {
        manualChunks: {
          // React 관련 라이브러리 분리
          'react-vendor': ['react', 'react-dom'],
          // UI 라이브러리 분리
          'ui-vendor': ['recharts', 'lucide-react'],
          // 라우팅 관련 분리
          'router-vendor': ['react-router-dom'],
          // 날짜/시간 관련 분리
          'date-vendor': ['date-fns'],
          // HTTP 클라이언트 분리
          'http-vendor': ['axios']
        }
      }
    },
    // 빌드 성능 개선
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: process.env.NODE_ENV === 'development',
    // 청크 크기 경고 임계값 증가
    chunkSizeWarningLimit: 1000
  },
  // 개발 서버 최적화
  server: {
    port: 3000,
    open: true,
    cors: true,
    // HMR 최적화
    hmr: {
      overlay: false
    }
  },
  // Preview 서버 설정
  preview: {
    port: 3000,
    open: true
  },
  // 의존성 최적화
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'recharts',
      'date-fns',
      'axios',
      'lucide-react'
    ]
  },
  // @ts-expect-error - test config is for vitest but not recognized by vite types
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.ts'],
    // 테스트 성능 최적화
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true
      }
    },
    // 커버리지 설정
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/tests/',
        '**/*.d.ts',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}'
      ]
    }
  },
})
