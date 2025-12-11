import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { Terminal, Send, ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation } from '../i18n/i18nContext';

interface ConsoleProps {
    logs: string[];
    onInput?: (value: string) => void;
    isWaitingForInput?: boolean;
}

export interface ConsoleRef {
    handleInputChange: (value: string) => void;
    requestInput: (callback: (value: string) => void) => void;
}

export const Console = forwardRef<ConsoleRef, ConsoleProps>(({ logs, onInput, isWaitingForInput }, ref) => {
    const { t } = useTranslation();
    const [inputValue, setInputValue] = useState('');
    const [consoleHeight, setConsoleHeight] = useState(300);
    const [consoleWidth, setConsoleWidth] = useState(400);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const endRef = useRef<HTMLDivElement>(null);
    const inputCallbackRef = useRef<((value: string) => void) | null>(null);
    const isResizingCorner = useRef(false);

    useImperativeHandle(ref, () => ({
        handleInputChange: (value: string) => {
            if (inputCallbackRef.current) {
                inputCallbackRef.current(value);
                inputCallbackRef.current = null;
            }
        },
        requestInput: (callback: (value: string) => void) => {
            inputCallbackRef.current = callback;
        }
    }));

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (onInput && inputValue.trim()) {
            onInput(inputValue);
            setInputValue('');
        }
    };

    const handleResizeCornerMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        isResizingCorner.current = true;

        const startX = e.clientX;
        const startY = e.clientY;
        const startWidth = consoleWidth;
        const startHeight = consoleHeight;

        const handleMouseMove = (moveEvent: MouseEvent) => {
            if (!isResizingCorner.current) return;

            const deltaX = startX - moveEvent.clientX; // Invertito perché tiriamo verso sinistra
            const deltaY = startY - moveEvent.clientY; // Invertito perché tiriamo verso l'alto

            const newWidth = Math.max(300, Math.min(startWidth + deltaX, 800));
            const newHeight = Math.max(150, Math.min(startHeight + deltaY, 700));

            setConsoleWidth(newWidth);
            setConsoleHeight(newHeight);
        };

        const handleMouseUp = () => {
            isResizingCorner.current = false;
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    return (
        <div className="glass-panel console-wrapper" style={{
            height: isCollapsed ? '50px' : `${consoleHeight}px`,
            width: `${consoleWidth}px`,
            position: 'absolute',
            bottom: '20px',
            right: '20px'
        }}>
            {/* Resize Handle Angolo (top-left corner) - solo quando NON collassata */}
            {!isCollapsed && (
                <div
                    onMouseDown={handleResizeCornerMouseDown}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '16px',
                        height: '16px',
                        cursor: 'nwse-resize',
                        zIndex: 101,
                        borderTopLeftRadius: '16px',
                        background: 'linear-gradient(135deg, transparent 0%, transparent 50%, rgba(99, 102, 241, 0.4) 50%, rgba(99, 102, 241, 0.4) 55%, transparent 55%, transparent 60%, rgba(99, 102, 241, 0.4) 60%, rgba(99, 102, 241, 0.4) 65%, transparent 65%, transparent 70%, rgba(99, 102, 241, 0.4) 70%, rgba(99, 102, 241, 0.4) 75%, transparent 75%)',
                        backgroundSize: '12px 12px',
                        backgroundPosition: 'top left',
                        backgroundRepeat: 'no-repeat'
                    }}
                />
            )}

            {/* Header/Banner */}
            <div style={{
                padding: '10px',
                paddingTop: '12px',
                borderBottom: isCollapsed ? 'none' : '1px solid var(--glass-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(0, 0, 0, 0.2)',
                borderTopLeftRadius: '16px',
                borderTopRightRadius: '16px',
                borderBottomLeftRadius: isCollapsed ? '16px' : '0',
                borderBottomRightRadius: isCollapsed ? '16px' : '0'
            }}>
                {/* Titolo a sinistra */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Terminal size={16} />
                    <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{t('console.title')}</span>
                </div>

                {/* Pulsante collapse a destra */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        padding: '4px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(99, 102, 241, 0.2)';
                        e.currentTarget.style.color = 'var(--primary-color)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'var(--text-secondary)';
                    }}
                    title={isCollapsed ? t('console.expandTooltip') : t('console.collapseTooltip')}
                >
                    {isCollapsed ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
            </div>

            {!isCollapsed && (
                <div style={{
                    flex: 1,
                    padding: '10px',
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    fontFamily: 'monospace',
                    fontSize: '0.9rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    minHeight: 0 // Importante per permettere lo scroll corretto
                }}>
                {logs.map((log, index) => {
                    // Colore in base al tipo di messaggio
                    let color = 'var(--text-secondary)';
                    if (log.includes('❌') || log.startsWith('Error')) color = '#ef4444';
                    else if (log.includes('⚠️')) color = '#f59e0b';
                    else if (log.includes('✅')) color = '#10b981';
                    else if (log.startsWith('Input')) color = '#8b5cf6';
                    else if (log.startsWith('Output')) color = '#6366f1';

                    return (
                        <div
                            key={index}
                            style={{
                                color,
                                whiteSpace: 'pre-wrap', // Preserva le newline
                                lineHeight: '1.4',
                                padding: '4px 0',
                                borderBottom: index < logs.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none'
                            }}
                        >
                            {log}
                        </div>
                    );
                })}
                <div ref={endRef} />
                </div>
            )}

            {!isCollapsed && (
                <form onSubmit={handleSubmit} style={{
                padding: '10px',
                borderTop: '1px solid var(--glass-border)',
                display: 'flex',
                gap: '10px'
            }}>
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={isWaitingForInput ? t('console.inputPlaceholderWaiting') : t('console.inputPlaceholderReady')}
                    disabled={!isWaitingForInput}
                    style={{
                        flexGrow: 1,
                        background: 'rgba(0, 0, 0, 0.3)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '4px',
                        padding: '5px 10px',
                        color: 'white',
                        outline: 'none'
                    }}
                />
                <button
                    type="submit"
                    disabled={!isWaitingForInput}
                    className="btn btn-primary"
                    style={{ padding: '5px 10px', opacity: isWaitingForInput ? 1 : 0.5 }}
                >
                    <Send size={14} />
                </button>
                </form>
            )}
        </div>
    );
});

Console.displayName = 'Console';
