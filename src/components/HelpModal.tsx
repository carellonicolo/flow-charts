import { X } from 'lucide-react';

interface HelpModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    content: string;
}

export const HelpModal = ({ isOpen, onClose, title, content }: HelpModalProps) => {
    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }} onClick={onClose}>
            <div
                className="glass-panel"
                style={{
                    width: '400px',
                    padding: '24px',
                    borderRadius: '16px',
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--glass-border)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                    position: 'relative'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        padding: '4px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                    <X size={20} />
                </button>

                <h3 style={{
                    margin: '0 0 16px 0',
                    fontSize: '1.5rem',
                    background: 'linear-gradient(to right, #6366f1, #a855f7)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>
                    {title}
                </h3>

                <p style={{
                    margin: 0,
                    lineHeight: '1.6',
                    color: 'var(--text-color)',
                    fontSize: '1rem'
                }}>
                    {content}
                </p>
            </div>
        </div>
    );
};
