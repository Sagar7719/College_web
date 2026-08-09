'use client';

import React, { useEffect, useRef, useState } from 'react';

interface LightboxImage {
  url: string;
  altText?: string;
  caption?: string;
}

interface LightboxProps {
  images: LightboxImage[];
  startIndex: number;
  onClose: () => void;
}

export function GalleryLightbox({ images, startIndex, onClose }: LightboxProps) {
  const [current, setCurrent] = useState(startIndex);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Focus trap & keyboard
  useEffect(() => {
    closeRef.current?.focus();

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key === 'ArrowRight') setCurrent((c) => Math.min(c + 1, images.length - 1));
      if (e.key === 'ArrowLeft') setCurrent((c) => Math.max(c - 1, 0));
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [images.length, onClose]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const img = images[current];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        backgroundColor: 'rgba(0,0,0,0.93)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}
      onClick={onClose}
    >
      {/* Stop propagation on inner clicks so clicking image doesn't close */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative', maxWidth: '90vw', maxHeight: '90vh',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
        }}
      >
        {/* Close button */}
        <button
          ref={closeRef}
          aria-label="Close image viewer"
          onClick={onClose}
          style={{
            position: 'absolute', top: '-3rem', right: 0,
            background: 'none', border: 'none', color: '#fff',
            fontSize: '1.75rem', cursor: 'pointer', lineHeight: 1,
            padding: '0.25rem 0.5rem',
          }}
        >
          ✕
        </button>

        {/* Image */}
        <img
          src={img.url}
          alt={img.altText || `Photo ${current + 1}`}
          style={{
            maxWidth: '90vw', maxHeight: '75vh',
            objectFit: 'contain', borderRadius: '6px',
            display: 'block',
          }}
        />

        {/* Caption */}
        {img.caption && (
          <p style={{
            color: 'rgba(255,255,255,0.85)', marginTop: '0.75rem',
            fontSize: '0.9rem', textAlign: 'center', maxWidth: '60ch',
          }}>
            {img.caption}
          </p>
        )}

        {/* Counter */}
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginTop: '0.375rem' }}>
          {current + 1} / {images.length}
        </p>

        {/* Prev / Next */}
        {images.length > 1 && (
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem' }}>
            <button
              aria-label="Previous image"
              disabled={current === 0}
              onClick={() => setCurrent((c) => Math.max(c - 1, 0))}
              style={{
                background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff',
                padding: '0.5rem 1.25rem', borderRadius: '9999px',
                fontSize: '1rem', cursor: current === 0 ? 'not-allowed' : 'pointer',
                opacity: current === 0 ? 0.4 : 1,
              }}
            >
              ← Prev
            </button>
            <button
              aria-label="Next image"
              disabled={current === images.length - 1}
              onClick={() => setCurrent((c) => Math.min(c + 1, images.length - 1))}
              style={{
                background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff',
                padding: '0.5rem 1.25rem', borderRadius: '9999px',
                fontSize: '1rem', cursor: current === images.length - 1 ? 'not-allowed' : 'pointer',
                opacity: current === images.length - 1 ? 0.4 : 1,
              }}
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* Click outside hint */}
      <p style={{ position: 'absolute', bottom: '1.25rem', color: 'rgba(255,255,255,0.35)', fontSize: '0.75rem' }}>
        Click outside or press Esc to close
      </p>
    </div>
  );
}
