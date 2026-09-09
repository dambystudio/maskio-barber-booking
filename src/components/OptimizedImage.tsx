import Image from 'next/image';
import { FC } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  sizes?: string;
  fill?: boolean;
  loading?: 'lazy' | 'eager';
}

const OptimizedImage: FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  quality = 75,
  sizes,
  fill = false,
  loading = 'lazy',
  ...props
}) => {
  // Funzione per controllare se WebP è supportato (lato server safe)
  const getOptimizedSrc = (originalSrc: string) => {
    // Next.js Image component gestisce automaticamente WebP se supportato
    return originalSrc;
  };

  const imageProps = {
    src: getOptimizedSrc(src),
    className,
    priority,
    quality,
    loading: priority ? 'eager' : loading,
    ...props
  };

  if (fill) {
    return (
      <Image
        alt={alt || ''}
        {...imageProps}
        fill
        sizes={sizes || '100vw'}
      />
    );
  }

  return (
    <Image
      alt={alt || ''}
      {...imageProps}
      width={width}
      height={height}
      sizes={sizes}
    />
  );
};

export default OptimizedImage;
