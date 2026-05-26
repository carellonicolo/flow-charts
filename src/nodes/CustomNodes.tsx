import React, { useEffect } from 'react';
import { Handle, NodeResizer, Position, useUpdateNodeInternals, type NodeProps } from 'reactflow';
import { Play, Square, ArrowRight, Save, LogOut, Diamond, MessageSquare, Variable } from 'lucide-react';
import { useTranslation } from '../i18n/i18nContext';
import { VAR_TYPE_LABELS, previewOutput, type OutputPart, type VarType, type DecisionHandlePos } from '../types/flow';

const handleStyle = { width: 10, height: 10, background: '#fff', border: '2px solid #333' };

const resizerHandleStyle: React.CSSProperties = {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: '#fff',
    border: '2px solid var(--primary-color)',
};
const resizerLineStyle: React.CSSProperties = {
    borderColor: 'var(--primary-color)',
    borderWidth: 1,
};

const tagStyle: React.CSSProperties = {
    color: 'white',
    fontSize: '9px',
    textTransform: 'uppercase',
    fontWeight: 600,
    letterSpacing: '0.4px',
};

const labelStyle: React.CSSProperties = {
    color: 'white',
    fontWeight: 700,
    fontSize: '0.88rem',
    lineHeight: 1.1,
    wordBreak: 'break-word',
    whiteSpace: 'pre-wrap',
};

export const StartNode = ({ selected }: NodeProps) => {
    const { t } = useTranslation();
    return (
        <>
            <NodeResizer
                isVisible={!!selected}
                minWidth={110}
                minHeight={36}
                handleStyle={resizerHandleStyle}
                lineStyle={resizerLineStyle}
            />
            <div className="glass-panel" style={{
                padding: '5px 14px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                borderRadius: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: '100%',
                height: '100%',
                minWidth: '110px',
                minHeight: '28px',
                justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.35)',
                border: '1.5px solid rgba(255,255,255,0.35)'
            }}>
                <Play size={16} color="white" />
                <div style={{ color: 'white', fontWeight: 'bold', fontSize: '0.95rem', textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>{t('nodes.start')}</div>
                <Handle type="source" position={Position.Bottom} style={handleStyle} />
            </div>
        </>
    );
};

export const EndNode = ({ selected }: NodeProps) => {
    const { t } = useTranslation();
    return (
        <>
            <NodeResizer
                isVisible={!!selected}
                minWidth={110}
                minHeight={36}
                handleStyle={resizerHandleStyle}
                lineStyle={resizerLineStyle}
            />
            <div className="glass-panel" style={{
                padding: '5px 14px',
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                borderRadius: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: '100%',
                height: '100%',
                minWidth: '110px',
                minHeight: '28px',
                justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.35)',
                border: '1.5px solid rgba(255,255,255,0.35)'
            }}>
                <Handle type="target" position={Position.Top} style={handleStyle} />
                <Square size={16} color="white" />
                <div style={{ color: 'white', fontWeight: 'bold', fontSize: '0.95rem', textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>{t('nodes.end')}</div>
            </div>
        </>
    );
};

export const DeclareNode = ({ data, selected }: NodeProps) => {
    const { t, language } = useTranslation();
    const varName: string = data.variableName || '';
    const varType: VarType = data.variableType || 'int';
    const initial: string = data.initialValue || '';
    const typeLabel = VAR_TYPE_LABELS[varType]?.[language === 'it' ? 'it' : 'en'] ?? varType;
    return (
        <>
            <NodeResizer
                isVisible={!!selected}
                minWidth={140}
                minHeight={50}
                handleStyle={resizerHandleStyle}
                lineStyle={resizerLineStyle}
            />
            <div className="glass-panel" style={{
                padding: '5px 10px',
                background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                borderRadius: '10px',
                width: '100%',
                height: '100%',
                minWidth: '140px',
                minHeight: '32px',
                textAlign: 'center',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.35)',
                border: '1.5px solid rgba(255,255,255,0.35)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
            }}>
                <Handle type="target" position={Position.Top} style={handleStyle} />
                <div style={{ marginBottom: '1px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', opacity: 0.9 }}>
                    <Variable size={11} color="white" />
                    <span style={tagStyle}>{t('nodes.declare')}</span>
                </div>
                <div style={labelStyle}>
                    {varName || '—'}
                    <span style={{ fontWeight: 400, opacity: 0.85, fontSize: '0.78rem' }}> : {typeLabel}</span>
                </div>
                {initial ? (
                    <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.78rem', marginTop: '2px' }}>
                        = {initial}
                    </div>
                ) : null}
                <Handle type="source" position={Position.Bottom} style={handleStyle} />
            </div>
        </>
    );
};

export const ProcessNode = ({ data, selected }: NodeProps) => {
    const { t } = useTranslation();
    return (
        <>
            <NodeResizer
                isVisible={!!selected}
                minWidth={140}
                minHeight={50}
                handleStyle={resizerHandleStyle}
                lineStyle={resizerLineStyle}
            />
            <div className="glass-panel" style={{
                padding: '5px 10px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                borderRadius: '10px',
                width: '100%',
                height: '100%',
                minWidth: '140px',
                minHeight: '32px',
                textAlign: 'center',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.35)',
                border: '1.5px solid rgba(255,255,255,0.35)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
            }}>
                <Handle type="target" position={Position.Top} style={handleStyle} />
                <div style={{ marginBottom: '1px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', opacity: 0.9 }}>
                    <ArrowRight size={11} color="white" />
                    <span style={tagStyle}>{t('nodes.process')}</span>
                </div>
                <div style={labelStyle}>{data.label}</div>
                <Handle type="source" position={Position.Bottom} style={handleStyle} />
            </div>
        </>
    );
};

