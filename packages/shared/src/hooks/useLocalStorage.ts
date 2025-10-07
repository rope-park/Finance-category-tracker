/**
 * 로컬스토리지 및 세션스토리지 관련 공통 커스텀 훅
 * 
 * 주요 기능:
 * - useLocalStorage: 로컬스토리지 상태 관리 훅, 페이지 새로고침 후에도 상태 유지
 * - useSessionStorage: 세션스토리지 상태 관리 훅, 브라우저 탭 단위로 상태 유지
 * - useStorageEvent: 스토리지 이벤트 감지 훅, 다른 탭에서 로컬스토리지가 변경되었을 때 감지
 */
import { useState, useEffect, useCallback } from 'react';

/**
 * 로컬스토리지 상태 관리 훅
 * 
 * 브라우저를 닫아도 상태 유지됨
 * 
 * @param key 로컬스토리지 키 이름
 * @param initialValue 키가 존재하지 않을 때 사용할 기본값
 * @return [값, 값 설정 함수, 값 제거 함수]
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void, () => void] {
  // 초기값 설정 (서버사이드 렌더링 고려)
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window?.localStorage?.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // 값 설정 함수
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        // 함수형 업데이트 지원
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);

        // 로컬스토리지에 저장
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  // 값 제거 함수
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}

/**
 * 세션스토리지 상태 관리 훅
 * 
 * 브라우저 탭 단위로 상태 유지 (탭 닫으면 사라짐)
 * 
 * @param key 세션스토리지 키 이름
 * @param initialValue 키가 존재하지 않을 때 사용할 기본값
 * @return [값, 값 설정 함수, 값 제거 함수]
 */
export function useSessionStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void, () => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window?.sessionStorage?.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading sessionStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);

        if (typeof window !== 'undefined' && window.sessionStorage) {
          window.sessionStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.warn(`Error setting sessionStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      if (typeof window !== 'undefined' && window.sessionStorage) {
                window.sessionStorage.removeValue(key);
      }
    } catch (error) {
      console.warn(`Error removing sessionStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}

/**
 * 스토리지 이벤트 감지 훅
 * 
 * 다른 탭에서 로컬스토리지가 변경되었을 때 감지
 * 
 * @param key 감지할 로컬스토리지 키 이름
 * @param callback 키 값이 변경되었을 때 호출할 함수
 */
export function useStorageEvent(key: string, callback: (newValue: string | null) => void) {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleStorageChange = (e: Event) => {
      const storageEvent = e as StorageEvent;
      if (storageEvent.key === key) {
        callback(storageEvent.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key, callback]);
}