import * as SwitchPrimitive from '@radix-ui/react-switch';

/**
 * Props del Switch
 */
interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  'aria-label'?: string;
}

/**
 * Switch Component (Toggle)
 * Usa Radix UI Switch con styling Apple-like
 * Perfetto per dark mode toggle
 */
export default function Switch({
  checked,
  onCheckedChange,
  label,
  disabled = false,
  'aria-label': ariaLabel,
}: SwitchProps) {
  const switchId = `switch-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="flex items-center gap-3">
      <SwitchPrimitive.Root
        id={switchId}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        aria-label={ariaLabel || label}
        className={`
          relative inline-flex h-6 w-11
          items-center rounded-full
          transition-fast
          focus:outline-none focus:ring-2 focus:ring-[var(--border-focus)] focus:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed
          ${
            checked
              ? 'bg-[var(--accent-blue)]'
              : 'bg-[var(--border-primary)]'
          }
        `}
      >
        <SwitchPrimitive.Thumb
          className={`
            inline-block h-5 w-5
            transform rounded-full
            bg-white
            shadow-md
            transition-transform
            ${checked ? 'translate-x-5' : 'translate-x-0.5'}
          `}
        />
      </SwitchPrimitive.Root>

      {label && (
        <label
          htmlFor={switchId}
          className="text-sm font-medium cursor-pointer select-none transition-theme"
          style={{ color: 'var(--text-primary)' }}
        >
          {label}
        </label>
      )}
    </div>
  );
}