export const DecisionNode = ({ data, selected, id }: NodeProps) => {
    const { t } = useTranslation();
    const updateNodeInternals = useUpdateNodeInternals();

    // diamond as a percentage of the container box, so resize keeps proportions
    const diamondPct = 78; // ~ 140/180
    const vertexPct = (Math.sqrt(2) * diamondPct) / 2; // ~ 55%

    const handleStyleLocal = {
        width: 10,
        height: 10,
        background: '#fff',
        border: '2px solid #333',
        zIndex: 10,
    };

    const truePos: DecisionHandlePos = data.truePosition || 'bottom';
    const falsePos: DecisionHandlePos = data.falsePosition || 'right';

    // Tell React Flow that the handle bounds have changed so connected edges
    // re-anchor to the new positions instead of staying on the default sides.
    useEffect(() => {
        updateNodeInternals(id);
    }, [truePos, falsePos, id, updateNodeInternals]);

    const positionMap: Record<DecisionHandlePos, { rfPos: Position; top: string; left: string; labelTop: string; labelLeft: string; labelTransform: string }> = {
        bottom: {
            rfPos: Position.Bottom,
            top: `${50 + vertexPct}%`,
            left: '50%',
            labelTop: `calc(${50 + vertexPct}% + 12px)`,
            labelLeft: '50%',
            labelTransform: 'translateX(-50%)',
        },
        right: {
            rfPos: Position.Right,
            top: '50%',
            left: `${50 + vertexPct}%`,
            labelTop: '50%',
            labelLeft: `calc(${50 + vertexPct}% + 12px)`,
            labelTransform: 'translateY(-50%)',
        },
        left: {
            rfPos: Position.Left,
            top: '50%',
            left: `${50 - vertexPct}%`,
            labelTop: '50%',
            labelLeft: `calc(${50 - vertexPct}% - 12px)`,
            labelTransform: 'translate(-100%, -50%)',
        },
    };

    const trueCfg = positionMap[truePos];
    const falseCfg = positionMap[falsePos];

    return (
        <>
            <NodeResizer
                isVisible={!!selected}
                minWidth={140}
                minHeight={140}
                keepAspectRatio
                handleStyle={resizerHandleStyle}
                lineStyle={resizerLineStyle}
            />
            <div style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                minWidth: '140px',
                minHeight: '140px',
                aspectRatio: '1 / 1',
            }}>
                {/* Diamante */}
                <div
                    className="glass-panel"
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        width: `${diamondPct}%`,
                        height: `${diamondPct}%`,
                        transform: 'translate(-50%, -50%) rotate(45deg)',
                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                        borderRadius: '10px',
                        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.35)',
                        border: '1.5px solid rgba(255,255,255,0.35)',
                        zIndex: 1
                    }}
                />
                {/* Testo */}
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 2,
                    textAlign: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    width: '60%',
                    pointerEvents: 'none'
                }}>
                    <Diamond size={16} style={{ marginBottom: '2px', opacity: 0.8 }} />
                    <div style={{ fontSize: '0.85rem', lineHeight: '1.15', wordBreak: 'break-word' }}>{data.label}</div>
                </div>
                {/* HANDLE TOP (Input) */}
                <Handle
                    type="target"
                    position={Position.Top}
                    style={{
                        ...handleStyleLocal,
                        position: 'absolute',
                        top: `${50 - vertexPct}%`,
                        left: '50%',
                        transform: 'translate(-50%, -50%)'
                    }}
                />
                {/* TRUE */}
                <Handle
                    type="source"
                    position={trueCfg.rfPos}
                    id="true"
                    style={{
                        ...handleStyleLocal,
                        position: 'absolute',
                        top: trueCfg.top,
                        left: trueCfg.left,
                        transform: 'translate(-50%, -50%)',
                        background: '#10b981',
                        border: '2px solid #059669'
                    }}
                />
                {/* FALSE */}
                <Handle
                    type="source"
                    position={falseCfg.rfPos}
                    id="false"
                    style={{
                        ...handleStyleLocal,
                        position: 'absolute',
                        top: falseCfg.top,
                        left: falseCfg.left,
                        transform: 'translate(-50%, -50%)',
                        background: '#ef4444',
                        border: '2px solid #dc2626'
                    }}
                />
                {/* Label TRUE */}
                <div style={{
                    position: 'absolute',
                    top: trueCfg.labelTop,
                    left: trueCfg.labelLeft,
                    transform: trueCfg.labelTransform,
                    color: '#10b981',
                    fontWeight: 'bold',
                    fontSize: '0.78rem',
                    textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                    pointerEvents: 'none',
                    whiteSpace: 'nowrap'
                }}>
                    {t('nodes.decisionTrue')}
                </div>
                {/* Label FALSE */}
                <div style={{
                    position: 'absolute',
                    top: falseCfg.labelTop,
                    left: falseCfg.labelLeft,
                    transform: falseCfg.labelTransform,
                    color: '#ef4444',
                    fontWeight: 'bold',
                    fontSize: '0.78rem',
                    textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                    pointerEvents: 'none',
                    whiteSpace: 'nowrap'
                }}>
                    {t('nodes.decisionFalse')}
                </div>
            </div>
        </>
    );
};

