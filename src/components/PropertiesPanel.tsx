import React, { useState, useEffect, useMemo } from 'react';
import { Settings, X, Plus, Trash2 } from 'lucide-react';
import { type Node } from 'reactflow';
import { useTranslation } from '../i18n/i18nContext';
import {
    type OutputPart,
    type VarType,
    type DecisionHandlePos,
    VAR_TYPE_LABELS,
} from '../types/flow';

interface DeclaredVarInfo {
    name: string;
    type: VarType;
    nodeId: string;
}

function collectDeclaredVars(nodes: Node[], excludeId?: string): DeclaredVarInfo[] {
    return nodes
        .filter(n => n.type === 'declare' && n.id !== excludeId)
        .map(n => ({
            name: (n.data.variableName || '').trim(),
            type: (n.data.variableType || 'int') as VarType,
            nodeId: n.id,
        }))
        .filter(v => v.name.length > 0);
}

interface FormProps {
    selectedNode: Node;
    allNodes: Node[];
    onUpdateNode: (id: string, data: any) => void;
    onClose: () => void;
    onDeleteNode?: (id: string) => void;
    chrome?: 'panel' | 'inline';
}

export const PropertiesForm: React.FC<FormProps> = ({ selectedNode, allNodes, onUpdateNode, onClose, onDeleteNode, chrome = 'panel' }) => {
    const { t, language } = useTranslation();
    const [label, setLabel] = useState('');
    const [variableName, setVariableName] = useState('');
    const [variableType, setVariableType] = useState<VarType>('int');
    const [initialValue, setInitialValue] = useState('');
    const [expression, setExpression] = useState('');
    const [condition, setCondition] = useState('');
    const [truePosition, setTruePosition] = useState<DecisionHandlePos>('bottom');
    const [falsePosition, setFalsePosition] = useState<DecisionHandlePos>('right');
    const [prompt, setPrompt] = useState('');
    const [parts, setParts] = useState<OutputPart[]>([]);

    const declaredVars = useMemo(
        () => collectDeclaredVars(allNodes, selectedNode.id),
        [allNodes, selectedNode.id],
    );

    useEffect(() => {
        setLabel(selectedNode.data.label || '');
        setVariableName(selectedNode.data.variableName || '');
        setVariableType((selectedNode.data.variableType as VarType) || 'int');
        setInitialValue(selectedNode.data.initialValue || '');
        setExpression(selectedNode.data.expression || '');
        setCondition(selectedNode.data.condition || '');
        setTruePosition((selectedNode.data.truePosition as DecisionHandlePos) || 'bottom');
        setFalsePosition((selectedNode.data.falsePosition as DecisionHandlePos) || 'right');
        setPrompt(selectedNode.data.prompt || '');
        setParts(Array.isArray(selectedNode.data.parts) ? selectedNode.data.parts : []);
    }, [selectedNode.id]);

    const handleSave = () => {
        const newData: any = { ...selectedNode.data, label };

        if (selectedNode.type === 'declare') {
            newData.variableName = variableName.trim();
            newData.variableType = variableType;
            newData.initialValue = initialValue.trim();
            newData.label = variableName.trim() || label;
        } else if (selectedNode.type === 'process') {
            newData.expression = expression;
            newData.variableName = variableName.trim();
            newData.label = expression || label;
        } else if (selectedNode.type === 'decision') {
            newData.condition = condition;
            newData.truePosition = truePosition;
            newData.falsePosition = falsePosition === truePosition
                ? (truePosition === 'bottom' ? 'right' : 'bottom')
                : falsePosition;
            newData.label = condition || label;
        } else if (selectedNode.type === 'input') {
            newData.variableName = variableName.trim();
            newData.prompt = prompt;
            newData.label = variableName.trim() ? `→ ${variableName.trim()}` : label;
        } else if (selectedNode.type === 'output') {
            newData.parts = parts;
            newData.expression = undefined;
            newData.label = parts.length > 0
                ? parts.map(p => p.kind === 'text' ? `"${p.value}"` : p.value).join(' + ')
                : label;
        }

        onUpdateNode(selectedNode.id, newData);
        onClose();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
            handleSave();
        }
    };

    const addPart = (kind: 'text' | 'var') => {
        setParts(prev => [...prev, kind === 'text' ? { kind: 'text', value: '' } : { kind: 'var', value: declaredVars[0]?.name || '' }]);
    };
    const updatePart = (idx: number, value: string) =>
        setParts(prev => prev.map((p, i) => i === idx ? { ...p, value } : p));
    const removePart = (idx: number) =>
        setParts(prev => prev.filter((_, i) => i !== idx));
    const movePart = (idx: number, dir: -1 | 1) => {
        setParts(prev => {
            const next = [...prev];
            const newIdx = idx + dir;
            if (newIdx < 0 || newIdx >= next.length) return next;
            [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
            return next;
        });
    };

    const inputStyle: React.CSSProperties = {
        padding: '10px 12px',
        borderRadius: '8px',
        border: '1px solid var(--glass-border)',
        background: 'rgba(0,0,0,0.1)',
        color: 'var(--text-color)',
        fontSize: '0.95rem',
        width: '100%',
        fontFamily: 'inherit',
    };
    const labelStyle: React.CSSProperties = {
        fontSize: '0.85rem',
        fontWeight: 600,
        color: 'var(--text-secondary)',
    };

    const containerStyle: React.CSSProperties = chrome === 'panel'
        ? {
            width: '340px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            boxShadow: '0 15px 40px rgba(0,0,0,0.4)',
            border: '1px solid var(--theme-glow)',
            animation: 'fadeIn 0.2s ease-out',
            maxHeight: '70vh',
            overflowY: 'auto',
        }
        : {
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
        };

    return (
        <div className={chrome === 'panel' ? 'glass-panel properties-toolbar' : ''} style={containerStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Settings size={16} color="var(--primary-color)" />
                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 'bold' }}>{t('properties.title')}</h3>
                    <span style={{ fontSize: '0.78rem', color: 'var(--primary-color)', textTransform: 'capitalize', fontWeight: 600 }}>· {selectedNode.type}</span>
                </div>
                <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    <X size={18} />
                </button>
            </div>

            {selectedNode.type === 'declare' && (
                <>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={labelStyle}>{t('properties.variableLabel')}</label>
                        <input type="text" value={variableName} onChange={(e) => setVariableName(e.target.value)} onKeyDown={handleKeyDown} placeholder={t('properties.variablePlaceholder')} style={inputStyle} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={labelStyle}>{t('properties.variableTypeLabel')}</label>
                        <select value={variableType} onChange={(e) => setVariableType(e.target.value as VarType)} style={inputStyle}>
                            {(['int', 'float', 'string', 'bool'] as VarType[]).map(type => (
                                <option key={type} value={type}>{VAR_TYPE_LABELS[type][language === 'it' ? 'it' : 'en']}</option>
                            ))}
                        </select>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={labelStyle}>{t('properties.initialValueLabel')}</label>
                        <input type="text" value={initialValue} onChange={(e) => setInitialValue(e.target.value)} onKeyDown={handleKeyDown} placeholder={t('properties.initialValuePlaceholder')} style={inputStyle} />
                    </div>
                </>
            )}

            {selectedNode.type === 'process' && (
                <>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={labelStyle}>{t('properties.processAssignTo')}</label>
                        <select value={variableName} onChange={(e) => setVariableName(e.target.value)} style={inputStyle}>
                            <option value="">— —</option>
                            {declaredVars.map(v => (
                                <option key={v.nodeId} value={v.name}>{v.name} ({VAR_TYPE_LABELS[v.type][language === 'it' ? 'it' : 'en']})</option>
                            ))}
                        </select>
                        <small style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{t('properties.processAssignToHint')}</small>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={labelStyle}>{t('properties.expressionLabel')}</label>
                        <input type="text" value={expression} onChange={(e) => setExpression(e.target.value)} onKeyDown={handleKeyDown} placeholder={t('properties.expressionPlaceholder')} style={inputStyle} />
                    </div>
                </>
            )}

            {selectedNode.type === 'decision' && (
                <>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={labelStyle}>{t('properties.conditionLabel')}</label>
                        <input type="text" value={condition} onChange={(e) => setCondition(e.target.value)} onKeyDown={handleKeyDown} placeholder={t('properties.conditionPlaceholder')} style={inputStyle} />
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ ...labelStyle, color: '#10b981' }}>{t('properties.truePositionLabel')}</label>
                            <select
                                value={truePosition}
                                onChange={(e) => {
                                    const next = e.target.value as DecisionHandlePos;
                                    setTruePosition(next);
                                    if (falsePosition === next) {
                                        // pick a different one for false
                                        const alt: DecisionHandlePos[] = (['bottom', 'right', 'left'] as DecisionHandlePos[])
                                            .filter(p => p !== next);
                                        setFalsePosition(alt[0]);
                                    }
                                }}
                                style={inputStyle}
                            >
                                <option value="bottom">{t('properties.posBottom')}</option>
                                <option value="right">{t('properties.posRight')}</option>
                                <option value="left">{t('properties.posLeft')}</option>
                            </select>
                        </div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ ...labelStyle, color: '#ef4444' }}>{t('properties.falsePositionLabel')}</label>
                            <select
                                value={falsePosition}
                                onChange={(e) => {
                                    const next = e.target.value as DecisionHandlePos;
                                    setFalsePosition(next);
                                    if (truePosition === next) {
                                        const alt: DecisionHandlePos[] = (['bottom', 'right', 'left'] as DecisionHandlePos[])
                                            .filter(p => p !== next);
                                        setTruePosition(alt[0]);
                                    }
                                }}
                                style={inputStyle}
                            >
                                <option value="bottom">{t('properties.posBottom')}</option>
                                <option value="right">{t('properties.posRight')}</option>
                                <option value="left">{t('properties.posLeft')}</option>
                            </select>
                        </div>
                    </div>
                    <small style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{t('properties.positionsHint')}</small>
                </>
            )}

            {selectedNode.type === 'input' && (
                <>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={labelStyle}>{t('properties.inputVariableLabel')}</label>
                        {declaredVars.length === 0 ? (
                            <div style={{
                                padding: '10px 12px',
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                borderRadius: '8px',
                                color: '#f87171',
                                fontSize: '0.85rem',
                            }}>{t('properties.noDeclaredVars')}</div>
                        ) : (
                            <select value={variableName} onChange={(e) => setVariableName(e.target.value)} style={inputStyle}>
                                <option value="">{t('properties.inputVariablePlaceholder')}</option>
                                {declaredVars.map(v => (
                                    <option key={v.nodeId} value={v.name}>{v.name} ({VAR_TYPE_LABELS[v.type][language === 'it' ? 'it' : 'en']})</option>
                                ))}
                            </select>
                        )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={labelStyle}>{t('properties.inputPromptLabel')}</label>
                        <input type="text" value={prompt} onChange={(e) => setPrompt(e.target.value)} onKeyDown={handleKeyDown} placeholder={t('properties.inputPromptPlaceholder')} style={inputStyle} />
                    </div>
                </>
            )}

            {selectedNode.type === 'output' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={labelStyle}>{t('properties.outputPartsLabel')}</label>
                    <small style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{t('properties.outputPartsHint')}</small>
                    {parts.length === 0 && (
                        <div style={{ fontSize: '0.85rem', fontStyle: 'italic', color: 'var(--text-secondary)' }}>{t('properties.outputEmpty')}</div>
                    )}
                    {parts.map((p, idx) => (
                        <div key={idx} style={{
                            display: 'flex', gap: '6px', alignItems: 'center', padding: '8px',
                            background: 'rgba(0,0,0,0.15)', borderRadius: '8px', border: '1px solid var(--glass-border)',
                        }}>
                            <span style={{
                                fontSize: '0.7rem', fontWeight: 700,
                                background: p.kind === 'text' ? '#fbbf2422' : '#8b5cf622',
                                color: p.kind === 'text' ? '#fbbf24' : '#8b5cf6',
                                padding: '2px 6px', borderRadius: '4px', minWidth: '44px', textAlign: 'center',
                            }}>{p.kind === 'text' ? t('properties.outputPartText') : t('properties.outputPartVariable')}</span>
                            {p.kind === 'text' ? (
                                <input type="text" value={p.value} onChange={(e) => updatePart(idx, e.target.value)} placeholder={t('properties.outputTextPlaceholder')} style={{ ...inputStyle, flex: 1 }} />
                            ) : (
                                <select value={p.value} onChange={(e) => updatePart(idx, e.target.value)} style={{ ...inputStyle, flex: 1 }}>
                                    <option value="">{t('properties.inputVariablePlaceholder')}</option>
                                    {declaredVars.map(v => (<option key={v.nodeId} value={v.name}>{v.name}</option>))}
                                </select>
                            )}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <button type="button" onClick={() => movePart(idx, -1)} disabled={idx === 0}
                                    style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: idx === 0 ? 'not-allowed' : 'pointer', opacity: idx === 0 ? 0.3 : 1, fontSize: '0.8rem', padding: '0 2px' }}
                                >▲</button>
                                <button type="button" onClick={() => movePart(idx, 1)} disabled={idx === parts.length - 1}
                                    style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: idx === parts.length - 1 ? 'not-allowed' : 'pointer', opacity: idx === parts.length - 1 ? 0.3 : 1, fontSize: '0.8rem', padding: '0 2px' }}
                                >▼</button>
                            </div>
                            <button type="button" onClick={() => removePart(idx)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}>
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                    <div style={{ display: 'flex', gap: '6px' }}>
                        <button type="button" onClick={() => addPart('text')} style={{
                            flex: 1, padding: '8px', background: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24',
                            border: '1px solid rgba(251, 191, 36, 0.3)', borderRadius: '8px', cursor: 'pointer',
                            fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                        }}>
                            <Plus size={14} /> {t('properties.outputPartText')}
                        </button>
                        <button type="button" onClick={() => addPart('var')} disabled={declaredVars.length === 0} style={{
                            flex: 1, padding: '8px', background: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa',
                            border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: '8px',
                            cursor: declaredVars.length === 0 ? 'not-allowed' : 'pointer', opacity: declaredVars.length === 0 ? 0.4 : 1,
                            fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                        }}>
                            <Plus size={14} /> {t('properties.outputPartVariable')}
                        </button>
                    </div>
                </div>
            )}

            {(selectedNode.type === 'start' || selectedNode.type === 'end') && (
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontStyle: 'italic', padding: '6px 0' }}>
                    {t('properties.noProperties')}
                </div>
            )}

            <div style={{ display: 'flex', gap: '8px', marginTop: '5px' }}>
                <button className="btn btn-primary" onClick={handleSave} style={{ flex: 1, padding: '10px' }}>
                    {t('properties.updateButton')}
                </button>
                {onDeleteNode && (
                    <button
                        type="button"
                        onClick={() => onDeleteNode(selectedNode.id)}
                        title={t('properties.deleteButton')}
                        style={{
                            padding: '10px 12px',
                            background: 'rgba(239, 68, 68, 0.12)',
                            color: '#ef4444',
                            border: '1px solid rgba(239, 68, 68, 0.4)',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: 600,
                            fontSize: '0.85rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'all 0.18s',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#ef4444';
                            e.currentTarget.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.12)';
                            e.currentTarget.style.color = '#ef4444';
                        }}
                    >
                        <Trash2 size={15} />
                        {t('properties.deleteButton')}
                    </button>
                )}
            </div>
        </div>
    );
};

