import React from 'react';
import { OptionItem, InputSize } from '@/types';
import styles from './ui.module.css';

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  options: OptionItem[];
  error?: string;
  helperText?: string;
  inputSize?: InputSize;
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      options,
      error,
      helperText,
      inputSize = 'md',
      placeholder,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className={styles.inputWrapper}>
        {label && (
          <label htmlFor={selectId} className={styles.inputLabel}>
            {label}
            {props.required && <span className={styles.requiredAsterisk}> *</span>}
          </label>
        )}
        <div className={styles.selectContainer}>
          <select
            ref={ref}
            id={selectId}
            className={[
              styles.select,
              styles[`select-${inputSize}`],
              error ? styles.inputError : '',
              className,
            ]
              .filter(Boolean)
              .join(' ')}
            aria-invalid={Boolean(error)}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>
          <span className={styles.selectCaret} aria-hidden="true">
            ▼
          </span>
        </div>
        {error ? (
          <p className={styles.errorMessage} role="alert">
            {error}
          </p>
        ) : helperText ? (
          <p className={styles.helperText}>{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = 'Select';