export const InputNode = ({ data, selected }: NodeProps) => {
    const { t } = useTranslation();
    const varName: string = data.variableName || '';
    const prompt: string = data.prompt || '';
    return (
        <>
            <NodeResizer
                isVisible={!!selected}
                minWidth={140}
                minHeight={56}
                handleStyle={resizerHandleStyle}
                lineStyle={resizerLineStyle}
            />
            <div style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                minWidth: '140px',
                minHeight: '34px',
            }}>
                <div style={{
                    padding: '5px 10px',
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                    borderRadius: '6px',
                    transform: 'skew(-10deg)',
                    textAlign: 'center',
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.35)',
                    border: '1.5px solid rgba(255,255,255,0.35)',
                    overflow: 'hidden',
                    isolation: 'isolate',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <div style={{ transform: 'skew(10deg)', background: 'transparent', width: '100%' }}>
                        <div style={{ marginBottom: '1px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', opacity: 0.9 }}>
                            <Save size={11} color="white" />
                            <span style={tagStyle}>{t('nodes.input')}</span>
                        </div>
                        {prompt ? (
                            <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.72rem', fontStyle: 'italic', marginBottom: '2px' }}>
                                "{prompt}"
                            </div>
                        ) : null}
                        <div style={labelStyle}>
                            {varName ? `→ ${varName}` : (data.label || '—')}
                        </div>
                    </div>
                </div>
                <Handle type="target" position={Position.Top} style={handleStyle} />
                <Handle type="source" position={Position.Bottom} style={handleStyle} />
            </div>
        </>
    );
};

export const OutputNode = ({ data, selected }: NodeProps) => {
    const { t } = useTranslation();
    const parts: OutputPart[] = Array.isArray(data.parts) ? data.parts : [];
    const fallback: string = data.label || data.expression || '—';
    const preview = parts.length > 0 ? previewOutput(parts) : fallback;
    return (
        <>
            <NodeResizer
                isVisible={!!selected}
                minWidth={140}
                minHeight={56}
                handleStyle={resizerHandleStyle}
                lineStyle={resizerLineStyle}
            />
            <div style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                minWidth: '140px',
                minHeight: '34px',
            }}>
                <div style={{
                    padding: '5px 10px',
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                    borderRadius: '6px',
                    transform: 'skew(-10deg)',
                    textAlign: 'center',
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.35)',
                    border: '1.5px solid rgba(255,255,255,0.35)',
                    overflow: 'hidden',
                    isolation: 'isolate',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <div style={{ transform: 'skew(10deg)', background: 'transparent', width: '100%' }}>
                        <div style={{ marginBottom: '1px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', opacity: 0.9 }}>
                            <LogOut size={11} color="white" />
                            <span style={tagStyle}>{t('nodes.output')}</span>
                        </div>
                        <div style={labelStyle}>{preview}</div>
                    </div>
                </div>
                <Handle type="target" position={Position.Top} style={handleStyle} />
                <Handle type="source" position={Position.Bottom} style={handleStyle} />
            </div>
        </>
    );
};

