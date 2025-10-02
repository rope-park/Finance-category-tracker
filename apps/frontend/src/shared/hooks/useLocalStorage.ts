import { useState, useEffect, useCallback } from 'react';

/**
 * 로컬 스토리지와 동기화된 상태를 관리하는 커스텀 훅
 * @param key 로컬 스토리지 키
 * @param initialValue 초기값
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  // 로컬 스토리지에서 값을 읽어오는 함수
  const readValue = useCallback((): T => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  }, [initialValue, key]);

  const [storedValue, setStoredValue] = useState<T>(readValue);

  // 값을 업데이트하는 함수
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        
        // 다른 탭에서도 동기화되도록 storage 이벤트 발생
        window.dispatchEvent(new Event('local-storage'));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  // 다른 탭에서 변경된 경우 동기화
  useEffect(() => {
    const handleStorageChange = () => {
      setStoredValue(readValue());
    };

    // storage 이벤트와 custom 이벤트 모두 리스닝
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('local-storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('local-storage', handleStorageChange);
    };
  }, [readValue]);

  return [storedValue, setValue] as const;
}
