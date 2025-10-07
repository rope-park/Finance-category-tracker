/**
 * 디바운스 관련 공통 커스텀 훅
 * 
 * 주요 기능:
 * - useDebounce: 값에 디바운스를 적용하여 빠른 변화에 따른 불필요한 업데이트를 방지
 * - useDebouncedCallback: 콜백 함수에 디바운스를 적용하여 연속 호출 시 마지막 호출만 실행
 */
import { useEffect, useState } from 'react';

/**
 * 값에 디바운스를 적용하는 훅 - 값 변경 빈도를 제한함
 * @param value 디바운스를 적용할 값
 * @param delay 지연시킬 시간(밀리초)
 * @returns 지연된 값
 */
export function useDebounce<T>(value: T, delay: number): T {
  // 지연된 값을 저장하는 상태
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // 지정된 지연 시간 후에 값을 업데이트하는 타이머 설정
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // 클린업 함수: 컴포넌트 언마운트 시나 다음 effect 실행 전 타이머 정리
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // value나 delay가 변경될 때만 effect 재실행

  return debouncedValue;
}

/**
 * 콜백 함수에 디바운스를 적용하는 훅 - 연속 호출 시 마지막 호출만 실행함
 * @param callback 디바운스를 적용할 함수
 * @param delay 지연시킬 시간(밀리초)
 * @returns 디바운스가 적용된 콜백 함수
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  // 지연된 콜백 함수를 저장하는 상태
  const [debouncedCallback, setDebouncedCallback] = useState<T | null>(null);

  useEffect(() => {
    // 지정된 지연 시간 후에 콜백을 설정하는 타이머
    const handler = setTimeout(() => {
      setDebouncedCallback(() => callback);
    }, delay);

    // 클린업: 타이머 정리 및 콜백 초기화
    return () => {
      clearTimeout(handler);
      setDebouncedCallback(null);
    };
  }, [callback, delay]);

  // 디바운스된 콜백이 있으면 사용하고, 없으면 원본 콜백 사용
  return (debouncedCallback || callback) as T;
}

/**
 * 즉시 반응 + 디바운스가 적용된 값을 반환하는 훅
 * @param value 디바운스를 적용할 값  
 * @param delay 두 번째 변경부터 적용될 지연 시간(밀리초)
 * @returns 즉시 반응 + 디바운스가 적용된 값
 */
export function useImmediateDebounce<T>(value: T, delay: number): T {
  // 지연된 값을 저장하는 상태
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  // 첫 번째 실행 여부를 추적하는 상태  
  const [isFirstRun, setIsFirstRun] = useState(true);

  useEffect(() => {
    // 첫 번째 실행 시에는 즉시 값을 업데이트
    if (isFirstRun) {
      setDebouncedValue(value);
      setIsFirstRun(false);
      return; // 타이머 설정 없이 즉시 종료
    }

    // 두 번째 실행부터는 일반적인 디바운스 로직 적용
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // 클린업: 타이머 정리
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay, isFirstRun]);

  return debouncedValue;
}