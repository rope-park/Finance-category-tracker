import { useState, useCallback, useEffect } from 'react';
import type { LoadingState, AsyncState } from '../types';

/**
 * 비동기 상태 관리를 위한 hook
 * API 호출, 데이터 로딩 등에 사용
 */
export function useAsyncState<T, E = string>(
  initialData?: T
): AsyncState<T, E> & {
  setData: (data: T) => void;
  setError: (error: E) => void;
  setLoading: (loading: LoadingState) => void;
  reset: () => void;
} {
  const [data, setData] = useState<T | undefined>(initialData);
  const [loading, setLoading] = useState<LoadingState>('idle');
  const [error, setError] = useState<E | undefined>();
  const [lastUpdated, setLastUpdated] = useState<string>();

  const updateData = useCallback((newData: T) => {
    setData(newData);
    setLoading('succeeded');
    setError(undefined);
    setLastUpdated(new Date().toISOString());
  }, []);

  const updateError = useCallback((newError: E) => {
    setError(newError);
    setLoading('failed');
  }, []);

  const updateLoading = useCallback((newLoading: LoadingState) => {
    setLoading(newLoading);
    if (newLoading === 'loading') {
      setError(undefined);
    }
  }, []);

  const reset = useCallback(() => {
    setData(initialData);
    setLoading('idle');
    setError(undefined);
    setLastUpdated(undefined);
  }, [initialData]);

  return {
    data,
    loading,
    error,
    lastUpdated,
    setData: updateData,
    setError: updateError,
    setLoading: updateLoading,
    reset,
  };
}

/**
 * API 호출을 위한 hook
 * 자동 로딩 상태 관리, 에러 처리, 재시도 기능 포함
 */
export function useAPI<T, P = void>(
  apiFunction: (params: P) => Promise<T>,
  options?: {
    immediate?: boolean;
    retries?: number;
    retryDelay?: number;
  }
) {
  const { immediate = false, retries = 0, retryDelay = 1000 } = options || {};
  
  const asyncState = useAsyncState<T>();
  const [attemptCount, setAttemptCount] = useState(0);

  const execute = useCallback(async (params: P) => {
    asyncState.setLoading('loading');
    setAttemptCount(0);

    const attemptCall = async (attempt: number): Promise<void> => {
      try {
        const result = await apiFunction(params);
        asyncState.setData(result);
      } catch (error) {
        if (attempt < retries) {
          setAttemptCount(attempt + 1);
          setTimeout(() => attemptCall(attempt + 1), retryDelay);
        } else {
          asyncState.setError(error as string);
        }
      }
    };

    await attemptCall(0);
  }, [apiFunction, asyncState, retries, retryDelay]);

  // 즉시 실행 옵션
  useEffect(() => {
    if (immediate && asyncState.loading === 'idle') {
      execute({} as P);
    }
  }, [immediate, execute, asyncState.loading]);

  return {
    ...asyncState,
    execute,
    attemptCount,
    isLoading: asyncState.loading === 'loading',
    isSuccess: asyncState.loading === 'succeeded',
    isError: asyncState.loading === 'failed',
  };
}

/**
 * 페이지네이션을 위한 hook
 */
export function usePagination(
  totalItems: number,
  itemsPerPage: number = 10,
  initialPage: number = 1
) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  const nextPage = useCallback(() => {
    if (hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  }, [hasNextPage]);

  const prevPage = useCallback(() => {
    if (hasPrevPage) {
      setCurrentPage(prev => prev - 1);
    }
  }, [hasPrevPage]);

  const goToPage = useCallback((page: number) => {
    const validPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(validPage);
  }, [totalPages]);

  const reset = useCallback(() => {
    setCurrentPage(initialPage);
  }, [initialPage]);

  return {
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    startIndex,
    endIndex,
    hasNextPage,
    hasPrevPage,
    nextPage,
    prevPage,
    goToPage,
    reset,
  };
}

/**
 * 정렬을 위한 hook
 */
export function useSort<T>(
  data: T[],
  initialSortKey?: keyof T,
  initialSortOrder: 'asc' | 'desc' = 'asc'
) {
  const [sortKey, setSortKey] = useState<keyof T | undefined>(initialSortKey);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(initialSortOrder);

  const sortedData = useCallback(() => {
    if (!sortKey) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortKey, sortOrder]);

  const sort = useCallback((key: keyof T, order?: 'asc' | 'desc') => {
    if (key === sortKey && !order) {
      // 같은 키로 정렬 시 순서 토글
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder(order || 'asc');
    }
  }, [sortKey]);

  const clearSort = useCallback(() => {
    setSortKey(undefined);
    setSortOrder('asc');
  }, []);

  return {
    sortedData: sortedData(),
    sortKey,
    sortOrder,
    sort,
    clearSort,
  };
}