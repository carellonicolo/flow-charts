import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Terminal, Send, ChevronDown, ChevronUp, HelpCircle, Trash2, Copy, Check, Eye, EyeOff, ChevronRight } from 'lucide-react';
import { useTranslation } from '../i18n/i18nContext';
import { HelpModal } from './HelpModal';
import type { LogEntry, LogKind } from '../types/console';

interface ConsoleProps {
    logs: LogEntry[];
    onInput?: (value: string) => void;
    isWaitingForInput?: boolean;
    currentPrompt?: string;
    onClear?: () => void;
}

const KIND_COLOR: Record<LogKind, string> = {
    system: 'var(--text-secondary)',
    trace: 'var(--text-secondary)',
    output: 'var(--text-color)',
    prompt: '#a78bfa',
    input: '#8b5cf6',
    warning: '#f59e0b',
    error: '#ef4444',
};

export const Console: React.FC<ConsoleProps> = ({ logs, onInput, isWaitingForInput, currentPrompt, onClear }) => {
    const { t } = useTranslation();
    const [inputValue, setInputValue] = useState('');
    const [consoleHeight, setConsoleHeight] = useState(300);
    const [consoleWidth, setConsoleWidth] = useState(400);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
    const [showTrace, setShowTrace] = useState(true);
    const [copied, setCopied] = useState(false);
    const endRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const isResizingCorner = useRef(false);

    const traceCount = useMemo(() => logs.filter(l => l.kind === 'trace').length, [logs]);
    const visibleLogs = useMemo(
        () => showTrace ? logs : logs.filter(l => l.kind !== 'trace'),
        [logs, showTrace],
    );

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [visibleLogs]);

    // Focus the field as soon as the program asks for input.
    useEffect(() => {
        if (isWaitingForInput) inputRef.current?.focus();
    }, [isWaitingForInput]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isWaitingForInput && onInput) {
            onInput(inputValue);
            setInputValue('');
        }
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(logs.map(l => l.text).join('\n'));
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch { /* ignore */ }
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
            const deltaX = startX - moveEvent.clientX;
            const deltaY = startY - moveEvent.clientY;
            setConsoleWidth(Math.max(300, Math.min(startWidth + deltaX, 800)));
            setConsoleHeight(Math.max(150, Math.min(startHeight + deltaY, 700)));
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
        <>
        <div className="glass-panel console-wrapper" style={{
            height: isCollapsed ? '50px' : `${consoleHeight}px`,
            width: `${consoleWidth}px`,
            position: 'absolute',
            bottom: '20px',
            right: '20px'
        }}>
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

            {/* Header */}
            <div style={{
                padding: '10px',
                paddingTop: '12px',
                borderBottom: isCollapsed ? 'none' : '1px solid var(--glass-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '6px',
                background: 'rgba(0, 0, 0, 0.2)',
                borderTopLeftRadius: '16px',
                borderTopRightRadius: '16px',
                borderBottomLeftRadius: isCollapsed ? '16px' : '0',
                borderBottomRightRadius: isCollapsed ? '16px' : '0'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                    <Terminal size={16} />
                    <span style={{ fontWeight: 'bold', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>{t('console.title')}</span>
                    {isWaitingForInput && (
                        <span style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            color: '#a78bfa',
                            background: 'rgba(167, 139, 250, 0.15)',
                            padding: '2px 8px',
                            borderRadius: '100px',
                            whiteSpace: 'nowrap',
                        }}>{t('console.waitingBadge')}</span>
                    )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                    {!isCollapsed && (
                        <>
                            <HeaderBtn
                                onClick={() => setShowTrace(s => !s)}
                                active={!showTrace}
                                title={showTrace ? t('console.hideTrace') : t('console.showTrace')}
                                disabled={traceCount === 0}
                            >{showTrace ? <Eye size={15} /> : <EyeOff size={15} />}</HeaderBtn>
                            <HeaderBtn
                                onClick={handleCopy}
                                title={t('console.copy')}
                                disabled={logs.length === 0}
                            >{copied ? <Check size={15} color="#10b981" /> : <Copy size={15} />}</HeaderBtn>
                            <HeaderBtn
                                onClick={() => onClear?.()}
                                title={t('console.clear')}
                                disabled={logs.length === 0}
                            ><Trash2 size={15} /></HeaderBtn>
                        </>
                    )}
                    <HeaderBtn
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        title={isCollapsed ? t('console.expandTooltip') : t('console.collapseTooltip')}
                    >{isCollapsed ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</HeaderBtn>
                </div>
            </div>

            {!isCollapsed && (
                <div style={{
                    flex: 1,
                    padding: '8px 10px',
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    fontFamily: 'Menlo, Monaco, "Fira Code", monospace',
                    fontSize: '0.85rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                    minHeight: 0
                }}>
                    {visibleLogs.length === 0 ? (
                        <div style={{ padding: '16px 6px', fontStyle: 'italic', color: 'var(--text-secondary)', opacity: 0.7, fontFamily: 'system-ui, sans-serif' }}>
                            {t('console.empty')}
                        </div>
                    ) : (
                        visibleLogs.map((log, index) => <LogRow key={index} entry={log} />)
                    )}
                    <div ref={endRef} />
                </div>
            )}

            {!isCollapsed && (
                <form onSubmit={handleSubmit} style={{
                    padding: '10px',
                    borderTop: '1px solid var(--glass-border)',
                    display: 'flex',
                    gap: '8px',
                    alignItems: 'center'
                }}>
                    <button
                        type="button"
                        onClick={() => setIsHelpModalOpen(true)}
                        className="btn btn-icon"
                        style={{ padding: '5px', minWidth: '32px', height: '32px', background: 'transparent', border: '1px solid var(--glass-border)' }}
                        title={t('console.help')}
                    >
                        <HelpCircle size={16} />
                    </button>
                    <div style={{
                        flexGrow: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: 'rgba(0, 0, 0, 0.3)',
                        border: `1px solid ${isWaitingForInput ? '#8b5cf6' : 'var(--glass-border)'}`,
                        borderRadius: '4px',
                        padding: '0 8px',
                        transition: 'border-color 0.15s',
                    }}>
                        <ChevronRight size={15} color={isWaitingForInput ? '#a78bfa' : 'var(--text-secondary)'} style={{ flexShrink: 0 }} />
                        <input
                            ref={inputRef}
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder={isWaitingForInput ? (currentPrompt || t('console.inputPlaceholderWaiting')) : t('console.inputPlaceholderReady')}
                            disabled={!isWaitingForInput}
                            style={{
                                flexGrow: 1,
                                background: 'transparent',
                                border: 'none',
                                padding: '6px 0',
                                color: 'white',
                                outline: 'none',
                                minWidth: 0,
                            }}
                        />
                    </div>
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
        {createPortal(
            <HelpModal
                isOpen={isHelpModalOpen}
                onClose={() => setIsHelpModalOpen(false)}
                title={t('consoleHelp.title')}
                content={{
                    description: t('consoleHelp.description'),
                    usage: t('consoleHelp.usage'),
                    example: t('consoleHelp.example')
                }}
            />,
            document.body
        )}
        </>
    );
};

const HeaderBtn: React.FC<{ onClick: () => void; title: string; active?: boolean; disabled?: boolean; children: React.ReactNode }> = ({ onClick, title, active, disabled, children }) => (
    <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        title={title}
        style={{
            background: active ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
            border: 'none',
            color: active ? 'var(--primary-color)' : 'var(--text-secondary)',
            cursor: disabled ? 'default' : 'pointer',
            opacity: disabled ? 0.35 : 1,
            padding: '5px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.15s',
        }}
    >{children}</button>
);

const LogRow: React.FC<{ entry: LogEntry }> = ({ entry }) => {
    const color = KIND_COLOR[entry.kind];

    if (entry.kind === 'output') {
        return (
            <div style={{
                color,
                whiteSpace: 'pre-wrap',
                lineHeight: 1.5,
                padding: '3px 8px',
                margin: '1px 0',
                fontWeight: 600,
                borderLeft: '3px solid var(--primary-color)',
                background: 'rgba(99, 102, 241, 0.08)',
                borderRadius: '0 4px 4px 0',
            }}>{entry.text || ' '}</div>
        );
    }

    if (entry.kind === 'prompt' || entry.kind === 'input') {
        const marker = entry.kind === 'prompt' ? '?' : '▸';
        return (
            <div style={{ color, whiteSpace: 'pre-wrap', lineHeight: 1.5, padding: '2px 0', display: 'flex', gap: '8px' }}>
                <span style={{ flexShrink: 0, fontWeight: 700, opacity: 0.8 }}>{marker}</span>
                <span style={{ fontWeight: entry.kind === 'input' ? 600 : 500 }}>{entry.text}</span>
            </div>
        );
    }

    // system / trace / warning / error
    const dimmed = entry.kind === 'trace';
    return (
        <div style={{
            color,
            whiteSpace: 'pre-wrap',
            lineHeight: 1.5,
            padding: '2px 0',
            opacity: dimmed ? 0.65 : 1,
            display: 'flex',
            gap: '8px',
        }}>
            {dimmed && <span style={{ flexShrink: 0, opacity: 0.6 }}>{'›'}</span>}
            <span>{entry.text}</span>
        </div>
    );
};

Console.displayName = 'Console';
