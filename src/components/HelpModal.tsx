import { X } from 'lucide-react';
import { useTranslation } from '../i18n/i18nContext';
import { useState, useEffect } from 'react';

export interface HelpContent {
    description: string;
    usage: string;
    example: string;
    theory?: string;
    image?: string;
    preview?: React.ReactNode;
    features?: Array<{ icon: string; title: string; description: string; color: string }>;
    steps?: Array<{ number: number; title: string; description: string }>;
    tips?: Array<{ text: string; type: 'success' | 'info' | 'warning' }>;
}

interface HelpModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    content: HelpContent | string;
}

export const HelpModal = ({ isOpen, onClose, title, content }: HelpModalProps) => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<'usage' | 'theory'>('usage');
    const [isAnimating, setIsAnimating] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);

    console.log('🎭 HelpModal render - isOpen:', isOpen, 'title:', title);

    useEffect(() => {
        if (isOpen) {
            setShouldRender(true);
            // Piccolo delay per permettere al DOM di aggiornarsi prima dell'animazione
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    setIsAnimating(true);
                });
            });
        } else {
            setIsAnimating(false);
            // Aspetta che l'animazione finisca prima di smontare
            const timer = setTimeout(() => {
                setShouldRender(false);
            }, 300); // Durata dell'animazione
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!shouldRender) {
        return null;
    }

    const isRichContent = typeof content === 'object';
    const helpContent = isRichContent ? content : { description: content, usage: '', example: '' };

    // Determina se mostrare i tabs (solo se c'è una sezione theory)
    const showTabs = isRichContent && helpContent.theory;

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
            padding: '20px',
            opacity: isAnimating ? 1 : 0,
            transition: 'opacity 300ms cubic-bezier(0.4, 0, 0.2, 1), backdrop-filter 300ms cubic-bezier(0.4, 0, 0.2, 1)'
        }} onClick={onClose}>
            <div
                className="glass-panel"
                style={{
                    width: '100%',
                    maxWidth: '800px',
                    maxHeight: '85vh',
                    padding: '24px',
                    borderRadius: '16px',
                    background: 'var(--modal-bg)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    border: '1px solid var(--glass-border)',
                    boxShadow: 'var(--modal-shadow)',
                    position: 'relative',
                    overflowY: 'auto',
                    opacity: isAnimating ? 1 : 0,
                    transform: isAnimating ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(20px)',
                    transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)'
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

                {/* Tabs */}
                {showTabs && (
                    <div style={{
                        display: 'flex',
                        gap: '8px',
                        marginBottom: '20px',
                        borderBottom: '2px solid var(--glass-border)'
                    }}>
                        <button
                            onClick={() => setActiveTab('usage')}
                            style={{
                                padding: '10px 20px',
                                background: activeTab === 'usage' ? 'var(--primary-color)' : 'transparent',
                                border: 'none',
                                borderBottom: activeTab === 'usage' ? '2px solid var(--primary-color)' : '2px solid transparent',
                                color: activeTab === 'usage' ? 'white' : 'var(--text-secondary)',
                                cursor: 'pointer',
                                fontSize: '0.95rem',
                                fontWeight: activeTab === 'usage' ? 'bold' : 'normal',
                                borderRadius: '8px 8px 0 0',
                                transition: 'all 0.2s',
                                marginBottom: '-2px'
                            }}
                        >
                            {t('modal.usageTab')}
                        </button>
                        <button
                            onClick={() => setActiveTab('theory')}
                            style={{
                                padding: '10px 20px',
                                background: activeTab === 'theory' ? 'var(--primary-color)' : 'transparent',
                                border: 'none',
                                borderBottom: activeTab === 'theory' ? '2px solid var(--primary-color)' : '2px solid transparent',
                                color: activeTab === 'theory' ? 'white' : 'var(--text-secondary)',
                                cursor: 'pointer',
                                fontSize: '0.95rem',
                                fontWeight: activeTab === 'theory' ? 'bold' : 'normal',
                                borderRadius: '8px 8px 0 0',
                                transition: 'all 0.2s',
                                marginBottom: '-2px'
                            }}
                        >
                            {t('modal.theoryTab')}
                        </button>
                    </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Tab Content: Usage */}
                    {(!showTabs || activeTab === 'usage') && (
                        <>
                            {/* Node Preview */}
                            {isRichContent && helpContent.preview && (
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    padding: '20px',
                                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.12), rgba(168, 85, 247, 0.12))',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(139, 92, 246, 0.2)',
                                    boxShadow: '0 2px 8px rgba(139, 92, 246, 0.08)'
                                }}>
                                    {helpContent.preview}
                                </div>
                            )}

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
                                        background: 'rgba(139, 92, 246, 0.1)',
                                        borderRadius: '8px',
                                        color: 'var(--text-color)',
                                        fontSize: '0.9rem',
                                        lineHeight: '1.5',
                                        overflow: 'auto',
                                        border: '1px solid rgba(139, 92, 246, 0.2)',
                                        boxShadow: '0 2px 4px rgba(139, 92, 246, 0.05)'
                                    }}>
                                        {helpContent.example}
                                    </pre>
                                </div>
                            )}

                            {/* Features Grid */}
                            {isRichContent && helpContent.features && (
                                <div>
                                    <h4 style={{
                                        margin: '0 0 12px 0',
                                        color: 'var(--primary-color)',
                                        fontSize: '1.1rem'
                                    }}>
                                        {t('modal.featuresTitle')}
                                    </h4>
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                        gap: '12px'
                                    }}>
                                        {helpContent.features.map((feature, index) => (
                                            <div key={index} style={{
                                                padding: '16px',
                                                background: `linear-gradient(135deg, ${feature.color}15, ${feature.color}08)`,
                                                borderRadius: '12px',
                                                border: `1px solid ${feature.color}30`,
                                                transition: 'transform 0.2s',
                                                cursor: 'default'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                            >
                                                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{feature.icon}</div>
                                                <div style={{
                                                    fontWeight: 'bold',
                                                    marginBottom: '4px',
                                                    color: feature.color,
                                                    fontSize: '0.95rem'
                                                }}>{feature.title}</div>
                                                <div style={{
                                                    fontSize: '0.85rem',
                                                    color: 'var(--text-secondary)',
                                                    lineHeight: '1.4'
                                                }}>{feature.description}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Steps */}
                            {isRichContent && helpContent.steps && (
                                <div>
                                    <h4 style={{
                                        margin: '0 0 12px 0',
                                        color: 'var(--primary-color)',
                                        fontSize: '1.1rem'
                                    }}>
                                        {t('modal.stepsTitle')}
                                    </h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {helpContent.steps.map((step, index) => (
                                            <div key={index} style={{
                                                display: 'flex',
                                                gap: '16px',
                                                padding: '16px',
                                                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(168, 85, 247, 0.05))',
                                                borderRadius: '12px',
                                                border: '1px solid rgba(99, 102, 241, 0.2)',
                                                position: 'relative',
                                                overflow: 'hidden'
                                            }}>
                                                <div style={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    width: '4px',
                                                    height: '100%',
                                                    background: 'linear-gradient(to bottom, #6366f1, #a855f7)'
                                                }} />
                                                <div style={{
                                                    minWidth: '32px',
                                                    height: '32px',
                                                    borderRadius: '50%',
                                                    background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                                                    color: 'white',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontWeight: 'bold',
                                                    fontSize: '0.9rem',
                                                    flexShrink: 0,
                                                    boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)'
                                                }}>{step.number}</div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{
                                                        fontWeight: 'bold',
                                                        marginBottom: '4px',
                                                        color: 'var(--text-color)',
                                                        fontSize: '0.95rem'
                                                    }}>{step.title}</div>
                                                    <div style={{
                                                        fontSize: '0.85rem',
                                                        color: 'var(--text-secondary)',
                                                        lineHeight: '1.5'
                                                    }}>{step.description}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Tips */}
                            {isRichContent && helpContent.tips && (
                                <div>
                                    <h4 style={{
                                        margin: '0 0 12px 0',
                                        color: 'var(--primary-color)',
                                        fontSize: '1.1rem'
                                    }}>
                                        💡 {t('modal.tipsTitle')}
                                    </h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {helpContent.tips.map((tip, index) => {
                                            const colors = {
                                                success: { bg: '#10b98120', border: '#10b981', icon: '✅' },
                                                info: { bg: '#3b82f620', border: '#3b82f6', icon: '💡' },
                                                warning: { bg: '#f59e0b20', border: '#f59e0b', icon: '⚡' }
                                            };
                                            const style = colors[tip.type];
                                            return (
                                                <div key={index} style={{
                                                    padding: '12px 16px',
                                                    background: style.bg,
                                                    borderLeft: `4px solid ${style.border}`,
                                                    borderRadius: '8px',
                                                    fontSize: '0.9rem',
                                                    color: 'var(--text-color)',
                                                    lineHeight: '1.5'
                                                }}>
                                                    <span style={{ marginRight: '8px' }}>{style.icon}</span>
                                                    {tip.text}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* Tab Content: Theory */}
                    {showTabs && activeTab === 'theory' && helpContent.theory && (
                        <div>
                            <div style={{
                                margin: 0,
                                padding: '16px',
                                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.12), rgba(168, 85, 247, 0.12))',
                                borderRadius: '8px',
                                color: 'var(--text-color)',
                                fontSize: '0.95rem',
                                lineHeight: '1.7',
                                border: '1px solid rgba(139, 92, 246, 0.2)',
                                whiteSpace: 'pre-wrap',
                                boxShadow: '0 2px 8px rgba(139, 92, 246, 0.08)'
                            }}>
                                {helpContent.theory}
                            </div>
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
