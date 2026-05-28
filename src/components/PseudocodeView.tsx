import React, { useMemo, useState, useRef, useEffect } from 'react';
import { type Node, type Edge } from 'reactflow';
import { Trash2, Pencil, Plus, X, Copy, Check, Download, ChevronDown } from 'lucide-react';
import { useTranslation } from '../i18n/i18nContext';
import { structureFlow, type PseudoLine } from '../utils/pseudocode';
import { defaultDataForType } from '../types/flow';
import { PropertiesPanelInline } from './PropertiesPanel';
import { generateCode, LANG_LABELS, TARGET_LANGS, type TargetLang } from '../utils/codegen';

interface PseudocodeViewProps {
    nodes: Node[];
    edges: Edge[];
    setNodes: (updater: any) => void;
    setEdges: (updater: any) => void;
    theme: 'light' | 'dark';
    onDownload?: (langs: TargetLang[], format: 'txt' | 'pdf') => void;
}

let pseudoId = 0;
const newId = () => `pseudo_${Date.now()}_${pseudoId++}`;

export const PseudocodeView: React.FC<PseudocodeViewProps> = ({ nodes, edges, setNodes, setEdges, onDownload }) => {
    const { t, language } = useTranslation();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [insertingAfter, setInsertingAfter] = useState<string | null>(null);
    const [currentLang, setCurrentLang] = useState<TargetLang>('python');

    const lines = useMemo(() => structureFlow(nodes, edges), [nodes, edges]);

    const generatedCode = useMemo(
        () => generateCode(nodes, edges, currentLang),
        [nodes, edges, currentLang],
    );

    const handleDelete = (nodeId: string) => {
        const incoming = edges.filter(e => e.target === nodeId);
        const outgoing = edges.filter(e => e.source === nodeId);
        const simpleOut = outgoing.find(e => !e.sourceHandle);
        const reconnectTarget = simpleOut?.target;

        setEdges((eds: Edge[]) => {
            let next = eds.filter(e => e.source !== nodeId && e.target !== nodeId);
            if (reconnectTarget) {
                incoming.forEach(inE => {
                    const exists = next.some(e =>
                        e.source === inE.source && e.target === reconnectTarget && e.sourceHandle === inE.sourceHandle
                    );
                    if (!exists) {
                        next = [...next, {
                            ...inE,
                            id: `${inE.id}-rejoin`,
                            target: reconnectTarget,
                        }];
                    }
                });
            }
            return next;
        });
        setNodes((nds: Node[]) => nds.filter(n => n.id !== nodeId));
    };

    const handleInsert = (afterNodeId: string, blockType: string) => {
        const id = newId();
        const refNode = nodes.find(n => n.id === afterNodeId);
        const basePos = refNode?.position || { x: 200, y: 200 };
        const newNode: Node = {
            id,
            type: blockType,
            position: { x: basePos.x, y: basePos.y + 130 },
            data: defaultDataForType(blockType),
        };

        const oldEdges = edges.filter(e => e.source === afterNodeId && !e.sourceHandle);
        setNodes((nds: Node[]) => [...nds, newNode]);
        setEdges((eds: Edge[]) => {
            const filtered = eds.filter(e => !oldEdges.includes(e));
            const newEdges: Edge[] = [
                {
                    id: `e-${afterNodeId}-${id}`,
                    source: afterNodeId,
                    target: id,
                    type: 'waypoint',
                    data: { waypoints: [] },
                    animated: true,
                },
                ...oldEdges.map(o => ({
                    ...o,
                    id: `e-${id}-${o.target}`,
                    source: id,
                    sourceHandle: undefined,
                })),
            ];
            return [...filtered, ...newEdges];
        });
        setInsertingAfter(null);
        setEditingId(id);
    };

    const handleUpdate = (id: string, data: any) => {
        setNodes((nds: Node[]) => nds.map(n => n.id === id ? { ...n, data: { ...n.data, ...data } } : n));
    };

    const allNodes = nodes;

    const startNode = nodes.find(n => n.type === 'start');
    const startId = startNode?.id;

    return (
        <div style={{
            width: '100%',
            height: '100%',
            overflow: 'auto',
            padding: '24px',
            background: 'var(--theme-bg-subtle)',
            fontFamily: 'Menlo, Monaco, "Fira Code", monospace',
            fontSize: '0.95rem',
            color: 'var(--text-color)',
        }}>
            <div style={{
                maxWidth: '900px',
                margin: '0 auto 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                flexWrap: 'wrap',
            }}>
                <span style={{ fontFamily: 'system-ui, sans-serif', fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-color)' }}>
                    {t('viewMode.pseudocode')}
                </span>
                {onDownload && (
                    <DownloadBar currentLang={currentLang} onDownload={onDownload} language={language} />
                )}
            </div>
            <div style={{
                maxWidth: '900px',
                margin: '0 auto',
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
                borderRadius: '12px',
                padding: '20px 24px',
                counterReset: 'pseudoline',
            }}>
                <Line
                    text="PROGRAM"
                    nodeId={null}
                    indent={0}
                    decoration="keyword"
                />
                <Line
                    text="BEGIN"
                    nodeId={null}
                    indent={0}
                    decoration="keyword"
                    insertable
                    onInsertClick={() => setInsertingAfter(startId || null)}
                />
                {insertingAfter === startId && (
                    <InsertMenu
                        indent={1}
                        onPick={(t) => handleInsert(startId!, t)}
                        onClose={() => setInsertingAfter(null)}
                    />
                )}
                <RenderLines
                    lines={lines}
                    indent={1}
                    onDelete={handleDelete}
                    onEdit={(id) => setEditingId(id)}
                    onInsertAfter={(id) => setInsertingAfter(id)}
                    insertingAfter={insertingAfter}
                    onPickInsert={(afterId, type) => handleInsert(afterId, type)}
                    onCloseInsert={() => setInsertingAfter(null)}
                    editingId={editingId}
                    allNodes={allNodes}
                    onUpdate={handleUpdate}
                    onCloseEdit={() => setEditingId(null)}
                    nodes={nodes}
                />
                {lines.length === 0 && (
                    <div style={{ padding: '20px', fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                        {t('pseudocode.emptyHint')}
                    </div>
                )}
                <Line
                    text="END."
                    nodeId={null}
                    indent={0}
                    decoration="keyword"
                />
            </div>

            <CodeTranslationPanel
                lang={currentLang}
                onChangeLang={setCurrentLang}
                code={generatedCode}
                language={language}
            />
        </div>
    );
};

interface DownloadBarProps {
    currentLang: TargetLang;
    onDownload: (langs: TargetLang[], format: 'txt' | 'pdf') => void;
    language: 'it' | 'en';
}

const DownloadBar: React.FC<DownloadBarProps> = ({ currentLang, onDownload, language }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const onDoc = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as HTMLElement)) setOpen(false);
        };
        document.addEventListener('mousedown', onDoc);
        return () => document.removeEventListener('mousedown', onDoc);
    }, [open]);

    const rows: { label: string; langs: TargetLang[] }[] = [
        { label: language === 'it' ? 'Solo pseudocodice' : 'Pseudocode only', langs: [] },
        { label: `${language === 'it' ? 'Pseudocodice' : 'Pseudocode'} + ${LANG_LABELS[currentLang]}`, langs: [currentLang] },
        { label: language === 'it' ? 'Pseudocodice + tutti i linguaggi' : 'Pseudocode + all languages', langs: [...TARGET_LANGS] },
    ];

    const pick = (langs: TargetLang[], format: 'txt' | 'pdf') => {
        onDownload(langs, format);
        setOpen(false);
    };

    return (
        <div ref={ref} style={{ position: 'relative', fontFamily: 'system-ui, sans-serif' }}>
            <button
                onClick={() => setOpen(o => !o)}
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--glass-border)',
                    background: open ? 'var(--primary-color)' : 'var(--glass-bg)',
                    color: open ? 'white' : 'var(--text-color)',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                }}
            >
                <Download size={15} />
                {language === 'it' ? 'Scarica' : 'Download'}
                <ChevronDown size={13} style={{ opacity: 0.7 }} />
            </button>
            {open && (
                <div style={{
                    position: 'absolute',
                    right: 0,
                    top: 'calc(100% + 8px)',
                    minWidth: '300px',
                    background: 'var(--theme-card-bg)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '12px',
                    boxShadow: '0 12px 32px rgba(0,0,0,0.35)',
                    padding: '6px',
                    zIndex: 50,
                }}>
                    {rows.map((r, i) => (
                        <div key={i} style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '12px',
                            padding: '8px 10px',
                            borderRadius: '8px',
                        }}>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-color)' }}>{r.label}</span>
                            <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                                <FormatBtn onClick={() => pick(r.langs, 'txt')}>TXT</FormatBtn>
                                <FormatBtn onClick={() => pick(r.langs, 'pdf')}>PDF</FormatBtn>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const FormatBtn: React.FC<{ onClick: () => void; children: React.ReactNode }> = ({ onClick, children }) => (
    <button
        onClick={onClick}
        style={{
            padding: '5px 12px',
            borderRadius: '6px',
            border: '1px solid var(--primary-color)',
            background: 'transparent',
            color: 'var(--primary-color)',
            fontWeight: 700,
            fontSize: '0.75rem',
            cursor: 'pointer',
            fontFamily: 'system-ui, sans-serif',
        }}
    >{children}</button>
);

interface CodeTranslationPanelProps {
    lang: TargetLang;
    onChangeLang: (l: TargetLang) => void;
    code: string;
    language: 'it' | 'en';
}

const CodeTranslationPanel: React.FC<CodeTranslationPanelProps> = ({ lang, onChangeLang, code, language }) => {
    const [copied, setCopied] = useState(false);
    const langs = TARGET_LANGS;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch { /* ignore */ }
    };

    return (
        <div style={{
            maxWidth: '900px',
            margin: '20px auto 0',
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            borderRadius: '12px',
            overflow: 'hidden',
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                rowGap: '8px',
                flexWrap: 'wrap',
                padding: '10px 16px',
                borderBottom: '1px solid var(--glass-border)',
                background: 'rgba(0,0,0,0.15)',
            }}>
                <span style={{
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: 'var(--text-secondary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    fontFamily: 'system-ui, sans-serif',
                    marginRight: '4px',
                }}>
                    {language === 'it' ? 'Codice equivalente' : 'Equivalent code'}
                </span>
                <div style={{ display: 'flex', gap: '4px', padding: '2px', borderRadius: '100px', background: 'rgba(0,0,0,0.25)' }}>
                    {langs.map(l => (
                        <button
                            key={l}
                            onClick={() => onChangeLang(l)}
                            style={{
                                border: 'none',
                                padding: '4px 12px',
                                borderRadius: '100px',
                                background: lang === l ? 'var(--primary-color)' : 'transparent',
                                color: lang === l ? 'white' : 'var(--text-secondary)',
                                fontSize: '0.78rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                fontFamily: 'system-ui, sans-serif',
                                transition: 'all 0.15s',
                            }}
                        >{LANG_LABELS[l]}</button>
                    ))}
                </div>
                <button
                    onClick={handleCopy}
                    title={language === 'it' ? 'Copia codice' : 'Copy code'}
                    style={{
                        marginLeft: 'auto',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '5px 10px',
                        background: copied ? 'rgba(16, 185, 129, 0.18)' : 'transparent',
                        color: copied ? '#10b981' : 'var(--text-secondary)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        fontFamily: 'system-ui, sans-serif',
                        transition: 'all 0.15s',
                    }}
                >
                    {copied ? <Check size={13} /> : <Copy size={13} />}
                    {copied ? (language === 'it' ? 'Copiato' : 'Copied') : (language === 'it' ? 'Copia' : 'Copy')}
                </button>
            </div>
            <pre style={{
                margin: 0,
                padding: '16px 20px',
                fontFamily: 'Menlo, Monaco, "Fira Code", monospace',
                fontSize: '0.85rem',
                lineHeight: 1.55,
                color: 'var(--text-color)',
                whiteSpace: 'pre',
                overflowX: 'auto',
            }}>
                <code style={{ fontFamily: 'inherit' }}>{highlightCode(code, lang)}</code>
            </pre>
        </div>
    );
};

// Lightweight keyword highlighter — no external dep, just span coloring.
const KEYWORDS: Record<TargetLang, string[]> = {
    python: ['if', 'else', 'elif', 'while', 'for', 'def', 'return', 'True', 'False', 'None', 'in', 'and', 'or', 'not', 'break', 'continue', 'import', 'from', 'as', 'pass', 'print', 'input', 'int', 'float', 'str', 'bool'],
    java: ['public', 'private', 'class', 'static', 'void', 'main', 'String', 'int', 'double', 'float', 'boolean', 'true', 'false', 'if', 'else', 'while', 'do', 'for', 'return', 'new', 'import', 'package'],
    c: ['int', 'double', 'float', 'char', 'bool', 'void', 'if', 'else', 'while', 'do', 'for', 'return', 'true', 'false', '#include'],
    cpp: ['int', 'double', 'float', 'char', 'bool', 'void', 'if', 'else', 'while', 'do', 'for', 'return', 'true', 'false', 'std', '#include', 'using', 'namespace', 'class', 'public', 'private'],
    javascript: ['let', 'const', 'var', 'function', 'if', 'else', 'while', 'do', 'for', 'return', 'true', 'false', 'null', 'undefined', 'break', 'continue', 'console', 'prompt', 'parseInt', 'parseFloat', 'String', 'includes'],
    csharp: ['using', 'System', 'class', 'static', 'void', 'Main', 'Console', 'string', 'int', 'double', 'float', 'bool', 'var', 'if', 'else', 'while', 'do', 'for', 'return', 'true', 'false', 'new'],
    php: ['echo', 'if', 'else', 'elseif', 'while', 'do', 'for', 'foreach', 'function', 'return', 'true', 'false', 'null', 'and', 'or', 'not', 'trim', 'fgets', 'in_array', 'strtolower', 'STDIN', 'PHP_EOL'],
};

function highlightLine(line: string, keywords: Set<string>, commentMark: string): React.ReactNode {
    const trimmed = line.trimStart();
    // full-line comment
    if (trimmed.startsWith(commentMark)) {
        return <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>{line}</span>;
    }
    // preprocessor include for C/C++, or PHP open/close tags
    if (trimmed.startsWith('#') || trimmed.startsWith('<?') || trimmed === '?>') {
        return <span style={{ color: '#f472b6' }}>{line}</span>;
    }
    // tokenize: word | quoted | other
    const tokens = line.match(/("(?:[^"\\]|\\.)*"|'[^']*'|[A-Za-z_][\w]*|[^A-Za-z_"']+)/g) || [line];
    return tokens.map((tok, j) => {
        if (tok.startsWith('"') || tok.startsWith("'")) {
            return <span key={j} style={{ color: '#fb923c' }}>{tok}</span>;
        }
        if (keywords.has(tok)) {
            return <span key={j} style={{ color: '#a78bfa', fontWeight: 600 }}>{tok}</span>;
        }
        if (/^\d+(\.\d+)?$/.test(tok)) {
            return <span key={j} style={{ color: '#34d399' }}>{tok}</span>;
        }
        return <span key={j}>{tok}</span>;
    });
}

function highlightCode(code: string, lang: TargetLang): React.ReactNode {
    const keywords = new Set(KEYWORDS[lang]);
    const commentMark = lang === 'python' ? '#' : '//';
    return code.split('\n').map((line, i) => (
        <div key={i} style={{ display: 'flex' }}>
            <span className="code-gutter">{i + 1}</span>
            <span style={{ flex: 1, whiteSpace: 'pre' }}>{highlightLine(line, keywords, commentMark)}</span>
        </div>
    ));
}

interface LineProps {
    text: string;
    nodeId: string | null;
    indent: number;
    decoration?: 'keyword' | 'normal' | 'comment' | 'goto';
    onEdit?: () => void;
    onDelete?: () => void;
    insertable?: boolean;
    onInsertClick?: () => void;
}

const Line: React.FC<LineProps> = ({ text, indent, decoration = 'normal', onEdit, onDelete, insertable, onInsertClick }) => {
    const [hover, setHover] = useState(false);
    const color =
        decoration === 'keyword' ? 'var(--primary-color)' :
            decoration === 'comment' ? '#fbbf24' :
                decoration === 'goto' ? '#ef4444' :
                    'var(--text-color)';

    const fontWeight = decoration === 'keyword' ? 700 : 500;
    const editable = !!onEdit;

    return (
        <div
            className="pseudo-line"
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={{
                padding: '4px 10px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: hover && editable ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                cursor: editable ? 'pointer' : 'default',
                transition: 'background 0.12s',
                minHeight: '32px',
            }}
            onClick={editable ? onEdit : undefined}
        >
            <span className="pseudo-gutter" aria-hidden="true" />
            <span style={{ color, fontWeight, flex: 1, whiteSpace: 'pre-wrap', paddingLeft: `${indent * 24}px` }}>{text}</span>
            {hover && editable && (
                <>
                    <button
                        onClick={(e) => { e.stopPropagation(); onEdit?.(); }}
                        title="Modifica"
                        style={iconBtnStyle('#6366f1')}
                    ><Pencil size={14} /></button>
                    {onDelete && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete(); }}
                            title="Elimina"
                            style={iconBtnStyle('#ef4444')}
                        ><Trash2 size={14} /></button>
                    )}
                </>
            )}
            {(hover || insertable) && onInsertClick && (
                <button
                    onClick={(e) => { e.stopPropagation(); onInsertClick(); }}
                    title="Aggiungi sotto"
                    style={iconBtnStyle('#10b981')}
                ><Plus size={14} /></button>
            )}
        </div>
    );
};

