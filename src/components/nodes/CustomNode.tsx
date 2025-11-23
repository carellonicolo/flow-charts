import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import type { FlowChartNodeData } from '../../types/flowchart';
import { NodeType } from '../../types/flowchart';

/**
 * Componente per i nodi custom del flow chart
 * Ogni tipo di nodo ha un design specifico
 */
const CustomNode = memo(({ data, selected }: NodeProps<FlowChartNodeData>) => {
  const getNodeStyle = () => {
    const baseClasses = 'px-4 py-3 rounded-lg border-2 shadow-md transition-all min-w-[140px] text-center font-medium';
    const selectedClasses = selected ? 'ring-4 ring-blue-300' : '';

    switch (data.type) {
      case NodeType.START:
        return `${baseClasses} ${selectedClasses} bg-green-100 border-green-500 rounded-full`;

      case NodeType.END:
        return `${baseClasses} ${selectedClasses} bg-red-100 border-red-500 rounded-full`;

      case NodeType.INPUT:
        return `${baseClasses} ${selectedClasses} bg-blue-100 border-blue-500 transform skew-x-[-20deg]`;

      case NodeType.OUTPUT:
        return `${baseClasses} ${selectedClasses} bg-purple-100 border-purple-500 transform skew-x-[-20deg]`;

      case NodeType.PROCESS:
        return `${baseClasses} ${selectedClasses} bg-yellow-100 border-yellow-500`;

      case NodeType.DECISION:
        return `${baseClasses} ${selectedClasses} bg-orange-100 border-orange-500 transform rotate-45`;

      case NodeType.WHILE:
      case NodeType.FOR:
        return `${baseClasses} ${selectedClasses} bg-pink-100 border-pink-500 rounded-xl`;

      default:
        return `${baseClasses} ${selectedClasses} bg-gray-100 border-gray-500`;
    }
  };

  const getContent = () => {
    // Per il nodo decisione, il contenuto deve essere ruotato al contrario
    const contentClasses = data.type === NodeType.DECISION ? 'transform -rotate-45' : '';

    return (
      <div className={contentClasses}>
        <div className="text-xs font-bold text-gray-600 mb-1">
          {getNodeTypeLabel(data.type)}
        </div>
        <div className="text-sm text-gray-800">
          {getNodeContent(data)}
        </div>
      </div>
    );
  };

  const showTopHandle = data.type !== NodeType.START;
  const showBottomHandle = data.type !== NodeType.END;

  return (
    <div className={getNodeStyle()}>
      {showTopHandle && (
        <Handle
          type="target"
          position={Position.Top}
          className="w-3 h-3 !bg-gray-500"
        />
      )}

      {getContent()}

      {showBottomHandle && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="w-3 h-3 !bg-gray-500"
        />
      )}

      {/* Handle speciali per i nodi di decisione e loop */}
      {(data.type === NodeType.DECISION ||
        data.type === NodeType.WHILE) && (
        <>
          <Handle
            type="source"
            position={Position.Right}
            id="true"
            className="w-3 h-3 !bg-green-500"
          />
          <Handle
            type="source"
            position={Position.Left}
            id="false"
            className="w-3 h-3 !bg-red-500"
          />
        </>
      )}
    </div>
  );
});

CustomNode.displayName = 'CustomNode';

/**
 * Ottiene l'etichetta del tipo di nodo
 */
function getNodeTypeLabel(type: NodeType): string {
  const labels: Record<NodeType, string> = {
    [NodeType.START]: 'INIZIO',
    [NodeType.END]: 'FINE',
    [NodeType.INPUT]: 'INPUT',
    [NodeType.OUTPUT]: 'OUTPUT',
    [NodeType.PROCESS]: 'PROCESSO',
    [NodeType.DECISION]: 'DECISIONE',
    [NodeType.WHILE]: 'MENTRE',
    [NodeType.FOR]: 'PER',
  };
  return labels[type];
}

/**
 * Ottiene il contenuto del nodo
 */
function getNodeContent(data: FlowChartNodeData): string {
  switch (data.type) {
    case NodeType.START:
      return 'Start';

    case NodeType.END:
      return 'End';

    case NodeType.INPUT:
      return data.variable || 'Leggi variabile';

    case NodeType.OUTPUT:
      return data.expression || 'Scrivi valore';

    case NodeType.PROCESS:
      return data.expression || 'x = valore';

    case NodeType.DECISION:
      return data.condition || 'condizione?';

    case NodeType.WHILE:
      return `Mentre ${data.condition || 'condizione'}`;

    case NodeType.FOR:
      const loopVar = data.loopVariable || 'i';
      const start = data.loopStart || '1';
      const end = data.loopEnd || '10';
      return `${loopVar}: ${start}→${end}`;

    default:
      return data.label;
  }
}

export default CustomNode;
