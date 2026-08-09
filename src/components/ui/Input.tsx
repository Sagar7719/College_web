import React from 'react';
import { InputSize } from '@/types';
import styles from './ui.module.css';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  inputSize?: InputSize;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      inputSize = 'md',
      leftIcon,
      rightIcon,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className={styles.inputWrapper}>
        {label && (
          <label htmlFor={inputId} className={styles.inputLabel}>
            {label}
            {props.required && <span className={styles.requiredAsterisk}> *</span>}
          </label>
        )}
        <div className={styles.inputContainer}>
          {leftIcon && <span className={styles.inputIconLeft}>{leftIcon}</span>}
          <input
            ref={ref}
            id={inputId}
            className={[
              styles.input,
              styles[`input-${inputSize}`],
              leftIcon ? styles.inputPaddingLeft : '',
              rightIcon ? styles.inputPaddingRight : '',
              error ? styles.inputError : '',
              className,
            ]
              .filter(Boolean)
              .join(' ')}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
            {...props}
          />
          {rightIcon && <span className={styles.inputIconRight}>{rightIcon}</span>}
        </div>
        {error ? (
          <p id={`${inputId}-error`} className={styles.errorMessage} role="alert">
            {error}
          </p>
        ) : helperText ? (
          <p id={`${inputId}-helper`} className={styles.helperText}>
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
