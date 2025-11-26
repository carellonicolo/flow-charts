import { useState, useEffect } from 'react';
import { Modal, ModalFooter, Button, Input, Textarea } from '../ui';
import { NodeType, type FlowChartNodeData } from '../../types/flowchart';
import { useFlowchartStore } from '../../store/flowchartStore';
import { useUIStore } from '../../store/uiStore';

/**
 * NodeEditModal - Modal elegante per editing nodi
 * SOSTITUISCE il prompt() orribile
 */
export default function NodeEditModal() {
  const { modals, closeModal } = useUIStore();
  const { nodes, updateNode } = useFlowchartStore();

  const isOpen = modals.nodeEdit.isOpen;
  const nodeId = modals.nodeEdit.nodeId;

  // Trova il nodo da editare
  const node = nodes.find((n) => n.id === nodeId);
  const nodeData = node?.data;

  // State locale per form
  const [formData, setFormData] = useState<Partial<FlowChartNodeData>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Inizializza form data quando il modal si apre
  useEffect(() => {
    if (isOpen && nodeData) {
      setFormData({ ...nodeData });
      setErrors({});
    }
  }, [isOpen, nodeData]);

  if (!node || !nodeData) {
    return null;
  }

  /**
   * Validazione form
   */
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    switch (nodeData.type) {
      case NodeType.INPUT:
        if (!formData.variable?.trim()) {
          newErrors.variable = 'Nome variabile richiesto';
        } else if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(formData.variable)) {
          newErrors.variable = 'Nome variabile non valido (solo lettere, numeri, underscore)';
        }
        break;

      case NodeType.OUTPUT:
        if (!formData.expression?.trim()) {
          newErrors.expression = 'Espressione richiesta';
        }
        break;

      case NodeType.PROCESS:
        if (!formData.expression?.trim()) {
          newErrors.expression = 'Assegnazione richiesta';
        } else if (!formData.expression.includes('=')) {
          newErrors.expression = 'Formato assegnazione: variabile = espressione';
        }
        break;

      case NodeType.DECISION:
      case NodeType.WHILE:
        if (!formData.condition?.trim()) {
          newErrors.condition = 'Condizione richiesta';
        }
        break;

      case NodeType.FOR:
        if (!formData.loopVariable?.trim()) {
          newErrors.loopVariable = 'Variabile ciclo richiesta';
        }
        if (!formData.loopStart?.trim()) {
          newErrors.loopStart = 'Valore iniziale richiesto';
        }
        if (!formData.loopEnd?.trim()) {
          newErrors.loopEnd = 'Valore finale richiesto';
        }
        if (!formData.loopStep?.trim()) {
          newErrors.loopStep = 'Passo richiesto';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Salva modifiche
   */
  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    // Aggiorna anche il label del nodo
    const updatedData = {
      ...formData,
      label: getNodeLabel(formData),
    };

    updateNode(nodeId!, updatedData);
    closeModal('nodeEdit');
  };

  /**
   * Genera label automatico dal contenuto
   */
  const getNodeLabel = (data: Partial<FlowChartNodeData>): string => {
    switch (data.type) {
      case NodeType.INPUT:
        return `Leggi ${data.variable || 'x'}`;
      case NodeType.OUTPUT:
        return `Scrivi ${data.expression || 'valore'}`;
      case NodeType.PROCESS:
        return data.expression || 'x = valore';
      case NodeType.DECISION:
        return `${data.condition || 'condizione'}?`;
      case NodeType.WHILE:
        return `Mentre ${data.condition || 'condizione'}`;
      case NodeType.FOR:
        return `${data.loopVariable || 'i'}: ${data.loopStart || '1'}→${data.loopEnd || '10'}`;
      default:
        return data.label || '';
    }
  };

  /**
   * Renderizza il form in base al tipo di nodo
   */
  const renderForm = () => {
    switch (nodeData.type) {
      case NodeType.START:
      case NodeType.END:
        return (
          <div className="text-center py-4" style={{ color: 'var(--text-secondary)' }}>
            <p>Nodo {nodeData.type === NodeType.START ? 'INIZIO' : 'FINE'}</p>
            <p className="text-sm mt-2">Questo nodo non ha parametri configurabili.</p>
          </div>
        );

      case NodeType.INPUT:
        return (
          <Input
            label="Nome variabile"
            placeholder="es: x, numero, nome"
            value={formData.variable || ''}
            onChange={(e) => setFormData({ ...formData, variable: e.target.value })}
            error={errors.variable}
            helper="Nome della variabile da leggere dall'utente"
            fullWidth
            autoFocus
          />
        );

      case NodeType.OUTPUT:
        return (
          <Input
            label="Espressione da stampare"
            placeholder='es: x, x + 5, "Risultato = " + x'
            value={formData.expression || ''}
            onChange={(e) => setFormData({ ...formData, expression: e.target.value })}
            error={errors.expression}
            helper="Espressione o variabile da mostrare all'utente"
            fullWidth
            autoFocus
          />
        );

      case NodeType.PROCESS:
        return (
          <Textarea
            label="Assegnazione"
            placeholder="es: x = 5&#10;y = x + 3&#10;somma = x + y"
            value={formData.expression || ''}
            onChange={(e) => setFormData({ ...formData, expression: e.target.value })}
            error={errors.expression}
            helper="Formato: variabile = espressione"
            rows={3}
            fullWidth
            autoFocus
          />
        );

      case NodeType.DECISION:
        return (
          <Input
            label="Condizione"
            placeholder="es: x > 5, y == 10, x < y"
            value={formData.condition || ''}
            onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
            error={errors.condition}
            helper="Condizione booleana da valutare"
            fullWidth
            autoFocus
          />
        );

      case NodeType.WHILE:
        return (
          <Input
            label="Condizione ciclo"
            placeholder="es: x < 10, i <= 100"
            value={formData.condition || ''}
            onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
            error={errors.condition}
            helper="Il ciclo continua finché questa condizione è vera"
            fullWidth
            autoFocus
          />
        );

      case NodeType.FOR:
        return (
          <div className="space-y-4">
            <Input
              label="Variabile del ciclo"
              placeholder="es: i"
              value={formData.loopVariable || ''}
              onChange={(e) => setFormData({ ...formData, loopVariable: e.target.value })}
              error={errors.loopVariable}
              fullWidth
              autoFocus
            />

            <div className="grid grid-cols-3 gap-3">
              <Input
                label="Inizio"
                placeholder="1"
                value={formData.loopStart || ''}
                onChange={(e) => setFormData({ ...formData, loopStart: e.target.value })}
                error={errors.loopStart}
                fullWidth
              />

              <Input
                label="Fine"
                placeholder="10"
                value={formData.loopEnd || ''}
                onChange={(e) => setFormData({ ...formData, loopEnd: e.target.value })}
                error={errors.loopEnd}
                fullWidth
              />

              <Input
                label="Passo"
                placeholder="1"
                value={formData.loopStep || ''}
                onChange={(e) => setFormData({ ...formData, loopStep: e.target.value })}
                error={errors.loopStep}
                fullWidth
              />
            </div>

            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Il ciclo esegue da {formData.loopStart || '?'} a {formData.loopEnd || '?'},
              incrementando di {formData.loopStep || '?'} ad ogni iterazione
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  const getTitle = () => {
    const typeLabels: Record<string, string> = {
      [NodeType.START]: 'Nodo Inizio',
      [NodeType.END]: 'Nodo Fine',
      [NodeType.INPUT]: 'Configura Input',
      [NodeType.OUTPUT]: 'Configura Output',
      [NodeType.PROCESS]: 'Configura Assegnazione',
      [NodeType.DECISION]: 'Configura Decisione',
      [NodeType.WHILE]: 'Configura Ciclo Mentre',
      [NodeType.FOR]: 'Configura Ciclo Per',
    };
    return typeLabels[nodeData.type] || 'Configura Nodo';
  };

  const isReadOnly = nodeData.type === NodeType.START || nodeData.type === NodeType.END;

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => closeModal('nodeEdit')}
      title={getTitle()}
      size="md"
    >
      {renderForm()}

      {!isReadOnly && (
        <ModalFooter>
          <Button
            variant="secondary"
            onClick={() => closeModal('nodeEdit')}
          >
            Annulla
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
          >
            Salva
          </Button>
        </ModalFooter>
      )}
    </Modal>
  );
}
