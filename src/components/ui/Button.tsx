import type { ButtonHTMLAttributes, ReactNode } from 'react';

/**
 * Varianti del button
 */
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

/**
 * Dimensioni del button
 */
export type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * Props del Button
 */
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

/**
 * Stili per varianti
 */
const variantStyles: Record<ButtonVariant, string> = {
  primary: `
    bg-[var(--accent-blue)] text-white
    hover:bg-[var(--accent-blue-hover)]
    active:bg-[var(--accent-blue-active)]
    disabled:opacity-50 disabled:cursor-not-allowed
  `,
  secondary: `
    bg-[var(--bg-tertiary)] text-[var(--text-primary)]
    border border-[var(--border-primary)]
    hover:bg-[var(--bg-secondary)]
    active:bg-[var(--bg-primary)]
    disabled:opacity-50 disabled:cursor-not-allowed
  `,
  ghost: `
    bg-transparent text-[var(--text-primary)]
    hover:bg-[var(--bg-secondary)]
    active:bg-[var(--bg-tertiary)]
    disabled:opacity-50 disabled:cursor-not-allowed
  `,
  danger: `
    bg-[var(--status-error)] text-white
    hover:opacity-90
    active:opacity-80
    disabled:opacity-50 disabled:cursor-not-allowed
  `,
};

/**
 * Stili per dimensioni
 */
const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

/**
 * Button Component
 * Design Apple-like con smooth transitions
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = `
    inline-flex items-center justify-center gap-2
    font-medium rounded-lg
    transition-fast
    focus:outline-none focus:ring-2 focus:ring-[var(--border-focus)] focus:ring-offset-2
  `;

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${widthStyle}
        ${className}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <span className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
      )}

      {!isLoading && icon && iconPosition === 'left' && (
        <span className="inline-flex">{icon}</span>
      )}

      {children}

      {!isLoading && icon && iconPosition === 'right' && (
        <span className="inline-flex">{icon}</span>
      )}
    </button>
  );
}

/**
 * IconButton - Button solo con icona
 */
interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  'aria-label': string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

export function IconButton({
  icon,
  variant = 'ghost',
  size = 'md',
  isLoading = false,
  className = '',
  disabled,
  ...props
}: IconButtonProps) {
  const sizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3',
  };

  const baseStyles = `
    inline-flex items-center justify-center
    rounded-lg
    transition-fast hover-scale
    focus:outline-none focus:ring-2 focus:ring-[var(--border-focus)] focus:ring-offset-2
  `;

  return (
    <button
      className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="animate-spin inline-block w-5 h-5 border-2 border-current border-t-transparent rounded-full" />
      ) : (
        icon
      )}
    </button>
  );
}
