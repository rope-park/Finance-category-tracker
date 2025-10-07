/**
 * 디바운스 공통 커스텀 훅
 * 
 * 주요 기능:
 * - useDebounce: 값에 디바운스를 적용하여 빠른 변화에 따른 불필요한 업데이트를 방지
 * - useDebouncedCallback: 콜백 함수에 디바운스를 적용하여 연속 호출 시 마지막 호출만 실행
 */
import React from 'react';
import { useState, useEffect} from 'react';

/**
 * 디바운스된 값 반환하는 훅
 * @param value 디바운스할 값
 * @param delay 지연 시간 (ms)
 * @return 디바운스된 값
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * 디바운스된 콜백 함수 반환하는 훅
 * @param callback 실행할 콜백 함수
 * @param delay 지연 시간 (ms)
 * @param deps 의존성 배열
 * @return 디바운스된 콜백 함수
 */
export function useDebouncedCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number,
  deps: React.DependencyList = []
): T {
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const debouncedCallback = React.useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callback, delay, ...deps]) as T;

  useEffect(() => {
    return () => {
      // 컴포넌트 언마운트 시 대기 중인 콜백 정리
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return debouncedCallback;
}
