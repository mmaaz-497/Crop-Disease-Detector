'use client';

import { useState, useEffect, useCallback } from 'react';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

export interface UseUploadReturn {
  selectedFile: File | null;
  previewUrl: string | null;
  imageThumb: string | null;
  validationError: string | null;
  handleFileSelect: (file: File) => void;
  clearFile: () => void;
}

export function useUpload(): UseUploadReturn {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageThumb, setImageThumb] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Revoke object URL on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const generateThumb = useCallback((objectUrl: string) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      // Centre-crop the image into the 64×64 square
      const size = Math.min(img.width, img.height);
      const sx = (img.width - size) / 2;
      const sy = (img.height - size) / 2;
      ctx.drawImage(img, sx, sy, size, size, 0, 0, 64, 64);
      setImageThumb(canvas.toDataURL('image/jpeg', 0.7));
    };
    img.src = objectUrl;
  }, []);

  const handleFileSelect = useCallback(
    (file: File) => {
      // Client-side validation
      if (!ALLOWED_TYPES.includes(file.type as (typeof ALLOWED_TYPES)[number])) {
        setValidationError('INVALID_IMAGE');
        return;
      }
      if (file.size > MAX_BYTES) {
        setValidationError('INVALID_IMAGE');
        return;
      }

      // Revoke previous object URL
      if (previewUrl) URL.revokeObjectURL(previewUrl);

      const url = URL.createObjectURL(file);
      setSelectedFile(file);
      setPreviewUrl(url);
      setValidationError(null);
      setImageThumb(null);
      generateThumb(url);
    },
    [previewUrl, generateThumb],
  );

  const clearFile = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl(null);
    setImageThumb(null);
    setValidationError(null);
  }, [previewUrl]);

  return { selectedFile, previewUrl, imageThumb, validationError, handleFileSelect, clearFile };
}
