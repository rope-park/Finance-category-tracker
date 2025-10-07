/**
 * Intersection Observer를 활용한 공통 커스텀 훅
 * 
 * 주요 기능:
 * - 요소의 가시성 추적
 * - 무한 스크롤 지원
 * - 성능 최적화
 */
import { useState, useEffect, useRef } from 'react';

/**
 * Intersection Observer를 활용한 무한 스크롤 훅
 * @param options Intersection Observer 옵션
 */
export function useInfiniteScroll(
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const targetRef = useRef<HTMLDivElement>(null);

  // Intersection Observer 설정 및 콜백
  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsIntersecting(entry.isIntersecting),
      {
        threshold: 0.1,
        ...options
      }
    );

    observer.observe(target);

    return () => {
      observer.unobserve(target);
    };
  }, [options]);

  return { targetRef, isIntersecting };
}

/**
 * 요소의 가시성을 추적하는 훅
 * @param options Intersection Observer 옵션
 */
export function useInView(options: IntersectionObserverInit = {}) {
  const [isInView, setIsInView] = useState(false);
  const [hasBeenInView, setHasBeenInView] = useState(false);
  const ref = useRef<HTMLElement>(null);

  // Intersection Observer 설정 및 콜백
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const inView = entry.isIntersecting;
        setIsInView(inView);
        
        if (inView && !hasBeenInView) {
          setHasBeenInView(true);
        }
      },
      {
        threshold: 0.1,
        ...options
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [hasBeenInView, options]);

  return { ref, isInView, hasBeenInView };
}