function iconBtnStyle(color: string): React.CSSProperties {
    return {
        background: 'transparent',
        border: `1px solid ${color}`,
        color,
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0,
    };
}

interface RenderLinesProps {
    lines: PseudoLine[];
    indent: number;
    onDelete: (id: string) => void;
    onEdit: (id: string) => void;
    onInsertAfter: (id: string) => void;
    insertingAfter: string | null;
    onPickInsert: (afterId: string, type: string) => void;
    onCloseInsert: () => void;
    editingId: string | null;
    allNodes: Node[];
    onUpdate: (id: string, data: any) => void;
    onCloseEdit: () => void;
    nodes: Node[];
}

const RenderLines: React.FC<RenderLinesProps> = (props) => {
    const { lines, indent, onDelete, onEdit, onInsertAfter, insertingAfter, onPickInsert, onCloseInsert, editingId, allNodes, onUpdate, onCloseEdit, nodes } = props;

    return (
        <>
            {lines.map((line, i) => {
                if (line.kind === 'simple') {
                    return (
                        <React.Fragment key={`${line.nodeId}-${i}`}>
                            <Line
                                text={line.text}
                                nodeId={line.nodeId}
                                indent={indent}
                                decoration={line.text.startsWith('//') ? 'comment' : line.nodeType === 'end' ? 'keyword' : 'normal'}
                                onEdit={line.nodeType === 'end' ? undefined : () => onEdit(line.nodeId)}
                                onDelete={line.nodeType === 'end' ? undefined : () => onDelete(line.nodeId)}
                                onInsertClick={() => onInsertAfter(line.nodeId)}
                            />
                            {editingId === line.nodeId && (
                                <InlineEditor
                                    nodeId={line.nodeId}
                                    allNodes={allNodes}
                                    onClose={onCloseEdit}
                                    onUpdate={onUpdate}
                                    nodes={nodes}
                                    indent={indent}
                                />
                            )}
                            {insertingAfter === line.nodeId && (
                                <InsertMenu indent={indent + 1} onPick={(t) => onPickInsert(line.nodeId, t)} onClose={onCloseInsert} />
                            )}
                        </React.Fragment>
                    );
                }
                if (line.kind === 'if') {
                    return (
                        <React.Fragment key={`${line.nodeId}-${i}`}>
                            <Line
                                text={`IF ${line.condition} THEN`}
                                nodeId={line.nodeId}
                                indent={indent}
                                decoration="keyword"
                                onEdit={() => onEdit(line.nodeId)}
                                onDelete={() => onDelete(line.nodeId)}
                            />
                            {editingId === line.nodeId && (
                                <InlineEditor
                                    nodeId={line.nodeId}
                                    allNodes={allNodes}
                                    onClose={onCloseEdit}
                                    onUpdate={onUpdate}
                                    nodes={nodes}
                                    indent={indent}
                                />
                            )}
                            <RenderLines {...props} lines={line.then} indent={indent + 1} />
                            {line.else.length > 0 && (
                                <>
                                    <Line text="ELSE" nodeId={null} indent={indent} decoration="keyword" />
                                    <RenderLines {...props} lines={line.else} indent={indent + 1} />
                                </>
                            )}
                            <Line text="END IF" nodeId={null} indent={indent} decoration="keyword" />
                        </React.Fragment>
                    );
                }
                if (line.kind === 'while') {
                    return (
                        <React.Fragment key={`${line.nodeId}-${i}`}>
                            <Line
                                text={`WHILE ${line.condition} DO`}
                                nodeId={line.nodeId}
                                indent={indent}
                                decoration="keyword"
                                onEdit={() => onEdit(line.nodeId)}
                                onDelete={() => onDelete(line.nodeId)}
                            />
                            {editingId === line.nodeId && (
                                <InlineEditor
                                    nodeId={line.nodeId}
                                    allNodes={allNodes}
                                    onClose={onCloseEdit}
                                    onUpdate={onUpdate}
                                    nodes={nodes}
                                    indent={indent}
                                />
                            )}
                            <RenderLines {...props} lines={line.body} indent={indent + 1} />
                            <Line text="END WHILE" nodeId={null} indent={indent} decoration="keyword" />
                        </React.Fragment>
                    );
                }
                if (line.kind === 'until') {
                    return (
                        <React.Fragment key={`${line.nodeId}-${i}`}>
                            <Line text="REPEAT" nodeId={null} indent={indent} decoration="keyword" />
                            <RenderLines {...props} lines={line.body} indent={indent + 1} />
                            <Line
                                text={`UNTIL ${line.condition}`}
                                nodeId={line.nodeId}
                                indent={indent}
                                decoration="keyword"
                                onEdit={() => onEdit(line.nodeId)}
                                onDelete={() => onDelete(line.nodeId)}
                            />
                            {editingId === line.nodeId && (
                                <InlineEditor
                                    nodeId={line.nodeId}
                                    allNodes={allNodes}
                                    onClose={onCloseEdit}
                                    onUpdate={onUpdate}
                                    nodes={nodes}
                                    indent={indent}
                                />
                            )}
                        </React.Fragment>
                    );
                }
                if (line.kind === 'goto') {
                    return (
                        <Line
                            key={`goto-${i}`}
                            text={`GOTO ${line.targetNodeId}`}
                            nodeId={null}
                            indent={indent}
                            decoration="goto"
                        />
                    );
                }
                return null;
            })}
        </>
    );
};

