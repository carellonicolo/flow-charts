import React from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { Play, Square, ArrowRight, Save, LogOut, Diamond, MessageSquare, Variable } from 'lucide-react';
import { useTranslation } from '../i18n/i18nContext';
import { VAR_TYPE_LABELS, previewOutput, type OutputPart, type VarType, type DecisionHandlePos } from '../types/flow';

const handleStyle = { width: 10, height: 10, background: '#fff', border: '2px solid #333' };

export const StartNode = ({ }: NodeProps) => {
    const { t } = useTranslation();
    return (
        <div className="glass-panel" style={{
            padding: '12px 24px',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            borderRadius: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            minWidth: '140px',
            justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)',
            border: '1px solid rgba(255,255,255,0.2)'
        }}>
            <Play size={18} color="white" />
            <div style={{ color: 'white', fontWeight: 'bold', fontSize: '1rem', textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>{t('nodes.start')}</div>
            <Handle type="source" position={Position.Bottom} style={handleStyle} />
        </div>
    );
};

export const EndNode = ({ }: NodeProps) => {
    const { t } = useTranslation();
    return (
        <div className="glass-panel" style={{
            padding: '12px 24px',
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            borderRadius: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            minWidth: '140px',
            justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)',
            border: '1px solid rgba(255,255,255,0.2)'
        }}>
            <Handle type="target" position={Position.Top} style={handleStyle} />
            <Square size={18} color="white" />
            <div style={{ color: 'white', fontWeight: 'bold', fontSize: '1rem', textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>{t('nodes.end')}</div>
        </div>
    );
};

export const DeclareNode = ({ data }: NodeProps) => {
    const { t, language } = useTranslation();
    const varName: string = data.variableName || '';
    const varType: VarType = data.variableType || 'int';
    const initial: string = data.initialValue || '';
    const typeLabel = VAR_TYPE_LABELS[varType]?.[language === 'it' ? 'it' : 'en'] ?? varType;
    return (
        <div className="glass-panel" style={{
            padding: '14px 16px',
            background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
            borderRadius: '12px',
            minWidth: '170px',
            textAlign: 'center',
            boxShadow: '0 4px 15px rgba(14, 165, 233, 0.4)',
            border: '1px solid rgba(255,255,255,0.2)'
        }}>
            <Handle type="target" position={Position.Top} style={handleStyle} />
            <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', opacity: 0.9 }}>
                <Variable size={14} color="white" />
                <span style={{ color: 'white', fontSize: '11px', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px' }}>{t('nodes.declare')}</span>
            </div>
            <div style={{ color: 'white', fontWeight: 'bold', fontSize: '1.05rem', lineHeight: 1.2 }}>
                {varName || '—'}
                <span style={{ fontWeight: 400, opacity: 0.85, fontSize: '0.85rem' }}> : {typeLabel}</span>
            </div>
            {initial ? (
                <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem', marginTop: '4px' }}>
                    = {initial}
                </div>
            ) : null}
            <Handle type="source" position={Position.Bottom} style={handleStyle} />
        </div>
    );
};

export const ProcessNode = ({ data }: NodeProps) => {
    const { t } = useTranslation();
    return (
        <div className="glass-panel" style={{
            padding: '16px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            borderRadius: '12px',
            minWidth: '160px',
            textAlign: 'center',
            boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)',
            border: '1px solid rgba(255,255,255,0.2)'
        }}>
            <Handle type="target" position={Position.Top} style={handleStyle} />
            <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', opacity: 0.9 }}>
                <ArrowRight size={14} color="white" />
                <span style={{ color: 'white', fontSize: '11px', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px' }}>{t('nodes.process')}</span>
            </div>
            <div style={{ color: 'white', fontWeight: 'bold', fontSize: '1.1rem' }}>{data.label}</div>
            <Handle type="source" position={Position.Bottom} style={handleStyle} />
        </div>
    );
};

export const DecisionNode = ({ data }: NodeProps) => {
    const { t } = useTranslation();
    const diamondSize = 140;
    const containerSize = 180;
    const centerPoint = containerSize / 2;
    const vertexDistance = Math.sqrt(2) * (diamondSize / 2);

    const handleStyleLocal = {
        width: 10,
        height: 10,
        background: '#fff',
        border: '2px solid #333',
        zIndex: 10,
    };

    const truePos: DecisionHandlePos = data.truePosition || 'bottom';
    const falsePos: DecisionHandlePos = data.falsePosition || 'right';

    const positionMap: Record<DecisionHandlePos, { rfPos: Position; top: number; left: number; labelTop: number; labelLeft: number; labelTransform: string; labelAnchor: 'center' | 'left' | 'right' }> = {
        bottom: {
            rfPos: Position.Bottom,
            top: centerPoint + vertexDistance,
            left: centerPoint,
            labelTop: centerPoint + vertexDistance + 15,
            labelLeft: centerPoint,
            labelTransform: 'translateX(-50%)',
            labelAnchor: 'center',
        },
        right: {
            rfPos: Position.Right,
            top: centerPoint,
            left: centerPoint + vertexDistance,
            labelTop: centerPoint,
            labelLeft: centerPoint + vertexDistance + 15,
            labelTransform: 'translateY(-50%)',
            labelAnchor: 'left',
        },
        left: {
            rfPos: Position.Left,
            top: centerPoint,
            left: centerPoint - vertexDistance,
            labelTop: centerPoint,
            labelLeft: centerPoint - vertexDistance - 15,
            labelTransform: 'translate(-100%, -50%)',
            labelAnchor: 'right',
        },
    };

    const trueCfg = positionMap[truePos];
    const falseCfg = positionMap[falsePos];

    return (
        <div style={{
            position: 'relative',
            width: `${containerSize}px`,
            height: `${containerSize}px`
        }}>
            {/* Diamante */}
            <div
                className="glass-panel"
                style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: `${diamondSize}px`,
                    height: `${diamondSize}px`,
                    transform: 'translate(-50%, -50%) rotate(45deg)',
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    borderRadius: '12px',
                    boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    zIndex: 1
                }}
            />

            {/* Testo centrato */}
            <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 2,
                textAlign: 'center',
                color: 'white',
                fontWeight: 'bold',
                width: '100px',
                pointerEvents: 'none'
            }}>
                <Diamond size={20} style={{ marginBottom: '4px', opacity: 0.8 }} />
                <div style={{ fontSize: '0.9rem', lineHeight: '1.2' }}>{data.label}</div>
            </div>

            {/* HANDLE TOP (Input) */}
            <Handle
                type="target"
                position={Position.Top}
                style={{
                    ...handleStyleLocal,
                    position: 'absolute',
                    top: `${centerPoint - vertexDistance}px`,
                    left: `${centerPoint}px`,
                    transform: 'translate(-50%, -50%)'
                }}
            />

            {/* HANDLE TRUE - posizione configurabile */}
            <Handle
                type="source"
                position={trueCfg.rfPos}
                id="true"
                style={{
                    ...handleStyleLocal,
                    position: 'absolute',
                    top: `${trueCfg.top}px`,
                    left: `${trueCfg.left}px`,
                    transform: 'translate(-50%, -50%)',
                    background: '#10b981',
                    border: '2px solid #059669'
                }}
            />

            {/* HANDLE FALSE - posizione configurabile */}
            <Handle
                type="source"
                position={falseCfg.rfPos}
                id="false"
                style={{
                    ...handleStyleLocal,
                    position: 'absolute',
                    top: `${falseCfg.top}px`,
                    left: `${falseCfg.left}px`,
                    transform: 'translate(-50%, -50%)',
                    background: '#ef4444',
                    border: '2px solid #dc2626'
                }}
            />

            {/* Label TRUE */}
            <div style={{
                position: 'absolute',
                top: `${trueCfg.labelTop}px`,
                left: `${trueCfg.labelLeft}px`,
                transform: trueCfg.labelTransform,
                color: '#10b981',
                fontWeight: 'bold',
                fontSize: '0.8rem',
                textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                pointerEvents: 'none',
                whiteSpace: 'nowrap'
            }}>
                {t('nodes.decisionTrue')}
            </div>

            {/* Label FALSE */}
            <div style={{
                position: 'absolute',
                top: `${falseCfg.labelTop}px`,
                left: `${falseCfg.labelLeft}px`,
                transform: falseCfg.labelTransform,
                color: '#ef4444',
                fontWeight: 'bold',
                fontSize: '0.8rem',
                textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                pointerEvents: 'none',
                whiteSpace: 'nowrap'
            }}>
                {t('nodes.decisionFalse')}
            </div>
        </div>
    );
};

export const InputNode = ({ data }: NodeProps) => {
    const { t } = useTranslation();
    const varName: string = data.variableName || '';
    const prompt: string = data.prompt || '';
    return (
        <div style={{
            position: 'relative',
            minWidth: '160px',
            minHeight: '80px'
        }}>
            <div style={{
                padding: '16px',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                borderRadius: '8px',
                transform: 'skew(-10deg)',
                textAlign: 'center',
                boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)',
                border: '1px solid rgba(255,255,255,0.2)',
                overflow: 'hidden',
                isolation: 'isolate'
            }}>
                <div style={{
                    transform: 'skew(10deg)',
                    background: 'transparent'
                }}>
                    <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', opacity: 0.9 }}>
                        <Save size={14} color="white" />
                        <span style={{ color: 'white', fontSize: '11px', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px' }}>{t('nodes.input')}</span>
                    </div>
                    {prompt ? (
                        <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.78rem', fontStyle: 'italic', marginBottom: '4px' }}>
                            "{prompt}"
                        </div>
                    ) : null}
                    <div style={{ color: 'white', fontWeight: 'bold', fontSize: '1.1rem' }}>
                        {varName ? `→ ${varName}` : (data.label || '—')}
                    </div>
                </div>
            </div>
            <Handle type="target" position={Position.Top} style={handleStyle} />
            <Handle type="source" position={Position.Bottom} style={handleStyle} />
        </div>
    );
};

export const OutputNode = ({ data }: NodeProps) => {
    const { t } = useTranslation();
    const parts: OutputPart[] = Array.isArray(data.parts) ? data.parts : [];
    const fallback: string = data.label || data.expression || '—';
    const preview = parts.length > 0 ? previewOutput(parts) : fallback;
    return (
        <div style={{
            position: 'relative',
            minWidth: '160px',
            minHeight: '80px'
        }}>
            <div style={{
                padding: '16px',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                borderRadius: '8px',
                transform: 'skew(-10deg)',
                textAlign: 'center',
                boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)',
                border: '1px solid rgba(255,255,255,0.2)',
                overflow: 'hidden',
                isolation: 'isolate'
            }}>
                <div style={{
                    transform: 'skew(10deg)',
                    background: 'transparent'
                }}>
                    <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', opacity: 0.9 }}>
                        <LogOut size={14} color="white" />
                        <span style={{ color: 'white', fontSize: '11px', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px' }}>{t('nodes.output')}</span>
                    </div>
                    <div style={{ color: 'white', fontWeight: 'bold', fontSize: '1.05rem', wordBreak: 'break-word' }}>{preview}</div>
                </div>
            </div>
            <Handle type="target" position={Position.Top} style={handleStyle} />
            <Handle type="source" position={Position.Bottom} style={handleStyle} />
        </div>
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
