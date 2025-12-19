import React, { useState, useEffect } from 'react';
import { Settings, X } from 'lucide-react';
import { NodeToolbar, type Node, Position } from 'reactflow';
import { useTranslation } from '../i18n/i18nContext';

interface PropertiesPanelProps {
    selectedNode: Node | null;
    onUpdateNode: (id: string, data: any) => void;
    onClose: () => void;
}

export const PropertiesPanel = ({ selectedNode, onUpdateNode, onClose }: PropertiesPanelProps) => {
    const { t } = useTranslation();
    const [label, setLabel] = useState('');

    // Additional fields for specific node types
    const [variableName, setVariableName] = useState('');
    const [expression, setExpression] = useState('');
    const [condition, setCondition] = useState('');

    useEffect(() => {
        if (selectedNode) {
            setLabel(selectedNode.data.label || '');
            setVariableName(selectedNode.data.variableName || '');
            setExpression(selectedNode.data.expression || '');
            setCondition(selectedNode.data.condition || '');
        }
    }, [selectedNode]);

    const handleSave = () => {
        if (!selectedNode) return;

        const newData = {
            ...selectedNode.data,
            label, // Keep label for backward compatibility or display
            variableName,
            expression,
            condition
        };

        // Auto-generate label based on type if not manually set (or always?)
        // For now, let's update the visual label based on the specific fields to keep it simple for the user
        let visualLabel = label;
        if (selectedNode.type === 'process' && expression) {
            visualLabel = expression;
        } else if (selectedNode.type === 'decision' && condition) {
            visualLabel = condition;
        } else if ((selectedNode.type === 'input' || selectedNode.type === 'output') && variableName) {
            visualLabel = variableName;
        }

        onUpdateNode(selectedNode.id, { ...newData, label: visualLabel });
        onClose();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSave();
        }
    };

    if (!selectedNode) return null;

    return (
        <NodeToolbar
            nodeId={selectedNode.id}
            position={Position.Right}
            offset={20}
            style={{ zIndex: 100 }}
        >
            <div className="glass-panel properties-toolbar" style={{
                width: '320px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                boxShadow: '0 15px 40px rgba(0,0,0,0.4)',
                border: '1px solid var(--theme-glow)',
                animation: 'fadeIn 0.2s ease-out'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Settings size={18} color="var(--primary-color)" />
                        <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold' }}>{t('properties.title')}</h3>
                    </div>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-color)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}>
                        <X size={20} />
                    </button>
                </div>

                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    {t('properties.typeLabel')}<span style={{ fontWeight: 'bold', color: 'var(--primary-color)', textTransform: 'capitalize', marginLeft: '5px' }}>{selectedNode.type}</span>
                </div>

                {selectedNode.type === 'process' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>{t('properties.expressionLabel')}</label>
                        <input
                            type="text"
                            value={expression}
                            onChange={(e) => setExpression(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={t('properties.expressionPlaceholder')}
                            style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.1)', color: 'var(--text-color)', fontSize: '0.95rem' }}
                        />
                    </div>
                )}

                {selectedNode.type === 'decision' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>{t('properties.conditionLabel')}</label>
                        <input
                            type="text"
                            value={condition}
                            onChange={(e) => setCondition(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={t('properties.conditionPlaceholder')}
                            style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.1)', color: 'var(--text-color)', fontSize: '0.95rem' }}
                        />
                    </div>
                )}

                {(selectedNode.type === 'input' || selectedNode.type === 'output') && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>{t('properties.variableLabel')}</label>
                        <input
                            type="text"
                            value={variableName}
                            onChange={(e) => setVariableName(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={t('properties.variablePlaceholder')}
                            style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.1)', color: 'var(--text-color)', fontSize: '0.95rem' }}
                        />
                    </div>
                )}

                {(selectedNode.type === 'start' || selectedNode.type === 'end') && (
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontStyle: 'italic', padding: '10px 0' }}>
                        {t('properties.noProperties')}
                    </div>
                )}

                <button className="btn btn-primary" onClick={handleSave} style={{ marginTop: '5px', padding: '12px' }}>
                    {t('properties.updateButton')}
                </button>
            </div>
        </NodeToolbar>
    );
};
