/**
 * 포커스 관리 및 키보드 네비게이션을 위한 공통 커스텀 훅
 * 
 * 주요 기능:
 * - 포커스 트랩
 * - 키보드 단축키 지원
 * - 방향키 네비게이션
 */
import { useEffect, useRef, useCallback } from 'react';

/**
 * 포커스 관리 훅
 * @returns 포커스 관리 훅
 */
export function useFocusManagement() {
  const trapRef = useRef<HTMLElement>(null);

  // 포커스 가능한 요소들을 가져오는 헬퍼 함수
  const getFocusableElements = useCallback((container: HTMLElement): HTMLElement[] => {
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ');

    return Array.from(container.querySelectorAll(focusableSelectors));
  }, []);

  // 포커스 트랩 설정
  const trapFocus = useCallback((event: KeyboardEvent) => {
    if (event.key !== 'Tab' || !trapRef.current) return;

    const focusableElements = getFocusableElements(trapRef.current);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement?.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement?.focus();
      }
    }
  }, [getFocusableElements]);

  // 첫 번째 포커스 가능한 요소에 포커스
  const focusFirst = useCallback(() => {
    if (!trapRef.current) return;
    
    const focusableElements = getFocusableElements(trapRef.current);
    const firstElement = focusableElements[0];
    firstElement?.focus();
  }, [getFocusableElements]);

  // 마지막 포커스 가능한 요소에 포커스
  const focusLast = useCallback(() => {
    if (!trapRef.current) return;
    
    const focusableElements = getFocusableElements(trapRef.current);
    const lastElement = focusableElements[focusableElements.length - 1];
    lastElement?.focus();
  }, [getFocusableElements]);

  // Esc 키로 포커스 해제
  const handleEscape = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      const activeElement = document.activeElement as HTMLElement;
      activeElement?.blur();
    }
  }, []);

  return {
    trapRef,
    trapFocus,
    focusFirst,
    focusLast,
    handleEscape,
    getFocusableElements
  };
}

/**
 * 키보드 단축키 등록 훅
 * @param shortcuts 단축키와 실행할 함수 매핑 객체
 */
export function useKeyboardShortcuts(shortcuts: Record<string, () => void>) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      
      // 입력 필드에서는 단축키 비활성화
      const isInputActive = ['input', 'textarea', 'select'].includes(
        (event.target as HTMLElement).tagName.toLowerCase()
      );
      
      if (isInputActive) return;

      // 단축키 조합 생성
      let shortcutKey = '';
      if (event.ctrlKey || event.metaKey) shortcutKey += 'ctrl+';
      if (event.altKey) shortcutKey += 'alt+';
      if (event.shiftKey) shortcutKey += 'shift+';
      shortcutKey += key;

      // 단축키 실행
      const handler = shortcuts[shortcutKey];
      if (handler) {
        event.preventDefault();
        handler();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}

/**
 * 방향키 네비게이션을 위한 훅
 * @param items 포커스 가능한 요소 목록
 * @param options 네비게이션 옵션
 * @returns 네비게이션 핸들러 및 이동 함수
 */
export function useArrowNavigation(
  items: HTMLElement[],
  options: {
    loop?: boolean;
    orientation?: 'horizontal' | 'vertical' | 'both';
  } = {}
) {
  const { loop = true, orientation = 'vertical' } = options;

  const navigate = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    const currentIndex = items.findIndex(item => item === document.activeElement);
    if (currentIndex === -1) return;

    let nextIndex = currentIndex;

    switch (direction) {
      case 'up':
        if (orientation === 'vertical' || orientation === 'both') {
          nextIndex = currentIndex - 1;
        }
        break;
      case 'down':
        if (orientation === 'vertical' || orientation === 'both') {
          nextIndex = currentIndex + 1;
        }
        break;
      case 'left':
        if (orientation === 'horizontal' || orientation === 'both') {
          nextIndex = currentIndex - 1;
        }
        break;
      case 'right':
        if (orientation === 'horizontal' || orientation === 'both') {
          nextIndex = currentIndex + 1;
        }
        break;
    }

    // 경계 처리
    if (loop) {
      if (nextIndex < 0) nextIndex = items.length - 1;
      if (nextIndex >= items.length) nextIndex = 0;
    } else {
      nextIndex = Math.max(0, Math.min(items.length - 1, nextIndex));
    }

    items[nextIndex]?.focus();
  }, [items, loop, orientation]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        navigate('up');
        break;
      case 'ArrowDown':
        event.preventDefault();
        navigate('down');
        break;
      case 'ArrowLeft':
        event.preventDefault();
        navigate('left');
        break;
      case 'ArrowRight':
        event.preventDefault();
        navigate('right');
        break;
      case 'Home':
        event.preventDefault();
        items[0]?.focus();
        break;
      case 'End':
        event.preventDefault();
        items[items.length - 1]?.focus();
        break;
    }
  }, [navigate, items]);

  return { handleKeyDown, navigate };
}
