import { X, Trophy, Brain, Star } from 'lucide-react';
import { useTranslation } from '../i18n/i18nContext';
import { useState, useEffect } from 'react';
import type { Exercise } from '../data/exercises';

interface ExerciseViewModalProps {
    isOpen: boolean;
    onClose: () => void;
    exercise: Exercise | null;
    onConfirm: (description: string) => void;
}

export const ExerciseViewModal = ({ isOpen, onClose, exercise, onConfirm }: ExerciseViewModalProps) => {
    const { language } = useTranslation();
    const [isAnimating, setIsAnimating] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setShouldRender(true);
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    setIsAnimating(true);
                });
            });
        } else {
            setIsAnimating(false);
            const timer = setTimeout(() => {
                setShouldRender(false);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!shouldRender || !exercise) return null;

    const difficultyConfig = {
        beginner: { icon: Star, color: '#10b981', label: { it: 'Principiante', en: 'Beginner' } },
        intermediate: { icon: Brain, color: '#f59e0b', label: { it: 'Intermedio', en: 'Intermediate' } },
        advanced: { icon: Trophy, color: '#ef4444', label: { it: 'Avanzato', en: 'Advanced' } }
    };

    const config = difficultyConfig[exercise.category];
    const Icon = config.icon;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '20px',
            opacity: isAnimating ? 1 : 0,
            transition: 'opacity 300ms ease'
        }} onClick={onClose}>
            <div
                className="glass-panel"
                style={{
                    width: '100%',
                    maxWidth: '500px',
                    padding: '32px',
                    borderRadius: '24px',
                    background: 'var(--modal-bg)',
                    border: '1px solid var(--glass-border)',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                    position: 'relative',
                    opacity: isAnimating ? 1 : 0,
                    transform: isAnimating ? 'scale(1) translateY(0)' : 'scale(0.9) translateY(20px)',
                    transition: 'all 300ms cubic-bezier(0.34, 1.56, 0.64, 1)'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '20px',
                        right: '20px',
                        background: 'rgba(255,255,255,0.05)',
                        border: 'none',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        padding: '8px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <X size={20} />
                </button>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            padding: '12px',
                            borderRadius: '16px',
                            background: `${config.color}20`,
                            color: config.color
                        }}>
                            <Icon size={24} />
                        </div>
                        <div>
                            <div style={{
                                fontSize: '0.75rem',
                                fontWeight: 'bold',
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                                color: config.color,
                                marginBottom: '2px'
                            }}>
                                {language === 'it' ? config.label.it : config.label.en}
                            </div>
                            <h3 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--text-color)' }}>
                                Esercizio #{exercise.id}: {language === 'it' ? exercise.title.it : exercise.title.en}
                            </h3>
                        </div>
                    </div>

                    <div style={{
                        padding: '24px',
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: '20px',
                        border: '1px solid rgba(255,255,255,0.05)',
                        lineHeight: '1.6',
                        color: 'var(--text-color)',
                        fontSize: '1.1rem',
                        boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.1)'
                    }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '8px', color: 'var(--primary-color)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            {language === 'it' ? 'Consegna Esercizio:' : 'Exercise Prompt:'}
                        </div>
                        {language === 'it' ? exercise.description.it : exercise.description.en}
                    </div>

                    <button
                        className="btn btn-primary"
                        onClick={() => onConfirm(language === 'it' ? exercise.description.it : exercise.description.en)}
                        style={{
                            width: '100%',
                            padding: '16px',
                            borderRadius: '16px',
                            fontWeight: 'bold',
                            fontSize: '1.1rem',
                            boxShadow: '0 8px 20px rgba(99, 102, 241, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        {language === 'it' ? 'Iniziamo!' : 'Let\'s start!'}
                    </button>
                </div>
            </div>
        </div>
    );
};
