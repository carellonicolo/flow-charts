import { Play, Square, ArrowRight, Save, LogOut, Diamond, MessageSquare } from 'lucide-react';
import { useTranslation } from '../i18n/i18nContext';

export const StartNodePreview = () => {
    const { t } = useTranslation();
    return (
        <div style={{
            padding: '12px 24px',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            borderRadius: '24px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)',
            border: '1px solid rgba(255,255,255,0.2)'
        }}>
            <Play size={18} color="white" />
            <div style={{ color: 'white', fontWeight: 'bold', fontSize: '1rem', textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>
                {t('nodes.start')}
            </div>
        </div>
    );
};

export const EndNodePreview = () => {
    const { t } = useTranslation();
    return (
        <div style={{
            padding: '12px 24px',
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            borderRadius: '24px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)',
            border: '1px solid rgba(255,255,255,0.2)'
        }}>
            <Square size={18} color="white" />
            <div style={{ color: 'white', fontWeight: 'bold', fontSize: '1rem', textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>
                {t('nodes.end')}
            </div>
        </div>
    );
};

export const ProcessNodePreview = () => {
    const { t } = useTranslation();
    return (
        <div style={{
            padding: '16px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            borderRadius: '12px',
            minWidth: '160px',
            textAlign: 'center',
            boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)',
            border: '1px solid rgba(255,255,255,0.2)',
            display: 'inline-block'
        }}>
            <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', opacity: 0.9 }}>
                <ArrowRight size={14} color="white" />
                <span style={{ color: 'white', fontSize: '11px', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px' }}>
                    {t('nodes.process')}
                </span>
            </div>
            <div style={{ color: 'white', fontWeight: 'bold', fontSize: '1.1rem' }}>x = x + 1</div>
        </div>
    );
};

export const DecisionNodePreview = () => {
    const { t } = useTranslation();
    const diamondSize = 120;
    const containerSize = 150;
    const centerPoint = containerSize / 2;
    const vertexDistance = Math.sqrt(2) * (diamondSize / 2);

    return (
        <div style={{
            position: 'relative',
            width: `${containerSize}px`,
            height: `${containerSize}px`,
            display: 'inline-block'
        }}>
            <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: `${diamondSize}px`,
                height: `${diamondSize}px`,
                transform: 'translate(-50%, -50%) rotate(45deg)',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                borderRadius: '12px',
                boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4)',
                border: '1px solid rgba(255,255,255,0.2)'
            }} />
            <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
                color: 'white',
                fontWeight: 'bold',
                width: '90px',
                pointerEvents: 'none'
            }}>
                <Diamond size={18} style={{ marginBottom: '4px', opacity: 0.8 }} />
                <div style={{ fontSize: '0.85rem', lineHeight: '1.2' }}>x &gt; 10</div>
            </div>
            <div style={{
                position: 'absolute',
                top: `${centerPoint + vertexDistance + 12}px`,
                left: '50%',
                transform: 'translateX(-50%)',
                color: '#10b981',
                fontWeight: 'bold',
                fontSize: '0.75rem'
            }}>
                {t('nodes.decisionTrue')}
            </div>
            <div style={{
                position: 'absolute',
                top: '50%',
                left: `${centerPoint + vertexDistance + 12}px`,
                transform: 'translateY(-50%)',
                color: '#ef4444',
                fontWeight: 'bold',
                fontSize: '0.75rem',
                whiteSpace: 'nowrap'
            }}>
                {t('nodes.decisionFalse')}
            </div>
        </div>
    );
};

export const InputNodePreview = () => {
    const { t } = useTranslation();
    return (
        <div style={{
            position: 'relative',
            minWidth: '160px',
            minHeight: '80px',
            display: 'inline-block'
        }}>
            <div style={{
                padding: '16px',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                borderRadius: '8px',
                transform: 'skew(-10deg)',
                textAlign: 'center',
                boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)',
                border: '1px solid rgba(255,255,255,0.2)'
            }}>
                <div style={{ transform: 'skew(10deg)' }}>
                    <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', opacity: 0.9 }}>
                        <Save size={14} color="white" />
                        <span style={{ color: 'white', fontSize: '11px', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px' }}>
                            {t('nodes.input')}
                        </span>
                    </div>
                    <div style={{ color: 'white', fontWeight: 'bold', fontSize: '1.1rem' }}>numero</div>
                </div>
            </div>
        </div>
    );
};

export const OutputNodePreview = () => {
    const { t } = useTranslation();
    return (
        <div style={{
            position: 'relative',
            minWidth: '160px',
            minHeight: '80px',
            display: 'inline-block'
        }}>
            <div style={{
                padding: '16px',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                borderRadius: '8px',
                transform: 'skew(-10deg)',
                textAlign: 'center',
                boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)',
                border: '1px solid rgba(255,255,255,0.2)'
            }}>
                <div style={{ transform: 'skew(10deg)' }}>
                    <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', opacity: 0.9 }}>
                        <LogOut size={14} color="white" />
                        <span style={{ color: 'white', fontSize: '11px', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px' }}>
                            {t('nodes.output')}
                        </span>
                    </div>
                    <div style={{ color: 'white', fontWeight: 'bold', fontSize: '1.1rem' }}>risultato</div>
                </div>
            </div>
        </div>
    );
};

export const CommentNodePreview = () => {
    const { t } = useTranslation();
    return (
        <div style={{
            padding: '8px 12px',
            background: '#fef3c7',
            borderRadius: '2px',
            width: '140px',
            height: '60px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            border: '1px solid #fcd34d',
            borderLeft: '4px solid #f59e0b',
            color: '#78350f',
            display: 'inline-block'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px', opacity: 0.7 }}>
                <MessageSquare size={10} />
                <span style={{ fontSize: '8px', textTransform: 'uppercase', fontWeight: 600 }}>{t('nodes.comment')}</span>
            </div>
            <div style={{ fontSize: '0.7rem', fontStyle: 'italic', lineHeight: '1.2' }}>
                Nota di testo...
            </div>
        </div>
    );
};