interface InsertMenuProps {
    indent: number;
    onPick: (type: string) => void;
    onClose: () => void;
}

const InsertMenu: React.FC<InsertMenuProps> = ({ indent, onPick, onClose }) => {
    const items: { type: string; label: string; color: string }[] = [
        { type: 'declare', label: 'DECLARE', color: '#0ea5e9' },
        { type: 'process', label: ':= (Azione)', color: '#3b82f6' },
        { type: 'input', label: 'READ', color: '#8b5cf6' },
        { type: 'output', label: 'WRITE', color: '#8b5cf6' },
        { type: 'decision', label: 'IF / WHILE', color: '#f59e0b' },
        { type: 'end', label: 'END', color: '#ef4444' },
    ];
    return (
        <div style={{
            marginLeft: `${10 + indent * 24}px`,
            padding: '8px',
            background: 'var(--theme-card-bg)',
            border: '1px dashed var(--primary-color)',
            borderRadius: '8px',
            display: 'flex',
            gap: '6px',
            flexWrap: 'wrap',
            marginBottom: '4px',
            marginTop: '4px',
        }}>
            {items.map(it => (
                <button
                    key={it.type}
                    onClick={() => onPick(it.type)}
                    style={{
                        padding: '6px 10px',
                        borderRadius: '6px',
                        border: `1px solid ${it.color}`,
                        background: 'transparent',
                        color: it.color,
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: '0.8rem',
                        fontFamily: 'inherit',
                    }}
                >{it.label}</button>
            ))}
            <button
                onClick={onClose}
                style={{
                    padding: '6px',
                    borderRadius: '6px',
                    border: '1px solid var(--glass-border)',
                    background: 'transparent',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                }}
            ><X size={14} /></button>
        </div>
    );
};

interface InlineEditorProps {
    nodeId: string;
    allNodes: Node[];
    onClose: () => void;
    onUpdate: (id: string, data: any) => void;
    nodes: Node[];
    indent: number;
}

const InlineEditor: React.FC<InlineEditorProps> = ({ nodeId, allNodes, onUpdate, onClose, indent }) => {
    const node = allNodes.find(n => n.id === nodeId);
    if (!node) return null;

    return (
        <div style={{
            marginLeft: `${10 + indent * 24}px`,
            padding: '12px',
            margin: '4px 0 8px',
            background: 'var(--theme-card-bg)',
            border: '1px solid var(--primary-color)',
            borderRadius: '8px',
            fontFamily: 'system-ui, sans-serif',
            fontSize: '0.9rem',
        }}>
            <PropertiesPanelInline
                selectedNode={node}
                allNodes={allNodes}
                onUpdateNode={(id, data) => {
                    onUpdate(id, data);
                    onClose();
                }}
                onClose={onClose}
            />
        </div>
    );
};
