'use client';

import React, { useState } from 'react';
import { GalleryImage } from '@/types';
import { GalleryLightbox } from '@/components/layout/GalleryLightbox';
import { ZoomIn } from 'lucide-react';
import styles from './AlbumDetail.module.css';

interface Props {
  images: GalleryImage[];
}

export function GalleryAlbumClient({ images }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  return (
    <>
      <div className={styles.photoGrid}>
        {images.map((img, idx) => (
          <button
            key={img.id || idx}
            onClick={() => setLightboxIndex(idx)}
            aria-label={`Open photo ${idx + 1}${img.caption ? `: ${img.caption}` : ''}`}
            className={styles.photoCardBtn}
          >
            <div className={styles.photoImgBox}>
              <img
                src={img.url}
                alt={img.altText || `Photo ${idx + 1}`}
                className={styles.photoImg}
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.opacity = '0.4';
                }}
              />

              <div className={styles.zoomOverlay}>
                <div className={styles.zoomBadge}>
                  <ZoomIn size={22} />
                </div>
              </div>
            </div>

            {img.caption && (
              <div className={styles.photoCaption}>
                {img.caption}
              </div>
            )}
          </button>
        ))}
      </div>

      {lightboxIndex !== null && (
        <GalleryLightbox
          images={images}
          startIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  );
}
