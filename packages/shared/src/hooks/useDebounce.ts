import { useEffect, useState } from 'react';

/**
 * 디바운스 훅 - 입력값의 변경을 지연시켜 성능 최적화
 * 검색, 자동완성, API 호출 최적화에 사용
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // 지연 시간 후에 값을 업데이트
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // 클린업: 다음 effect 실행 전 또는 언마운트 시 타이머 정리
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * 디바운스된 콜백 훅 - 함수 호출을 지연시킴
 * 버튼 클릭, 폼 제출 등의 중복 호출 방지에 사용
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const [debouncedCallback, setDebouncedCallback] = useState<T | null>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedCallback(() => callback);
    }, delay);

    return () => {
      clearTimeout(handler);
      setDebouncedCallback(null);
    };
  }, [callback, delay]);

  return (debouncedCallback || callback) as T;
}

/**
 * 즉시 디바운스 훅 - 첫 번째 호출은 즉시 실행, 이후 호출은 디바운스
 * 검색 버튼 등에서 첫 클릭은 즉시 반응하고 연속 클릭은 방지할 때 사용
 */
export function useImmediateDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const [isFirstRun, setIsFirstRun] = useState(true);

  useEffect(() => {
    if (isFirstRun) {
      setDebouncedValue(value);
      setIsFirstRun(false);
      return;
    }

    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay, isFirstRun]);

  return debouncedValue;
}