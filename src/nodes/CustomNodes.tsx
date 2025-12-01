import { Handle, Position, type NodeProps } from 'reactflow';
import { Play, Square, ArrowRight, Save, LogOut, Diamond, MessageSquare } from 'lucide-react';

const handleStyle = { width: 10, height: 10, background: '#fff', border: '2px solid #333' };

export const StartNode = ({ }: NodeProps) => {
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
            <div style={{ color: 'white', fontWeight: 'bold', fontSize: '1rem', textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>Start</div>
            <Handle type="source" position={Position.Bottom} style={handleStyle} />
        </div>
    );
};

export const EndNode = ({ }: NodeProps) => {
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
            <div style={{ color: 'white', fontWeight: 'bold', fontSize: '1rem', textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>End</div>
        </div>
    );
};

export const ProcessNode = ({ data }: NodeProps) => {
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
                <span style={{ color: 'white', fontSize: '11px', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px' }}>Process</span>
            </div>
            <div style={{ color: 'white', fontWeight: 'bold', fontSize: '1.1rem' }}>{data.label}</div>
            <Handle type="source" position={Position.Bottom} style={handleStyle} />
        </div>
    );
};

export const DecisionNode = ({ data }: NodeProps) => {
    return (
        <div style={{ position: 'relative', width: '140px', height: '140px', margin: '20px' }}>
            <div className="glass-panel" style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                borderRadius: '12px',
                transform: 'rotate(45deg)',
                boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4)',
                border: '1px solid rgba(255,255,255,0.2)',
                zIndex: 1
            }} />
            <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 2,
                textAlign: 'center',
                color: 'white',
                fontWeight: 'bold',
                width: '100px'
            }}>
                <Diamond size={20} style={{ marginBottom: '4px', opacity: 0.8 }} />
                <div style={{ fontSize: '0.9rem', lineHeight: '1.2' }}>{data.label}</div>
            </div>

            <Handle type="target" position={Position.Top} style={{ ...handleStyle, top: -6, left: '50%', transform: 'translateX(-50%)', zIndex: 3 }} />
            <Handle type="source" position={Position.Bottom} id="true" style={{ ...handleStyle, bottom: -6, left: '50%', transform: 'translateX(-50%)', background: '#10b981', zIndex: 3 }} />
            <Handle type="source" position={Position.Right} id="false" style={{ ...handleStyle, right: -6, top: '50%', transform: 'translateY(-50%)', background: '#ef4444', zIndex: 3 }} />

            {/* Labels for True/False */}
            <div style={{ position: 'absolute', bottom: -25, left: '50%', transform: 'translateX(-50%)', color: '#10b981', fontWeight: 'bold', fontSize: '0.8rem' }}>True</div>
            <div style={{ position: 'absolute', right: -30, top: '50%', transform: 'translateY(-50%)', color: '#ef4444', fontWeight: 'bold', fontSize: '0.8rem' }}>False</div>
        </div>
    );
};

export const InputNode = ({ data }: NodeProps) => {
    return (
        <div style={{
            padding: '16px',
            background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            borderRadius: '8px',
            minWidth: '160px',
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
                <Handle type="target" position={Position.Top} style={handleStyle} />
                <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', opacity: 0.9 }}>
                    <Save size={14} color="white" />
                    <span style={{ color: 'white', fontSize: '11px', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px' }}>Input</span>
                </div>
                <div style={{ color: 'white', fontWeight: 'bold', fontSize: '1.1rem' }}>{data.label}</div>
                <Handle type="source" position={Position.Bottom} style={handleStyle} />
            </div>
        </div>
    );
};

export const OutputNode = ({ data }: NodeProps) => {
    return (
        <div style={{
            padding: '16px',
            background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            borderRadius: '8px',
            minWidth: '160px',
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
                <Handle type="target" position={Position.Top} style={handleStyle} />
                <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', opacity: 0.9 }}>
                    <LogOut size={14} color="white" />
                    <span style={{ color: 'white', fontSize: '11px', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px' }}>Output</span>
                </div>
                <div style={{ color: 'white', fontWeight: 'bold', fontSize: '1.1rem' }}>{data.label}</div>
                <Handle type="source" position={Position.Bottom} style={handleStyle} />
            </div>
        </div>
    );
};

export const CommentNode = ({ data }: NodeProps) => {
    return (
        <div className="glass-panel" style={{
            padding: '16px',
            background: '#fef3c7',
            borderRadius: '2px',
            minWidth: '180px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            border: '1px solid #fcd34d',
            borderLeft: '4px solid #f59e0b',
            color: '#78350f'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', opacity: 0.7 }}>
                <MessageSquare size={14} />
                <span style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 600 }}>Comment</span>
            </div>
            <div style={{ fontSize: '0.9rem', fontStyle: 'italic', whiteSpace: 'pre-wrap' }}>{data.label || "Scrivi un commento..."}</div>
        </div>
    );
};
