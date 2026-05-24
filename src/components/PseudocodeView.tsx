import React, { useMemo, useState } from 'react';
import { type Node, type Edge } from 'reactflow';
import { Trash2, Pencil, Plus, X } from 'lucide-react';
import { useTranslation } from '../i18n/i18nContext';
import { structureFlow, type PseudoLine } from '../utils/pseudocode';
import { defaultDataForType } from '../types/flow';
import { PropertiesPanelInline } from './PropertiesPanel';

interface PseudocodeViewProps {
    nodes: Node[];
    edges: Edge[];
    setNodes: (updater: any) => void;
    setEdges: (updater: any) => void;
    theme: 'light' | 'dark';
}

let pseudoId = 0;
const newId = () => `pseudo_${Date.now()}_${pseudoId++}`;

export const PseudocodeView: React.FC<PseudocodeViewProps> = ({ nodes, edges, setNodes, setEdges }) => {
    const { t } = useTranslation();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [insertingAfter, setInsertingAfter] = useState<string | null>(null);

    const lines = useMemo(() => structureFlow(nodes, edges), [nodes, edges]);

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
                margin: '0 auto',
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
                borderRadius: '12px',
                padding: '20px 24px',
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
        </div>
    );
};

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
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={{
                padding: '4px 10px',
                paddingLeft: `${10 + indent * 24}px`,
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
            <span style={{ color, fontWeight, flex: 1, whiteSpace: 'pre-wrap' }}>{text}</span>
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
