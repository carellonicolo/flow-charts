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
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '15px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                border: '1px solid var(--glass-border)',
                animation: 'fadeIn 0.2s ease-out'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Settings size={18} />
                        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{t('properties.title')}</h3>
                    </div>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
                        <X size={18} />
                    </button>
                </div>

                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    {t('properties.typeLabel')}<span style={{ fontWeight: 'bold', color: 'var(--text-color)', textTransform: 'capitalize' }}>{selectedNode.type}</span>
                </div>

                {/* Common Label Field (optional, maybe hidden for specific types if we want to enforce structure) */}
                {/* <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <label style={{ fontSize: '0.8rem' }}>Label</label>
        <input 
          type="text" 
          value={label} 
          onChange={(e) => setLabel(e.target.value)}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
        />
      </div> */}

                {selectedNode.type === 'process' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <label style={{ fontSize: '0.8rem' }}>{t('properties.expressionLabel')}</label>
                        <input
                            type="text"
                            value={expression}
                            onChange={(e) => setExpression(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={t('properties.expressionPlaceholder')}
                            style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'var(--text-color)' }}
                        />
                    </div>
                )}

                {selectedNode.type === 'decision' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <label style={{ fontSize: '0.8rem' }}>{t('properties.conditionLabel')}</label>
                        <input
                            type="text"
                            value={condition}
                            onChange={(e) => setCondition(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={t('properties.conditionPlaceholder')}
                            style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'var(--text-color)' }}
                        />
                    </div>
                )}

                {(selectedNode.type === 'input' || selectedNode.type === 'output') && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <label style={{ fontSize: '0.8rem' }}>{t('properties.variableLabel')}</label>
                        <input
                            type="text"
                            value={variableName}
                            onChange={(e) => setVariableName(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={t('properties.variablePlaceholder')}
                            style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'var(--text-color)' }}
                        />
                    </div>
                )}

                {(selectedNode.type === 'start' || selectedNode.type === 'end') && (
                    <div style={{ fontSize: '0.9rem', color: '#94a3b8', fontStyle: 'italic' }}>
                        {t('properties.noProperties')}
                    </div>
                )}

                <button className="btn btn-primary" onClick={handleSave} style={{ marginTop: '10px' }}>
                    {t('properties.updateButton')}
                </button>
            </div>
        </NodeToolbar>
    );
};
