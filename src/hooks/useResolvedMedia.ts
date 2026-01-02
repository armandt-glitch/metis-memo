import { useState, useEffect } from 'react';
import { resolveMediaUrl, isIndexedDBRef } from '@/lib/imageStorage';

/**
 * Hook to resolve media URLs from IndexedDB or return as-is
 * @param mediaUrl The media URL (can be idb://, base64, or regular URL)
 * @returns The resolved displayable URL
 */
export const useResolvedMedia = (mediaUrl: string | undefined) => {
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!mediaUrl) {
      setResolvedUrl(null);
      return;
    }

    // If it's not an IndexedDB reference, use directly
    if (!isIndexedDBRef(mediaUrl)) {
      setResolvedUrl(mediaUrl);
      return;
    }

    // Resolve from IndexedDB
    setIsLoading(true);
    resolveMediaUrl(mediaUrl)
      .then((url) => {
        setResolvedUrl(url);
      })
      .catch((error) => {
        console.error('Failed to resolve media URL:', error);
        setResolvedUrl(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [mediaUrl]);

  return { resolvedUrl, isLoading };
};
