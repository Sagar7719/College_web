'use client';

import React, { useEffect } from 'react';
import { ToastMessage } from '@/types';
import styles from './ui.module.css';

export interface ToastProps {
  toast: ToastMessage | null;
  onDismiss: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        onDismiss();
      }, toast.duration || 4000);
      return () => clearTimeout(timer);
    }
  }, [toast, onDismiss]);

  if (!toast) return null;

  return (
    <div
      className={`${styles.toastContainer} ${styles[`toast-${toast.type || 'info'}`]}`}
      role="alert"
      aria-live="polite"
    >
      <div className={styles.toastContent}>
        <strong className={styles.toastTitle}>{toast.title}</strong>
        {toast.description && <p className={styles.toastDescription}>{toast.description}</p>}
      </div>
      <button
        onClick={onDismiss}
        className={styles.toastCloseBtn}
        aria-label="Dismiss notification"
      >
        ✕
      </button>
    </div>
  );
};
