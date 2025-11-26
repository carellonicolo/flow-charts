import { NodeType } from '../types/flowchart';
import {
  Circle,
  Square,
  Diamond,
  ArrowDownToLine,
  ArrowUpFromLine,
  RefreshCw,
  RotateCw,
} from 'lucide-react';

interface NodeTemplate {
  type: NodeType;
  label: string;
  icon: React.ReactElement;
  description: string;
  color: string;
}

const nodeTemplates: NodeTemplate[] = [
  {
    type: NodeType.START,
    label: 'Inizio',
    icon: <Circle className="w-5 h-5" />,
    description: 'Punto di partenza del programma',
    color: 'bg-green-100 border-green-500 hover:bg-green-200',
  },
  {
    type: NodeType.END,
    label: 'Fine',
    icon: <Circle className="w-5 h-5" />,
    description: 'Punto di fine del programma',
    color: 'bg-red-100 border-red-500 hover:bg-red-200',
  },
  {
    type: NodeType.INPUT,
    label: 'Input',
    icon: <ArrowDownToLine className="w-5 h-5" />,
    description: 'Leggi un valore dall\'utente',
    color: 'bg-blue-100 border-blue-500 hover:bg-blue-200',
  },
  {
    type: NodeType.OUTPUT,
    label: 'Output',
    icon: <ArrowUpFromLine className="w-5 h-5" />,
    description: 'Mostra un valore all\'utente',
    color: 'bg-purple-100 border-purple-500 hover:bg-purple-200',
  },
  {
    type: NodeType.PROCESS,
    label: 'Assegnazione',
    icon: <Square className="w-5 h-5" />,
    description: 'Assegna un valore a una variabile',
    color: 'bg-yellow-100 border-yellow-500 hover:bg-yellow-200',
  },
  {
    type: NodeType.DECISION,
    label: 'Decisione',
    icon: <Diamond className="w-5 h-5" />,
    description: 'Se-Altrimenti condizionale',
    color: 'bg-orange-100 border-orange-500 hover:bg-orange-200',
  },
  {
    type: NodeType.WHILE,
    label: 'Ciclo Mentre',
    icon: <RefreshCw className="w-5 h-5" />,
    description: 'Ripeti mentre la condizione è vera',
    color: 'bg-pink-100 border-pink-500 hover:bg-pink-200',
  },
  {
    type: NodeType.FOR,
    label: 'Ciclo Per',
    icon: <RotateCw className="w-5 h-5" />,
    description: 'Ripeti per un numero di volte',
    color: 'bg-pink-100 border-pink-500 hover:bg-pink-200',
  },
];

export default function Sidebar() {
  const onDragStart = (event: React.DragEvent, nodeType: NodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      className="w-64 border-r p-4 overflow-y-auto transition-theme"
      style={{
        background: 'var(--bg-elevated)',
        borderColor: 'var(--border-primary)',
      }}
    >
      <h2
        className="text-lg font-bold mb-4 transition-theme"
        style={{ color: 'var(--text-primary)' }}
      >
        📦 Blocchi
      </h2>

      <p
        className="text-xs mb-4 transition-theme"
        style={{ color: 'var(--text-secondary)' }}
      >
        Trascina i blocchi nel canvas
      </p>

      <div className="space-y-2">
        {nodeTemplates.map((template) => (
          <div
            key={template.type}
            className={`${template.color} border-2 rounded-lg p-3 cursor-move transition-all hover:shadow-md`}
            draggable
            onDragStart={(e) => onDragStart(e, template.type)}
          >
            <div className="flex items-center gap-2 mb-1">
              {template.icon}
              <span className="font-semibold text-sm">{template.label}</span>
            </div>
            <p className="text-xs text-gray-600">{template.description}</p>
          </div>
        ))}
      </div>

      <div
        className="mt-6 p-3 border rounded-lg transition-theme"
        style={{
          background: 'var(--bg-secondary)',
          borderColor: 'var(--border-primary)',
        }}
      >
        <h3
          className="text-sm font-bold mb-2 transition-theme"
          style={{ color: 'var(--text-primary)' }}
        >
          💡 Suggerimento
        </h3>
        <p
          className="text-xs transition-theme"
          style={{ color: 'var(--text-secondary)' }}
        >
          Doppio click su un blocco per modificarlo
        </p>
      </div>
    </div>
  );
}
