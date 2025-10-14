import React, { useState, useEffect } from "react";

interface PersonaImageProps {
  src: string;
  alt: string;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
  style?: React.CSSProperties;
}

const PersonaImage: React.FC<PersonaImageProps> = ({
  src,
  alt,
  className = "",
  onLoad,
  onError,
  style,
}) => {
  const [currentSrc, setCurrentSrc] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const getProxyUrls = (originalUrl: string): string[] => {
    try {
      const encodedUrl = encodeURIComponent(originalUrl);
      const url = new URL(originalUrl);
      const hostnamePath = encodeURIComponent(url.hostname + url.pathname);

      return [
        `https://proxy.duckduckgo.com/iu/?u=${encodedUrl}`,
        `https://cdn.statically.io/img/${url.hostname}${url.pathname}`,
        `https://images.weserv.nl/?url=${hostnamePath}`,
        `https://corsproxy.io/?${encodedUrl}`,
        `https://api.allorigins.win/raw?url=${encodedUrl}`,
        originalUrl,
      ];
    } catch {
      return [originalUrl];
    }
  };

  useEffect(() => {
    const loadImage = async () => {
      if (!src) return;

      setIsLoading(true);
      setHasError(false);

      const urls = getProxyUrls(src);
      let resolved = false;

      const promises = urls.map(
        (url) =>
          new Promise<boolean>((resolve) => {
            const img = new Image();

            const timeout = setTimeout(() => {
              resolve(false);
            }, 5000);

            img.onload = () => {
              clearTimeout(timeout);
              if (!resolved) {
                resolved = true;
                setCurrentSrc(url);
                setIsLoading(false);
                onLoad?.();
              }
              resolve(true);
            };
            img.onerror = () => {
              clearTimeout(timeout);
              resolve(false);
            };
            img.src = url;
          })
      );

      await Promise.allSettled(promises);

      if (!resolved) {
        setHasError(true);
        setIsLoading(false);
        onError?.();
      }
    };

    loadImage();
  }, [src, onLoad, onError]);

  if (hasError) {
    return (
      <div className={`${className} bg-black flex items-center justify-center`}>
        <div className="text-center text-white">
          <div className="text-sm font-bold">Persona</div>
          <div className="text-xs opacity-75">Image not available</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className} relative overflow-hidden`}>
      {isLoading && (
        <div
          className="absolute inset-0 flex items-center justify-center z-10"
          style={{ backgroundColor: "#202020" }}
        >
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-400"></div>
        </div>
      )}

      {currentSrc && (
        <img
          src={currentSrc}
          alt={alt}
          className={`w-full h-full object-contain transition-opacity duration-200 ${
            isLoading ? "opacity-0" : "opacity-100"
          }`}
          style={style}
          loading="eager"
        />
      )}
    </div>
  );
};

export default PersonaImage;
