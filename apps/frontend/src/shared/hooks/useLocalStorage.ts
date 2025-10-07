/**
 * 로컬 스토리지와 동기화된 상태 관리를 위한 공통 커스텀 훅
 * 
 * 주요 기능:
 * - 타입 안전성 제공
 * - 에러 처리 내장
 * - 다중 탭 동기화 지원
 * - SSR(서버 사이드 렌더링) 지원
 */
import { useState, useEffect, useCallback } from 'react';

/**
 * 로컬 스토리지 상태 관리 훅
 * @param key 로컬 스토리지에 저장될 키 이름
 * @param initialValue 키가 존재하지 않을 때 사용할 기본값
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  // 로컬 스토리지에서 값을 안전하게 읽어오는 함수
  // SSR 환경과 JSON 파싱 에러를 고려하여 구현됨
  const readValue = useCallback((): T => {
    // 서버 사이드 렌더링 환경에서는 초기값 반환
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      // 값이 존재하면 JSON 파싱, 없으면 초기값 반환
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // JSON 파싱 실패 시 경고 로그 출력 후 초기값 반환
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  }, [initialValue, key]);

  // React 상태로 관리되는 저장된 값 (초기값은 로컬 스토리지에서 읽어옴)
  const [storedValue, setStoredValue] = useState<T>(readValue);

  // 값을 업데이트하는 함수 - React 상태와 로컬 스토리지 모두 업데이트
  // 함수형 업데이트와 직접 값 설정 모두 지원
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      // 함수가 전달된 경우 현재 값을 기반으로 새 값 계산
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // React 상태 업데이트
      setStoredValue(valueToStore);

      // 브라우저 환경에서만 로컬 스토리지 업데이트
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        
        // 커스텀 이벤트를 발생시켜 다른 탭에서도 변경사항을 감지할 수 있도록 함
        window.dispatchEvent(new Event('local-storage'));
      }
    } catch (error) {
      // 로컬 스토리지 저장 실패 시 경고 로그 출력
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  // 다른 브라우저 탭에서 로컬 스토리지가 변경되었을 때 현재 탭도 동기화
  useEffect(() => {
    const handleStorageChange = () => {
      // 로컬 스토리지에서 최신 값을 읽어와 상태 업데이트
      setStoredValue(readValue());
    };

    // 브라우저의 기본 storage 이벤트와 커스텀 local-storage 이벤트 모두 수신
    // storage 이벤트: 다른 탭에서 localStorage가 변경될 때 자동 발생
    // local-storage 이벤트: 같은 탭에서 setValue 호출 시 수동 발생
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('local-storage', handleStorageChange);

    // 컴포넌트 언마운트 시 이벤트 리스너 정리
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('local-storage', handleStorageChange);
    };
  }, [readValue]);

  // [현재 값, 값 설정 함수] 튜플을 const assertion으로 반환
  return [storedValue, setValue] as const;
}
