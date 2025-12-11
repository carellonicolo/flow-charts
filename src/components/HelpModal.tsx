import { X } from 'lucide-react';
import { useTranslation } from '../i18n/i18nContext';

export interface HelpContent {
    description: string;
    usage: string;
    example: string;
    image?: string;
}

interface HelpModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    content: HelpContent | string;
}

export const HelpModal = ({ isOpen, onClose, title, content }: HelpModalProps) => {
    const { t } = useTranslation();
    console.log('🎭 HelpModal render - isOpen:', isOpen, 'title:', title);

    if (!isOpen) {
        console.log('❌ Modal chiuso, return null');
        return null;
    }

    console.log('✅ Modal aperto, rendering in corso...');
    const isRichContent = typeof content === 'object';
    const helpContent = isRichContent ? content : { description: content, usage: '', example: '' };

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
            zIndex: 1000,
            padding: '20px'
        }} onClick={onClose}>
            <div
                className="glass-panel"
                style={{
                    width: '100%',
                    maxWidth: '600px',
                    maxHeight: '80vh',
                    padding: '24px',
                    borderRadius: '16px',
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--glass-border)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                    position: 'relative',
                    overflowY: 'auto'
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
                    margin: '0 0 20px 0',
                    fontSize: '1.5rem',
                    background: 'linear-gradient(to right, #6366f1, #a855f7)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>
                    {title}
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                        <h4 style={{
                            margin: '0 0 8px 0',
                            color: 'var(--primary-color)',
                            fontSize: '1.1rem'
                        }}>
                            {t('modal.descriptionTitle')}
                        </h4>
                        <p style={{
                            margin: 0,
                            lineHeight: '1.6',
                            color: 'var(--text-color)',
                            fontSize: '1rem'
                        }}>
                            {helpContent.description}
                        </p>
                    </div>

                    {helpContent.usage && (
                        <div>
                            <h4 style={{
                                margin: '0 0 8px 0',
                                color: 'var(--primary-color)',
                                fontSize: '1.1rem'
                            }}>
                                {t('modal.usageTitle')}
                            </h4>
                            <p style={{
                                margin: 0,
                                lineHeight: '1.6',
                                color: 'var(--text-color)',
                                fontSize: '1rem'
                            }}>
                                {helpContent.usage}
                            </p>
                        </div>
                    )}

                    {helpContent.example && (
                        <div>
                            <h4 style={{
                                margin: '0 0 8px 0',
                                color: 'var(--primary-color)',
                                fontSize: '1.1rem'
                            }}>
                                {t('modal.exampleTitle')}
                            </h4>
                            <pre style={{
                                margin: 0,
                                padding: '12px',
                                background: 'rgba(0, 0, 0, 0.2)',
                                borderRadius: '8px',
                                color: 'var(--text-color)',
                                fontSize: '0.9rem',
                                lineHeight: '1.5',
                                overflow: 'auto',
                                border: '1px solid var(--glass-border)'
                            }}>
                                {helpContent.example}
                            </pre>
                        </div>
                    )}

                    {isRichContent && helpContent.image && (
                        <div>
                            <h4 style={{
                                margin: '0 0 8px 0',
                                color: 'var(--primary-color)',
                                fontSize: '1.1rem'
                            }}>
                                {t('modal.visualExampleTitle')}
                            </h4>
                            <img
                                src={helpContent.image}
                                alt="Esempio"
                                style={{
                                    width: '100%',
                                    borderRadius: '8px',
                                    border: '1px solid var(--glass-border)'
                                }}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
