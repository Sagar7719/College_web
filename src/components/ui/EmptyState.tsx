import React from 'react';
import { EmptyStateProps } from '@/types';
import { Button } from './Button';
import styles from './ui.module.css';

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  icon,
  className = '',
}) => {
  return (
    <div className={`${styles.emptyStateContainer} ${className}`}>
      {icon ? (
        <div className={styles.emptyStateIconWrapper}>{icon}</div>
      ) : (
        <div className={styles.emptyStateDefaultIcon} aria-hidden="true">
          📋
        </div>
      )}
      <h3 className={styles.emptyStateTitle}>{title}</h3>
      {description && <p className={styles.emptyStateDescription}>{description}</p>}
      {actionLabel && onAction && (
        <div className={styles.emptyStateAction}>
          <Button variant="primary" size="md" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};
