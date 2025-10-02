import React, { useState } from 'react';
import { useApp } from '../../../hooks/useApp';
import { colors } from '../../../styles/theme';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  style?: React.CSSProperties;
  loading?: 'lazy' | 'eager';
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className,
  style,
  loading = 'lazy',
  placeholder,
  onLoad,
  onError,
}) => {
  const { darkMode } = useApp();
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    display: 'inline-block',
    overflow: 'hidden',
    backgroundColor: darkMode ? colors.gray[800] : colors.gray[100],
    ...style,
  };

  const imageStyle: React.CSSProperties = {
    width: width || '100%',
    height: height || 'auto',
    objectFit: 'cover',
    transition: 'opacity 0.3s ease',
    opacity: isLoaded ? 1 : 0,
  };

  const placeholderStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: darkMode ? colors.gray[800] : colors.gray[100],
    color: darkMode ? colors.gray[400] : colors.gray[600],
    fontSize: '14px',
    opacity: isLoaded ? 0 : 1,
    transition: 'opacity 0.3s ease',
    pointerEvents: 'none',
  };

  // WebP 지원 확인
  const getOptimizedSrc = (originalSrc: string) => {
    // 브라우저가 WebP를 지원하는지 확인
    const canvas = document.createElement('canvas');
    const webpSupported = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    
    if (webpSupported && originalSrc.includes('.')) {
      const extension = originalSrc.split('.').pop();
      if (['jpg', 'jpeg', 'png'].includes(extension?.toLowerCase() || '')) {
        return originalSrc.replace(/\.(jpg|jpeg|png)$/i, '.webp');
      }
    }
    
    return originalSrc;
  };

  if (hasError) {
    return (
      <div style={containerStyle} className={className}>
        <div style={placeholderStyle}>
          이미지를 불러올 수 없습니다
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle} className={className}>
      {/* 실제 이미지 */}
      <img
        src={getOptimizedSrc(src)}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        style={imageStyle}
        onLoad={handleLoad}
        onError={handleError}
        decoding="async"
      />
      
      {/* 로딩 플레이스홀더 */}
      {!isLoaded && (
        <div style={placeholderStyle}>
          {placeholder || '이미지 로딩 중...'}
        </div>
      )}
    </div>
  );
};

// 아바타 이미지 컴포넌트
interface AvatarImageProps {
  src?: string;
  name: string;
  size?: number;
  className?: string;
}

export const AvatarImage: React.FC<AvatarImageProps> = ({
  src,
  name,
  size = 40,
  className,
}) => {
  const { darkMode } = useApp();
  const [hasError, setHasError] = useState(false);

  const initials = name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const avatarStyle: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: darkMode ? colors.primary[600] : colors.primary[500],
    color: 'white',
    fontSize: size * 0.4,
    fontWeight: 'bold',
    overflow: 'hidden',
  };

  if (!src || hasError) {
    return (
      <div style={avatarStyle} className={className}>
        {initials}
      </div>
    );
  }

  return (
    <div style={avatarStyle} className={className}>
      <OptimizedImage
        src={src}
        alt={`${name}의 프로필 이미지`}
        width={size}
        height={size}
        onError={() => setHasError(true)}
        style={{ borderRadius: '50%' }}
      />
    </div>
  );
};
