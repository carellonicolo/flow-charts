import React, { useEffect } from 'react';

interface ToastProps {
    message: string;
    onClose: () => void;
    duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ message, onClose, duration = 3000 }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, duration);
        return () => clearTimeout(timer);
    }, [duration, onClose]);

    return (
        <div className="toast-container">
            <div className="glass-panel toast">
                <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    style={{ marginRight: '10px', flexShrink: 0 }}
                >
                    <circle cx="10" cy="10" r="9" stroke="#ef4444" strokeWidth="2" fill="none"/>
                    <path d="M10 6V11" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
                    <circle cx="10" cy="14" r="1" fill="#ef4444"/>
                </svg>
                <span style={{ color: 'var(--text-color)', fontSize: '0.9rem' }}>{message}</span>
            </div>
        </div>
    );
};
