import React from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { Play, Square, ArrowRight, Save, LogOut, Diamond, MessageSquare } from 'lucide-react';
import { useTranslation } from '../i18n/i18nContext';

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
    // Configurazione diamante
    const diamondSize = 140;
    const containerSize = 180;
    const centerPoint = containerSize / 2; // 90px

    // Calcolo distanza vertici dal centro per diamante ruotato 45°
    // Formula: sqrt(2) * (lato / 2)
    const vertexDistance = Math.sqrt(2) * (diamondSize / 2); // ≈ 99px

    const handleStyleLocal = {
        width: 10,
        height: 10,
        background: '#fff',
        border: '2px solid #333',
        zIndex: 10
    };

    return (
        <div style={{
            position: 'relative',
            width: `${containerSize}px`,
            height: `${containerSize}px`
        }}>
            {/* Diamante rotato - centrato nel container */}
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

            {/* Testo - centrato nel diamante */}
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

            {/* HANDLE TOP (Input) - vertice superiore */}
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

            {/* HANDLE BOTTOM (True) - vertice inferiore */}
            <Handle
                type="source"
                position={Position.Bottom}
                id="true"
                style={{
                    ...handleStyleLocal,
                    position: 'absolute',
                    top: `${centerPoint + vertexDistance}px`,
                    left: `${centerPoint}px`,
                    transform: 'translate(-50%, -50%)',
                    background: '#10b981',
                    border: '2px solid #059669'
                }}
            />

            {/* HANDLE RIGHT (False) - vertice destro */}
            <Handle
                type="source"
                position={Position.Right}
                id="false"
                style={{
                    ...handleStyleLocal,
                    position: 'absolute',
                    top: `${centerPoint}px`,
                    left: `${centerPoint + vertexDistance}px`,
                    transform: 'translate(-50%, -50%)',
                    background: '#ef4444',
                    border: '2px solid #dc2626'
                }}
            />

            {/* Label TRUE - sotto handle bottom */}
            <div style={{
                position: 'absolute',
                top: `${centerPoint + vertexDistance + 15}px`,
                left: '50%',
                transform: 'translateX(-50%)',
                color: '#10b981',
                fontWeight: 'bold',
                fontSize: '0.8rem',
                textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                pointerEvents: 'none'
            }}>
                {t('nodes.decisionTrue')}
            </div>

            {/* Label FALSE - a destra handle right */}
            <div style={{
                position: 'absolute',
                top: '50%',
                left: `${centerPoint + vertexDistance + 15}px`,
                transform: 'translateY(-50%)',
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
                    <div style={{ color: 'white', fontWeight: 'bold', fontSize: '1.1rem' }}>{data.label}</div>
                </div>
            </div>
            <Handle type="target" position={Position.Top} style={handleStyle} />
            <Handle type="source" position={Position.Bottom} style={handleStyle} />
        </div>
    );
};

export const OutputNode = ({ data }: NodeProps) => {
    const { t } = useTranslation();
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
                    <div style={{ color: 'white', fontWeight: 'bold', fontSize: '1.1rem' }}>{data.label}</div>
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
