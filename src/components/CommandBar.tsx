import { useEffect, useRef, useState } from 'react';
import {
    Play, Square, Trash2, Workflow, FileCode,
    Undo2, Redo2, Download, ChevronDown, Upload, Keyboard,
} from 'lucide-react';
import { useTranslation } from '../i18n/i18nContext';

interface CommandBarProps {
    isExecuting: boolean;
    onRun: () => void;
    onClear?: () => void;
    onUndo?: () => void;
    onRedo?: () => void;
    canUndo?: boolean;
    canRedo?: boolean;
    viewMode: 'flowchart' | 'pseudocode';
    onChangeViewMode: (m: 'flowchart' | 'pseudocode') => void;
    onDownloadPDF?: () => void;
    onDownloadPNG?: () => void;
    onDownloadJPEG?: () => void;
    onDownloadJSON?: () => void;
    onImportJSON?: (file: File) => void;
    onShowShortcuts?: () => void;
}

export const CommandBar: React.FC<CommandBarProps> = ({
    isExecuting,
    onRun,
    onClear,
    onUndo,
    onRedo,
    canUndo,
    canRedo,
    viewMode,
    onChangeViewMode,
    onDownloadPDF,
    onDownloadPNG,
    onDownloadJPEG,
    onDownloadJSON,
    onImportJSON,
    onShowShortcuts,
}) => {
    const { t, language } = useTranslation();
    const [downloadOpen, setDownloadOpen] = useState(false);
    const downloadRef = useRef<HTMLDivElement>(null);
    const importInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const onDoc = (e: MouseEvent) => {
            if (downloadRef.current && !downloadRef.current.contains(e.target as Node)) {
                setDownloadOpen(false);
            }
        };
        document.addEventListener('mousedown', onDoc);
        return () => document.removeEventListener('mousedown', onDoc);
    }, []);

    return (
        <div className="floating-command-bar" role="toolbar" aria-label="Editor commands">
            <div className={`mini-status-led ${isExecuting ? 'active' : ''}`} />

            <div className="view-mode-toggle compact">
                <button
                    type="button"
                    className={`mini-btn ${viewMode === 'flowchart' ? 'active' : ''}`}
                    onClick={() => onChangeViewMode('flowchart')}
                    title={t('viewMode.flowchart')}
                >
                    <Workflow size={14} />
                </button>
                <button
                    type="button"
                    className={`mini-btn ${viewMode === 'pseudocode' ? 'active' : ''}`}
                    onClick={() => onChangeViewMode('pseudocode')}
                    title={t('viewMode.pseudocode')}
                >
                    <FileCode size={14} />
                </button>
            </div>

            <div className="mini-divider" />

            <button
                type="button"
                className="mini-btn"
                onClick={onUndo}
                disabled={!canUndo}
                title={`${language === 'it' ? 'Annulla' : 'Undo'} (⌘Z)`}
            >
                <Undo2 size={14} />
            </button>
            <button
                type="button"
                className="mini-btn"
                onClick={onRedo}
                disabled={!canRedo}
                title={`${language === 'it' ? 'Ripeti' : 'Redo'} (⌘⇧Z)`}
            >
                <Redo2 size={14} />
            </button>

            <div className="mini-divider" />

            <div ref={downloadRef} className="download-wrapper">
                <button
                    type="button"
                    className={`mini-btn ${downloadOpen ? 'active' : ''}`}
                    onClick={() => setDownloadOpen(o => !o)}
                    disabled={isExecuting}
                    title={language === 'it' ? 'Esporta / Importa' : 'Export / Import'}
                >
                    <Download size={14} />
                    <ChevronDown size={10} style={{ marginLeft: 2, opacity: 0.6 }} />
                </button>
                {downloadOpen && (
                    <div className="download-dropdown" style={{ top: 'auto', bottom: 'calc(100% + 10px)' }}>
                        <button className="dropdown-item" onClick={() => { onDownloadPDF?.(); setDownloadOpen(false); }}>
                            <div className="item-icon pdf">PDF</div>
                            <div className="item-info"><span className="item-label">Documento PDF</span><span className="item-desc">{language === 'it' ? 'Migliore per la stampa' : 'Best for printing'}</span></div>
                        </button>
                        <button className="dropdown-item" onClick={() => { onDownloadPNG?.(); setDownloadOpen(false); }}>
                            <div className="item-icon png">PNG</div>
                            <div className="item-info"><span className="item-label">Immagine PNG</span><span className="item-desc">{language === 'it' ? 'Sfondo trasparente' : 'Transparent background'}</span></div>
                        </button>
                        <button className="dropdown-item" onClick={() => { onDownloadJPEG?.(); setDownloadOpen(false); }}>
                            <div className="item-icon jpeg">JPEG</div>
                            <div className="item-info"><span className="item-label">Immagine JPEG</span><span className="item-desc">{language === 'it' ? 'File leggero/compatto' : 'Smaller file size'}</span></div>
                        </button>
                        <div style={{ height: '1px', background: 'var(--glass-border)', margin: '6px 0' }} />
                        <button className="dropdown-item" onClick={() => { onDownloadJSON?.(); setDownloadOpen(false); }}>
                            <div className="item-icon json">{'{ }'}</div>
                            <div className="item-info"><span className="item-label">{language === 'it' ? 'Salva progetto (JSON)' : 'Save project (JSON)'}</span><span className="item-desc">{language === 'it' ? 'Per riprenderlo in seguito' : 'Reload later to keep editing'}</span></div>
                        </button>
                        <button className="dropdown-item" onClick={() => { importInputRef.current?.click(); setDownloadOpen(false); }}>
                            <div className="item-icon json-import"><Upload size={14} /></div>
                            <div className="item-info"><span className="item-label">{language === 'it' ? 'Carica progetto (JSON)' : 'Load project (JSON)'}</span><span className="item-desc">{language === 'it' ? 'Importa un flowchart salvato' : 'Import a saved flowchart'}</span></div>
                        </button>
                    </div>
                )}
                <input
                    ref={importInputRef}
                    type="file"
                    accept="application/json,.json"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) onImportJSON?.(f);
                        e.target.value = '';
                    }}
                />
            </div>

            <div className="mini-divider" />

            <button
                type="button"
                className={`mini-btn run ${isExecuting ? 'executing' : ''}`}
                onClick={onRun}
                title={isExecuting ? t('header.stopFlowTitle') : t('header.runFlowTitle')}
            >
                {isExecuting ? <Square size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
            </button>

            <div className="mini-divider" />

            <button
                type="button"
                className="mini-btn danger"
                onClick={onClear}
                disabled={isExecuting}
                title={language === 'it' ? 'Svuota canvas' : 'Clear canvas'}
            >
                <Trash2 size={14} />
            </button>

            <div className="mini-divider" />

            <button
                type="button"
                className="mini-btn"
                onClick={onShowShortcuts}
                title={language === 'it' ? 'Scorciatoie da tastiera (⇧?)' : 'Keyboard shortcuts (⇧?)'}
            >
                <Keyboard size={14} />
            </button>
        </div>
    );
};