interface PropertiesPanelProps {
    selectedNode: Node | null;
    allNodes: Node[];
    onUpdateNode: (id: string, data: any) => void;
    onClose: () => void;
    onDeleteNode?: (id: string) => void;
}

export const PropertiesPanel = ({ selectedNode, allNodes, onUpdateNode, onClose, onDeleteNode }: PropertiesPanelProps) => {
    if (!selectedNode) return null;
    return (
        <div
            className="properties-side-panel nopan nodrag nowheel"
            onMouseDown={(e) => e.stopPropagation()}
            onWheel={(e) => e.stopPropagation()}
        >
            <PropertiesForm
                selectedNode={selectedNode}
                allNodes={allNodes}
                onUpdateNode={onUpdateNode}
                onClose={onClose}
                onDeleteNode={onDeleteNode}
                chrome="panel"
            />
        </div>
    );
};

export const PropertiesPanelInline = ({ selectedNode, allNodes, onUpdateNode, onClose, onDeleteNode }: PropertiesPanelProps) => {
    if (!selectedNode) return null;
    return (
        <PropertiesForm
            selectedNode={selectedNode}
            allNodes={allNodes}
            onUpdateNode={onUpdateNode}
            onClose={onClose}
            onDeleteNode={onDeleteNode}
            chrome="inline"
        />
    );
};
