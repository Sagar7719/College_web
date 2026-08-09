import React from 'react';
import { ButtonVariant, ButtonSize } from '@/types';
import styles from './ui.module.css';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const classNames = [
      styles.button,
      styles[`btn-${variant}`],
      styles[`btn-${size}`],
      fullWidth ? styles['btn-full'] : '',
      isLoading ? styles['btn-loading'] : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <button
        ref={ref}
        className={classNames}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <span className={styles.spinner} aria-label="Loading..." />
        ) : (
          <>
            {leftIcon && <span className={styles.btnIconLeft}>{leftIcon}</span>}
            <span>{children}</span>
            {rightIcon && <span className={styles.btnIconRight}>{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
