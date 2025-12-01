import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { Terminal, Send } from 'lucide-react';

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
    const [inputValue, setInputValue] = useState('');
    const endRef = useRef<HTMLDivElement>(null);
    const inputCallbackRef = useRef<((value: string) => void) | null>(null);

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

    return (
        <div className="glass-panel console-wrapper">
            <div style={{
                padding: '10px',
                borderBottom: '1px solid var(--glass-border)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: 'rgba(0, 0, 0, 0.2)',
                borderTopLeftRadius: '16px',
                borderTopRightRadius: '16px'
            }}>
                <Terminal size={16} />
                <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Console Output</span>
            </div>

            <div style={{
                flexGrow: 1,
                padding: '10px',
                overflowY: 'auto',
                fontFamily: 'monospace',
                fontSize: '0.9rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '5px'
            }}>
                {logs.map((log, index) => (
                    <div key={index} style={{ color: log.startsWith('Error') ? '#ef4444' : log.startsWith('Input') ? '#f59e0b' : 'var(--text-secondary)' }}>
                        {log}
                    </div>
                ))}
                <div ref={endRef} />
            </div>

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
                    placeholder={isWaitingForInput ? "Enter value..." : "Ready..."}
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
        </div>
    );
});

Console.displayName = 'Console';
