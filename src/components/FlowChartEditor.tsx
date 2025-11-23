import { useCallback, useRef, useState, useEffect } from 'react';
import ReactFlow, {
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  BackgroundVariant,
} from 'reactflow';
import type {
  Node,
  Edge,
  Connection,
  NodeTypes,
  ReactFlowInstance,
  NodeChange,
  EdgeChange,
} from 'reactflow';
import CustomNode from './nodes/CustomNode';
import type { FlowChartNodeData } from '../types/flowchart';
import { NodeType } from '../types/flowchart';

const nodeTypes: NodeTypes = {
  custom: CustomNode,
};

interface FlowChartEditorProps {
  onNodesChange: (nodes: Node<FlowChartNodeData>[]) => void;
  onEdgesChange: (edges: Edge[]) => void;
}

let nodeId = 0;
const getId = () => `node_${nodeId++}`;

export default function FlowChartEditor({ onNodesChange, onEdgesChange }: FlowChartEditorProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChangeHandler] = useNodesState<FlowChartNodeData>([]);
  const [edges, setEdges, onEdgesChangeHandler] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

  // Notifica il componente padre quando cambiano i nodi
  useEffect(() => {
    onNodesChange(nodes);
  }, [nodes, onNodesChange]);

  // Notifica il componente padre quando cambiano gli edges
  useEffect(() => {
    onEdgesChange(edges);
  }, [edges, onEdgesChange]);

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      onNodesChangeHandler(changes);
    },
    [onNodesChangeHandler]
  );

  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      onEdgesChangeHandler(changes);
    },
    [onEdgesChangeHandler]
  );

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            animated: true,
            style: { stroke: '#64748b', strokeWidth: 2 },
          },
          eds
        )
      );
    },
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      if (!reactFlowWrapper.current || !reactFlowInstance) {
        return;
      }

      const nodeType = event.dataTransfer.getData('application/reactflow') as NodeType;
      if (!nodeType) {
        return;
      }

      const bounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = reactFlowInstance.project({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      });

      const newNode: Node<FlowChartNodeData> = {
        id: getId(),
        type: 'custom',
        position,
        data: createNodeData(nodeType),
      };

      setNodes((nds) => [...nds, newNode]);
    },
    [reactFlowInstance, setNodes]
  );

  const onNodeDoubleClick = useCallback(
    (_event: React.MouseEvent, node: Node<FlowChartNodeData>) => {
      const data = node.data;
      let newData: FlowChartNodeData | null = null;

      switch (data.type) {
        case NodeType.INPUT:
          const inputVar = prompt('Nome della variabile da leggere:', data.variable || '');
          if (inputVar !== null) {
            newData = { ...data, variable: inputVar };
          }
          break;

        case NodeType.OUTPUT:
          const outputExpr = prompt('Espressione da stampare:', data.expression || '');
          if (outputExpr !== null) {
            newData = { ...data, expression: outputExpr };
          }
          break;

        case NodeType.PROCESS:
          const processExpr = prompt(
            'Assegnazione (es: x = 5 + 3):',
            data.expression || ''
          );
          if (processExpr !== null) {
            newData = { ...data, expression: processExpr };
          }
          break;

        case NodeType.DECISION:
          const condition = prompt('Condizione (es: x > 5):', data.condition || '');
          if (condition !== null) {
            newData = { ...data, condition };
          }
          break;

        case NodeType.WHILE:
          const whileCondition = prompt('Condizione (es: x < 10):', data.condition || '');
          if (whileCondition !== null) {
            newData = { ...data, condition: whileCondition };
          }
          break;

        case NodeType.FOR:
          const loopVar = prompt('Variabile del ciclo:', data.loopVariable || 'i');
          if (loopVar !== null) {
            const start = prompt('Valore iniziale:', data.loopStart || '1');
            if (start !== null) {
              const end = prompt('Valore finale:', data.loopEnd || '10');
              if (end !== null) {
                const step = prompt('Passo:', data.loopStep || '1');
                if (step !== null) {
                  newData = {
                    ...data,
                    loopVariable: loopVar,
                    loopStart: start,
                    loopEnd: end,
                    loopStep: step,
                  };
                }
              }
            }
          }
          break;
      }

      if (newData) {
        setNodes((nds) =>
          nds.map((n) => (n.id === node.id ? { ...n, data: newData } : n))
        );
      }
    },
    [setNodes]
  );

  return (
    <div ref={reactFlowWrapper} className="flex-1 bg-gray-50">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeDoubleClick={onNodeDoubleClick}
        onInit={setReactFlowInstance}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
        <Controls />
      </ReactFlow>

      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center bg-white p-8 rounded-lg shadow-lg border-2 border-dashed border-gray-300">
            <h3 className="text-xl font-bold text-gray-700 mb-2">
              👋 Inizia qui!
            </h3>
            <p className="text-gray-600">
              Trascina i blocchi dalla sidebar per creare il tuo flow chart
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Doppio click su un blocco per modificarlo
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Crea i dati iniziali per un nuovo nodo
 */
function createNodeData(type: NodeType): FlowChartNodeData {
  const baseData: FlowChartNodeData = {
    label: '',
    type,
  };

  switch (type) {
    case NodeType.INPUT:
      return { ...baseData, variable: 'x', label: 'Leggi x' };

    case NodeType.OUTPUT:
      return { ...baseData, expression: 'x', label: 'Scrivi x' };

    case NodeType.PROCESS:
      return { ...baseData, expression: 'x = 0', label: 'x = 0' };

    case NodeType.DECISION:
      return { ...baseData, condition: 'x > 0', label: 'x > 0?' };

    case NodeType.WHILE:
      return { ...baseData, condition: 'x < 10', label: 'Mentre x < 10' };

    case NodeType.FOR:
      return {
        ...baseData,
        loopVariable: 'i',
        loopStart: '1',
        loopEnd: '10',
        loopStep: '1',
        label: 'Per i da 1 a 10',
      };

    default:
      return baseData;
  }
}
