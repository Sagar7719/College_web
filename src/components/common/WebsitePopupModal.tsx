'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Notice } from '@/types';
import { X, ArrowRight, Bell, Sparkles } from 'lucide-react';
import styles from './WebsitePopupModal.module.css';

interface WebsitePopupModalProps {
  notice: Notice | null;
}

/**
 * Validates CTA target URL to prevent unsafe schemes (javascript:, data:, vbscript:).
 * Returns safe internal or external URL, or fallback '/notices'.
 */
function sanitizeCtaUrl(rawUrl?: string): string {
  if (!rawUrl || typeof rawUrl !== 'string') return '/notices';
  const trimmed = rawUrl.trim();
  const lower = trimmed.toLowerCase();

  if (lower.startsWith('javascript:') || lower.startsWith('data:') || lower.startsWith('vbscript:')) {
    return '/notices';
  }

  if (trimmed.startsWith('/') || lower.startsWith('http://') || lower.startsWith('https://')) {
    return trimmed;
  }

  return '/notices';
}

export function WebsitePopupModal({ notice }: WebsitePopupModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const noticeId = notice?.id;
  const storageKey = noticeId ? `popup_imp_${noticeId}` : null;

  // Client-side impression check (SSR safe)
  useEffect(() => {
    if (!storageKey) return;

    try {
      const alreadySeen = sessionStorage.getItem(storageKey);
      if (!alreadySeen) {
        setIsOpen(true);
        // Mark impression committed once shown so page refresh in same tab won't re-trigger
        sessionStorage.setItem(storageKey, '1');
      }
    } catch {
      // Ignore storage errors (e.g. strict privacy modes)
    }
  }, [storageKey]);

  const handleClose = useCallback(() => {
    if (storageKey) {
      try {
        sessionStorage.setItem(storageKey, '1');
      } catch {
        // Ignore storage errors
      }
    }
    setIsOpen(false);
  }, [storageKey]);

  // Keyboard Esc key listener
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  if (!isOpen || !notice) {
    return null;
  }

  const targetUrl = sanitizeCtaUrl(notice.attachmentUrl);
  const isExternalUrl = targetUrl.startsWith('http://') || targetUrl.startsWith('https://');

  const handleCtaClick = (e: React.MouseEvent) => {
    if (storageKey) {
      try {
        sessionStorage.setItem(storageKey, '1');
      } catch {
        // Ignore storage errors
      }
    }
    setIsOpen(false);

    if (isExternalUrl) {
      e.preventDefault();
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    } else {
      e.preventDefault();
      router.push(targetUrl);
    }
  };

  const badgeText = notice.tag || (notice.isUrgent ? 'URGENT' : 'IMPORTANT');
  const isUrgentBadge = notice.isUrgent || badgeText === 'IMP' || badgeText === 'URGENT';

  return (
    <div
      className={styles.overlay}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="popup-title"
      aria-describedby="popup-body"
    >
      <div
        className={styles.modalCard}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.topBanner} />

        <button
          type="button"
          className={styles.closeButton}
          onClick={handleClose}
          aria-label="Close Announcement"
          title="Close Popup"
        >
          <X size={18} />
        </button>

        <div className={styles.contentWrapper}>
          <div className={styles.badgeGroup}>
            <span
              className={`${styles.badge} ${
                isUrgentBadge ? styles.badgeUrgent : styles.badgeDefault
              }`}
            >
              {isUrgentBadge ? <Bell size={12} /> : <Sparkles size={12} />}
              {badgeText}
            </span>
          </div>

          <h2 id="popup-title" className={styles.title}>
            {notice.title}
          </h2>

          {notice.content && (
            <p id="popup-body" className={styles.bodyText}>
              {notice.content}
            </p>
          )}
        </div>

        <div className={styles.actionRow}>
          <button
            type="button"
            className={styles.btnSecondary}
            onClick={handleClose}
          >
            Dismiss
          </button>
          <a
            href={targetUrl}
            onClick={handleCtaClick}
            className={styles.btnPrimary}
            rel={isExternalUrl ? 'noopener noreferrer' : undefined}
            target={isExternalUrl ? '_blank' : undefined}
          >
            <span>View Details</span>
            <ArrowRight size={16} />
          </a>
        </div>
      </div>
    </div>
  );
}

export default WebsitePopupModal;
