import { useEffect } from 'react';

export interface ShortcutHandlers {
    onSave?: () => void;
    onOpen?: () => void;
    onRunToggle?: () => void;
    onClear?: () => void;
    onDuplicate?: () => void;
    onCopy?: () => void;
    onPaste?: () => void;
    onCut?: () => void;
    onViewFlowchart?: () => void;
    onViewPseudocode?: () => void;
    onEscape?: () => void;
    onHelp?: () => void;
}

/**
 * Global keyboard shortcuts. All listed in src/components/ShortcutsHelp.tsx.
 * Each handler is invoked at most once per keypress. We ignore the event if
 * focus is in a text-editable field unless the shortcut is meant to always
 * work (Escape).
 */
export function useShortcuts(h: ShortcutHandlers) {
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement | null;
            const inField = !!target && (
                target.tagName === 'INPUT' ||
                target.tagName === 'TEXTAREA' ||
                target.tagName === 'SELECT' ||
                target.isContentEditable
            );
            const mod = e.ctrlKey || e.metaKey;
            const key = e.key.toLowerCase();

            // Escape always works (used to close panels / deselect)
            if (key === 'escape') {
                h.onEscape?.();
                return;
            }

            if (inField) return;

            if (mod && key === 's') {
                e.preventDefault();
                h.onSave?.();
                return;
            }
            if (mod && key === 'o') {
                e.preventDefault();
                h.onOpen?.();
                return;
            }
            if (mod && (key === 'enter' || key === 'e')) {
                e.preventDefault();
                h.onRunToggle?.();
                return;
            }
            if (mod && key === 'd') {
                e.preventDefault();
                h.onDuplicate?.();
                return;
            }
            if (mod && key === 'c') {
                e.preventDefault();
                h.onCopy?.();
                return;
            }
            if (mod && key === 'v') {
                e.preventDefault();
                h.onPaste?.();
                return;
            }
            if (mod && key === 'x') {
                e.preventDefault();
                h.onCut?.();
                return;
            }
            if (mod && (key === '\\' || (key === 'k' && e.shiftKey))) {
                e.preventDefault();
                h.onClear?.();
                return;
            }
            if (mod && key === '1') {
                e.preventDefault();
                h.onViewFlowchart?.();
                return;
            }
            if (mod && key === '2') {
                e.preventDefault();
                h.onViewPseudocode?.();
                return;
            }
            if (e.shiftKey && key === '?') {
                e.preventDefault();
                h.onHelp?.();
                return;
            }
        };

        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [h]);
}
