import { useCallback, useRef, useState, useEffect } from 'react';
import ReactFlow, {
  addEdge,
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
import NodeEditModal from './modals/NodeEditModal';
import type { FlowChartNodeData } from '../types/flowchart';
import { NodeType } from '../types/flowchart';
import { useFlowchartStore } from '../store/flowchartStore';
import { useUIStore } from '../store/uiStore';

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
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

  // Zustand stores
  const { nodes, edges, setNodes, setEdges, addNode } = useFlowchartStore();
  const { openModal } = useUIStore();

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
      // Applica i cambiamenti a ReactFlow
      const updatedNodes = changes.reduce((acc, change) => {
        if (change.type === 'remove') {
          return acc.filter((node) => node.id !== change.id);
        }
        if (change.type === 'position' && change.position) {
          return acc.map((node) =>
            node.id === change.id ? { ...node, position: change.position! } : node
          );
        }
        if (change.type === 'select') {
          return acc.map((node) =>
            node.id === change.id ? { ...node, selected: change.selected } : node
          );
        }
        return acc;
      }, nodes);

      if (updatedNodes !== nodes) {
        setNodes(updatedNodes);
      }
    },
    [nodes, setNodes]
  );

  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      // Applica i cambiamenti a ReactFlow
      const updatedEdges = changes.reduce((acc, change) => {
        if (change.type === 'remove') {
          return acc.filter((edge) => edge.id !== change.id);
        }
        if (change.type === 'select') {
          return acc.map((edge) =>
            edge.id === change.id ? { ...edge, selected: change.selected } : edge
          );
        }
        return acc;
      }, edges);

      if (updatedEdges !== edges) {
        setEdges(updatedEdges);
      }
    },
    [edges, setEdges]
  );

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge: Edge = {
        ...params,
        id: `edge_${params.source}_${params.target}_${Date.now()}`,
        animated: true,
        style: { stroke: 'var(--border-primary)', strokeWidth: 2 },
      };
      setEdges([...edges, newEdge]);
    },
    [edges, setEdges]
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

      addNode(newNode);
    },
    [reactFlowInstance, addNode]
  );

  /**
   * Doppio click su nodo - Apre NodeEditModal (NO PIÙ PROMPT!)
   */
  const onNodeDoubleClick = useCallback(
    (_event: React.MouseEvent, node: Node<FlowChartNodeData>) => {
      openModal('nodeEdit', { nodeId: node.id });
    },
    [openModal]
  );

  return (
    <>
      <div ref={reactFlowWrapper} className="flex-1 transition-theme" style={{ background: 'var(--bg-secondary)' }}>
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
            <div
              className="text-center p-8 rounded-xl shadow-lg border-2 border-dashed transition-theme"
              style={{
                background: 'var(--bg-elevated)',
                borderColor: 'var(--border-primary)',
              }}
            >
              <h3
                className="text-xl font-bold mb-2 transition-theme"
                style={{ color: 'var(--text-primary)' }}
              >
                👋 Inizia qui!
              </h3>
              <p
                className="transition-theme"
                style={{ color: 'var(--text-secondary)' }}
              >
                Trascina i blocchi dalla sidebar per creare il tuo flow chart
              </p>
              <p
                className="text-sm mt-2 transition-theme"
                style={{ color: 'var(--text-tertiary)' }}
              >
                Doppio click su un blocco per modificarlo
              </p>
            </div>
          </div>
        )}
      </div>

      {/* NodeEditModal - Sostituisce prompt() */}
      <NodeEditModal />
    </>
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
