import { useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';

/**
 * Props del Modal
 */
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
  closeOnEscape?: boolean;
  closeOnOutsideClick?: boolean;
}

/**
 * Size classes per modal
 */
const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
};

/**
 * Modal Component (Radix UI Dialog)
 * Design Apple-like con backdrop blur e animazioni fluide
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnEscape = true,
  closeOnOutsideClick = true,
}: ModalProps) {
  // Chiude su ESC
  useEffect(() => {
    if (!closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose, closeOnEscape]);

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        {/* Backdrop con blur */}
        <Dialog.Overlay
          className="fixed inset-0 z-[1040] animate-fadeIn"
          style={{
            background: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
          onClick={closeOnOutsideClick ? onClose : undefined}
        />

        {/* Content */}
        <Dialog.Content
          className={`
            fixed left-1/2 top-1/2 z-[1050]
            -translate-x-1/2 -translate-y-1/2
            w-full ${sizeClasses[size]} p-0
            rounded-xl shadow-xl
            animate-scaleIn
            transition-theme
          `}
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-primary)',
          }}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div
              className="flex items-center justify-between px-6 py-4 border-b transition-theme"
              style={{ borderColor: 'var(--border-primary)' }}
            >
              <div>
                {title && (
                  <Dialog.Title
                    className="text-lg font-semibold transition-theme"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {title}
                  </Dialog.Title>
                )}
                {description && (
                  <Dialog.Description
                    className="text-sm mt-1 transition-theme"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {description}
                  </Dialog.Description>
                )}
              </div>

              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="
                    rounded-full p-1.5
                    transition-fast hover-scale
                  "
                  style={{
                    color: 'var(--text-tertiary)',
                    background: 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--bg-secondary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                  aria-label="Chiudi"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          )}

          {/* Body */}
          <div className="px-6 py-4">
            {children}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/**
 * Modal Footer component
 * Utility per creare footer consistenti
 */
export function ModalFooter({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex items-center justify-end gap-3 px-6 py-4 border-t -mx-6 -mb-4 transition-theme"
      style={{
        borderColor: 'var(--border-primary)',
        background: 'var(--bg-secondary)',
      }}
    >
      {children}
    </div>
  );
}
