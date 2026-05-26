import React from 'react';
import { X, Keyboard } from 'lucide-react';
import { useTranslation } from '../i18n/i18nContext';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

interface Row { keys: string[]; label: { it: string; en: string } }

const ROWS: Row[] = [
    { keys: ['⌘', 'Z'], label: { it: 'Annulla', en: 'Undo' } },
    { keys: ['⌘', '⇧', 'Z'], label: { it: 'Ripeti', en: 'Redo' } },
    { keys: ['⌘', 'S'], label: { it: 'Salva progetto (JSON)', en: 'Save project (JSON)' } },
    { keys: ['⌘', 'O'], label: { it: 'Apri progetto (JSON)', en: 'Open project (JSON)' } },
    { keys: ['⌘', 'E'], label: { it: 'Esegui / Ferma flusso', en: 'Run / Stop flow' } },
    { keys: ['⌘', 'D'], label: { it: 'Duplica blocco selezionato', en: 'Duplicate selected block' } },
    { keys: ['⌘', 'C'], label: { it: 'Copia selezione', en: 'Copy selection' } },
    { keys: ['⌘', 'X'], label: { it: 'Taglia selezione', en: 'Cut selection' } },
    { keys: ['⌘', 'V'], label: { it: 'Incolla', en: 'Paste' } },
    { keys: ['⌫'], label: { it: 'Elimina selezione', en: 'Delete selection' } },
    { keys: ['⌘', '1'], label: { it: 'Vista diagramma', en: 'Flowchart view' } },
    { keys: ['⌘', '2'], label: { it: 'Vista pseudocodice', en: 'Pseudocode view' } },
    { keys: ['⌘', '⇧', 'K'], label: { it: 'Svuota canvas', en: 'Clear canvas' } },
    { keys: ['Esc'], label: { it: 'Deseleziona / chiudi pannello', en: 'Deselect / close panel' } },
    { keys: ['⇧', '?'], label: { it: 'Mostra questi shortcut', en: 'Show this dialog' } },
];

export const ShortcutsHelp: React.FC<Props> = ({ isOpen, onClose }) => {
    const { language } = useTranslation();
    if (!isOpen) return null;
    return (
        <div
            onClick={onClose}
            style={{
                position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 2000, animation: 'fadeIn 0.15s ease-out',
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    width: '420px', maxWidth: 'calc(100vw - 40px)',
                    background: 'var(--bg-color)', border: '1px solid var(--glass-border)',
                    borderRadius: '14px', padding: '20px',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                    <Keyboard size={18} color="var(--primary-color)" />
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, flex: 1 }}>
                        {language === 'it' ? 'Scorciatoie da tastiera' : 'Keyboard shortcuts'}
                    </h3>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                        <X size={18} />
                    </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {ROWS.map((row, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0' }}>
                            <span style={{ fontSize: '0.9rem' }}>{language === 'it' ? row.label.it : row.label.en}</span>
                            <span style={{ display: 'flex', gap: '4px' }}>
                                {row.keys.map((k, j) => (
                                    <kbd key={j} style={{
                                        padding: '2px 7px',
                                        background: 'rgba(99, 102, 241, 0.18)',
                                        border: '1px solid var(--glass-border)',
                                        borderRadius: '6px',
                                        fontSize: '0.78rem',
                                        fontFamily: 'Menlo, Monaco, monospace',
                                        color: 'var(--primary-color)',
                                        minWidth: '20px',
                                        textAlign: 'center',
                                    }}>{k}</kbd>
                                ))}
                            </span>
                        </div>
                    ))}
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '14px', marginBottom: 0 }}>
                    {language === 'it'
                        ? 'Su Windows/Linux usa Ctrl al posto di ⌘.'
                        : 'On Windows/Linux, use Ctrl instead of ⌘.'}
                </p>
            </div>
        </div>
    );
};
