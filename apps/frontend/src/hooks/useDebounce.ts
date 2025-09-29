import React from 'react';
import { useState, useEffect} from 'react';

/**
 * 디바운스된 값을 반환하는 커스텀 훅
 * @param value 디바운스할 값
 * @param delay 지연 시간 (ms)
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
 * 디바운스된 콜백을 반환하는 커스텀 훅
 * @param callback 실행할 콜백 함수
 * @param delay 지연 시간 (ms)
 * @param deps 의존성 배열
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
