import React from 'react';
import styles from './ui.module.css';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  circle?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width,
  height,
  borderRadius,
  circle = false,
  className = '',
  style,
  ...props
}) => {
  const customStyles: React.CSSProperties = {
    width: width ?? '100%',
    height: height ?? '1rem',
    borderRadius: circle ? '50%' : borderRadius ?? 'var(--radius-sm)',
    ...style,
  };

  return (
    <div
      className={`${styles.skeleton} animate-pulse ${className}`}
      style={customStyles}
      aria-hidden="true"
      {...props}
    />
  );
};