export const CommentNode = ({ data, id }: NodeProps) => {
    const { t } = useTranslation();
    const [isEditing, setIsEditing] = React.useState(false);
    const [text, setText] = React.useState(data.label || "");
    const [size, setSize] = React.useState({ width: 130, height: 50 });
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const isResizing = React.useRef(false);

    React.useEffect(() => {
        if (isEditing && textareaRef.current) {
            textareaRef.current.focus();
            textareaRef.current.select();
        }
    }, [isEditing]);

    const handleDoubleClick = () => {
        setIsEditing(true);
    };

    const handleBlur = () => {
        setIsEditing(false);
        // Update node data through React Flow
        if (data.onChange) {
            data.onChange(id, { label: text });
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            setIsEditing(false);
            setText(data.label || "");
        }
    };

    const handleResizeMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        isResizing.current = true;

        const startX = e.clientX;
        const startY = e.clientY;
        const startWidth = size.width;
        const startHeight = size.height;

        const handleMouseMove = (moveEvent: MouseEvent) => {
            if (!isResizing.current) return;

            const deltaX = moveEvent.clientX - startX;
            const deltaY = moveEvent.clientY - startY;

            const newWidth = Math.max(startWidth + deltaX, 130);
            const newHeight = Math.max(startHeight + deltaY, 50);

            setSize({ width: newWidth, height: newHeight });
        };

        const handleMouseUp = () => {
            isResizing.current = false;
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    return (
        <div
            ref={containerRef}
            className="glass-panel comment-node"
            style={{
                padding: '6px 8px',
                background: '#fef3c7',
                borderRadius: '2px',
                width: `${size.width}px`,
                height: `${size.height}px`,
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                border: '1px solid #fcd34d',
                borderLeft: '4px solid #f59e0b',
                color: '#78350f',
                position: 'relative'
            }}
            onDoubleClick={handleDoubleClick}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px', marginBottom: '3px', opacity: 0.7 }}>
                <MessageSquare size={10} />
                <span style={{ fontSize: '7.5px', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.3px' }}>Comment</span>
            </div>
            {isEditing ? (
                <textarea
                    ref={textareaRef}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    className="comment-textarea nodrag"
                    style={{
                        width: '100%',
                        height: 'calc(100% - 16px)',
                        fontSize: '0.6rem',
                        fontStyle: 'italic',
                        border: 'none',
                        outline: 'none',
                        background: 'transparent',
                        color: '#78350f',
                        resize: 'none',
                        fontFamily: 'inherit',
                        lineHeight: '1.15',
                        padding: '0',
                        overflow: 'auto'
                    }}
                    placeholder={t('nodes.commentPlaceholder')}
                />
            ) : (
                <div
                    style={{
                        fontSize: '0.6rem',
                        fontStyle: 'italic',
                        whiteSpace: 'pre-wrap',
                        height: 'calc(100% - 16px)',
                        cursor: 'text',
                        lineHeight: '1.15',
                        overflow: 'auto'
                    }}
                >
                    {text || t('nodes.commentDefault')}
                </div>
            )}

            {/* Custom Resize Handle */}
            <div
                className="nodrag"
                onMouseDown={handleResizeMouseDown}
                style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: '12px',
                    height: '12px',
                    cursor: 'nwse-resize',
                    background: 'linear-gradient(135deg, transparent 0%, transparent 50%, #f59e0b 50%, #f59e0b 55%, transparent 55%, transparent 60%, #f59e0b 60%, #f59e0b 65%, transparent 65%, transparent 70%, #f59e0b 70%, #f59e0b 75%, transparent 75%)',
                    backgroundSize: '10px 10px',
                    backgroundPosition: 'bottom right',
                    backgroundRepeat: 'no-repeat',
                    zIndex: 10
                }}
            />
        </div>
    );
};
