/**
 * 페이지 메타데이터 및 PWA 매니페스트 설정 훅
 * 
 * 주요 기능:
 * - 페이지 타이틀, 설명, 키워드, Open Graph, Twitter Card 메타 태그 설정
 * - JSON-LD 구조화 데이터 추가
 * - PWA 매니페스트 링크 설정
 */
import { useEffect } from 'react';

// 메타데이터 인터페이스 정의
interface MetaData {
  title?: string;
  description?: string;
  keywords?: string;
  author?: string;
  viewport?: string;
  robots?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
}

/**
 * 페이지 메타데이터를 동적으로 설정하는 훅
 * @param metadata - 설정할 메타데이터 객체
 * @returns null
 */
export function useMetaData(metadata: MetaData) {
  useEffect(() => {
    const { 
      title, 
      description, 
      keywords,
      author,
      viewport,
      robots,
      ogTitle,
      ogDescription,
      ogImage,
      ogUrl,
      twitterCard,
      twitterTitle,
      twitterDescription,
      twitterImage
    } = metadata;

    // 기본 메타 태그들
    if (title) {
      document.title = title;
      updateOrCreateMeta('property', 'og:title', ogTitle || title);
      updateOrCreateMeta('name', 'twitter:title', twitterTitle || title);
    }

    if (description) {
      updateOrCreateMeta('name', 'description', description);
      updateOrCreateMeta('property', 'og:description', ogDescription || description);
      updateOrCreateMeta('name', 'twitter:description', twitterDescription || description);
    }

    if (keywords) {
      updateOrCreateMeta('name', 'keywords', keywords);
    }

    if (author) {
      updateOrCreateMeta('name', 'author', author);
    }

    if (viewport) {
      updateOrCreateMeta('name', 'viewport', viewport);
    }

    if (robots) {
      updateOrCreateMeta('name', 'robots', robots);
    }

    // Open Graph 메타 태그들
    updateOrCreateMeta('property', 'og:type', 'website');
    if (ogImage) {
      updateOrCreateMeta('property', 'og:image', ogImage);
    }
    if (ogUrl) {
      updateOrCreateMeta('property', 'og:url', ogUrl);
    }

    // Twitter Card 메타 태그들
    updateOrCreateMeta('name', 'twitter:card', twitterCard || 'summary_large_image');
    if (twitterImage) {
      updateOrCreateMeta('name', 'twitter:image', twitterImage);
    }

    // JSON-LD 구조화 데이터 추가
    updateJsonLd({
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: title || '재정 관리 앱',
      description: description || '스마트한 개인 재정 관리를 위한 애플리케이션',
      url: ogUrl || window.location.href,
      author: {
        '@type': 'Organization',
        name: author || '재정 관리 팀'
      },
      category: 'Finance',
      operatingSystem: 'Web Browser'
    });

  }, [metadata]);

  return null;
}

/**
 * 메타 태그를 업데이트하거나 생성하는 함수
 * @param attribute - 메타 태그의 속성 (예: property, name)
 * @param name - 메타 태그의 이름
 * @param content - 메타 태그의 내용
 */
function updateOrCreateMeta(attribute: string, name: string, content: string) {
  if (!content) return;

  let element = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
  
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, name);
    document.head.appendChild(element);
  }
  
  element.setAttribute('content', content);
}

// JSON-LD 구조화 데이터 인터페이스
interface JsonLdData {
  '@context': string;
  '@type': string;
  name: string;
  description: string;
  url: string;
  author: {
    '@type': string;
    name: string;
  };
  category: string;
  operatingSystem: string;
}

/**
 * JSON-LD 구조화 데이터를 업데이트하는 함수
 * @param data - JSON-LD 데이터 객체
 */
function updateJsonLd(data: JsonLdData) {
  const existingScript = document.querySelector('script[type="application/ld+json"]');
  if (existingScript) {
    existingScript.textContent = JSON.stringify(data);
  } else {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
  }
}

/**
 * PWA 매니페스트 링크를 설정하는 훅
 * 
 * @returns null
 */
export function usePWAManifest() {
  useEffect(() => {
    const manifestLink = document.querySelector('link[rel="manifest"]') as HTMLLinkElement;
    
    if (!manifestLink) {
      const link = document.createElement('link');
      link.rel = 'manifest';
      link.href = '/manifest.json';
      document.head.appendChild(link);
    }

    // 서비스 워커 등록 (선택적)
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').catch((error) => {
        console.warn('Service Worker 등록 실패:', error);
      });
    }
  }, []);
}
