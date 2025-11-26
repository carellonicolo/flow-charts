import type { InputHTMLAttributes, ReactNode } from 'react';

/**
 * Props del Input
 */
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

/**
 * Input Component
 * Design Apple-like con validazione e error states
 */
export default function Input({
  label,
  error,
  helper,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = '',
  id,
  ...props
}: InputProps) {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const hasError = Boolean(error);

  const baseStyles = `
    px-4 py-2 rounded-lg
    text-base font-normal
    border transition-fast
    focus:outline-none focus:ring-2 focus:ring-offset-0
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const colorStyles = hasError
    ? `
      border-[var(--status-error)]
      bg-[var(--bg-elevated)]
      text-[var(--text-primary)]
      focus:border-[var(--status-error)]
      focus:ring-[var(--status-error)]
    `
    : `
      border-[var(--border-primary)]
      bg-[var(--bg-elevated)]
      text-[var(--text-primary)]
      focus:border-[var(--border-focus)]
      focus:ring-[var(--border-focus)]
    `;

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <div className={widthStyle}>
      {/* Label */}
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium mb-2 transition-theme"
          style={{ color: 'var(--text-primary)' }}
        >
          {label}
        </label>
      )}

      {/* Input container */}
      <div className="relative">
        {/* Left icon */}
        {leftIcon && (
          <div
            className="absolute left-3 top-1/2 -translate-y-1/2 transition-theme"
            style={{ color: 'var(--text-tertiary)' }}
          >
            {leftIcon}
          </div>
        )}

        {/* Input */}
        <input
          id={inputId}
          className={`
            ${baseStyles}
            ${colorStyles}
            ${leftIcon ? 'pl-10' : ''}
            ${rightIcon ? 'pr-10' : ''}
            ${widthStyle}
            ${className}
          `}
          {...props}
        />

        {/* Right icon */}
        {rightIcon && (
          <div
            className="absolute right-3 top-1/2 -translate-y-1/2 transition-theme"
            style={{ color: 'var(--text-tertiary)' }}
          >
            {rightIcon}
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p
          className="text-sm mt-1.5 transition-theme"
          style={{ color: 'var(--status-error)' }}
        >
          {error}
        </p>
      )}

      {/* Helper text */}
      {helper && !error && (
        <p
          className="text-sm mt-1.5 transition-theme"
          style={{ color: 'var(--text-secondary)' }}
        >
          {helper}
        </p>
      )}
    </div>
  );
}

/**
 * Textarea Component
 */
interface TextareaProps extends InputHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helper?: string;
  rows?: number;
  fullWidth?: boolean;
}

export function Textarea({
  label,
  error,
  helper,
  rows = 4,
  fullWidth = false,
  className = '',
  id,
  ...props
}: TextareaProps) {
  const inputId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
  const hasError = Boolean(error);

  const baseStyles = `
    px-4 py-2 rounded-lg
    text-base font-normal
    border transition-fast
    focus:outline-none focus:ring-2 focus:ring-offset-0
    disabled:opacity-50 disabled:cursor-not-allowed
    resize-vertical
  `;

  const colorStyles = hasError
    ? `
      border-[var(--status-error)]
      bg-[var(--bg-elevated)]
      text-[var(--text-primary)]
      focus:border-[var(--status-error)]
      focus:ring-[var(--status-error)]
    `
    : `
      border-[var(--border-primary)]
      bg-[var(--bg-elevated)]
      text-[var(--text-primary)]
      focus:border-[var(--border-focus)]
      focus:ring-[var(--border-focus)]
    `;

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <div className={widthStyle}>
      {/* Label */}
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium mb-2 transition-theme"
          style={{ color: 'var(--text-primary)' }}
        >
          {label}
        </label>
      )}

      {/* Textarea */}
      <textarea
        id={inputId}
        rows={rows}
        className={`
          ${baseStyles}
          ${colorStyles}
          ${widthStyle}
          ${className}
        `}
        {...props}
      />

      {/* Error message */}
      {error && (
        <p
          className="text-sm mt-1.5 transition-theme"
          style={{ color: 'var(--status-error)' }}
        >
          {error}
        </p>
      )}

      {/* Helper text */}
      {helper && !error && (
        <p
          className="text-sm mt-1.5 transition-theme"
          style={{ color: 'var(--text-secondary)' }}
        >
          {helper}
        </p>
      )}
    </div>
  );
}
