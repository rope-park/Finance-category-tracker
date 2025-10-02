import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// 각 테스트 후 정리
afterEach(() => {
  cleanup();
});

// Mock 설정
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// LocalStorage mock
const localStorageMock = {
  getItem: (key: string) => {
    return localStorageMock[key] || null;
  },
  setItem: (key: string, value: string) => {
    localStorageMock[key] = value;
  },
  removeItem: (key: string) => {
    delete localStorageMock[key];
  },
  clear: () => {
    Object.keys(localStorageMock).forEach(key => {
      if (key !== 'getItem' && key !== 'setItem' && key !== 'removeItem' && key !== 'clear') {
        delete localStorageMock[key];
      }
    });
  }
} as Storage;

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// ResizeObserver mock
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// IntersectionObserver mock
global.IntersectionObserver = class IntersectionObserver {
  root: Element | null = null;
  rootMargin: string = '';
  thresholds: ReadonlyArray<number> = [];
  constructor() {
    // Mock implementation - no parameters needed
  }
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
};

// window.alert mock
global.alert = () => {};

// window.confirm mock
global.confirm = () => true;

// window.prompt mock
global.prompt = () => null;

// Console 경고 필터링 (React Router Future Flag 경고 제거)
const originalWarn = console.warn;
console.warn = (...args) => {
  const message = args[0];
  if (typeof message === 'string' && message.includes('React Router Future Flag Warning')) {
    return; // React Router 경고는 출력하지 않음
  }
  originalWarn.apply(console, args);
};
