import { useState } from 'react';

interface PropertyImageProps {
  src: string | undefined;
  alt: string;
  className?: string;
  propertyType: string;
}

const PropertyImage = ({ src, alt, className = '', propertyType }: PropertyImageProps) => {
  const getDefaultImage = (type: string) => {
    const baseUrl = 'https://images.unsplash.com/photo';
    const size = 'w=800&h=600&q=80';
    
    switch (type) {
      case 'office':
        return `${baseUrl}-1497366216548-28220-16351?${size}`;
      case 'retail':
        return `${baseUrl}-1441986300917-64674bd600d8?${size}`;
      case 'industrial':
        return `${baseUrl}-1553062407-98eeb64c6a62?${size}`;
      case 'warehouse':
        return `${baseUrl}-1575992957018-da8c5265b9b4?${size}`;
      default:
        return `${baseUrl}-1560518883-ce090a7213e7?${size}`;
    }
  };

  const [imageSrc, setImageSrc] = useState<string>(src || getDefaultImage(propertyType));
  const [isLoading, setIsLoading] = useState(!!src); // Only show loading if we have a source
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isDefaultImage, setIsDefaultImage] = useState(!src); // Start as default if no source

  const getFallbackImages = (type: string) => {
    const baseUrl = 'https://images.unsplash.com/photo';
    const size = 'w=800&h=600&q=80';
    
    const fallbacks = {
      office: [
        `${baseUrl}-1497366216548-28220-16351?${size}`,
        `${baseUrl}-1545324418-cc1a3fa10c00?${size}`,
        `${baseUrl}-1560264280-88b68371db39?${size}`,
        `${baseUrl}-1568992687947-868a62a9f521?${size}`
      ],
      retail: [
        `${baseUrl}-1441986300917-64674bd600d8?${size}`,
        `${baseUrl}-1553062407-98eeb64c6a62?${size}`,
        `${baseUrl}-1575992957018-da8c5265b9b4?${size}`
      ],
      industrial: [
        `${baseUrl}-1553062407-98eeb64c6a62?${size}`,
        `${baseUrl}-1575992957018-da8c5265b9b4?${size}`,
        `${baseUrl}-1497366216548-28220-16351?${size}`
      ],
      warehouse: [
        `${baseUrl}-1575992957018-da8c5265b9b4?${size}`,
        `${baseUrl}-1553062407-98eeb64c6a62?${size}`,
        `${baseUrl}-1497366216548-28220-16351?${size}`
      ]
    };
    
    return fallbacks[type as keyof typeof fallbacks] || fallbacks.office;
  };

  const handleImageLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setHasError(true);
    
    // Try fallback images if we haven't exceeded retry limit
    if (retryCount < 3) {
      const fallbacks = getFallbackImages(propertyType);
      const nextFallback = fallbacks[retryCount];
      
      if (nextFallback) {
        setRetryCount(prev => prev + 1);
        setImageSrc(nextFallback);
        setIsLoading(true);
        return;
      }
    }
    
    // If all fallbacks fail, use the default image
    if (!isDefaultImage) {
      const defaultImg = getDefaultImage(propertyType);
      setImageSrc(defaultImg);
      setIsLoading(true);
      setHasError(false);
      setIsDefaultImage(true);
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="text-gray-400 text-sm">Loading...</div>
        </div>
      )}
      <img
        src={imageSrc}
        alt={alt}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onLoad={handleImageLoad}
        onError={handleImageError}
      />
      {hasError && isDefaultImage && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-center text-gray-500 text-sm">
            <div className="text-2xl mb-1">🏢</div>
            <div>Property Image</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyImage;
