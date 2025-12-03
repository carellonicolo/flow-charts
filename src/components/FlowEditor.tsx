import React, { useRef, useCallback, useMemo } from 'react';
import ReactFlow, {
    ReactFlowProvider,
    addEdge,
    Background,
    type Connection,
    type Edge,
    type Node,
    type OnNodesChange,
    type OnEdgesChange,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { nodeTypes } from '../nodes';
import { validateConnection } from '../utils/edgeValidation';
import { Toast } from './Toast';

let id = 0;
const getId = () => `dndnode_${id++}`;

const defaultEdgeOptions = {
    type: 'smoothstep',
    animated: true,
    style: { stroke: '#6366f1', strokeWidth: 2 }
};

const proOptions = { hideAttribution: true };

interface FlowEditorProps {
    nodes: Node[];
    edges: Edge[];
    onNodesChange: OnNodesChange;
    onEdgesChange: OnEdgesChange;
    setEdges: (edges: any) => void;
    setNodes: (nodes: any) => void;
    highlightedNodeId: string | null;
    onNodeClick?: (event: React.MouseEvent, node: Node) => void;
    onPaneClick?: (event: React.MouseEvent) => void;
    theme?: 'dark' | 'light';
}

const FlowEditorContent = ({
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    setEdges,
    setNodes,
    highlightedNodeId,
    onNodeClick,
    onPaneClick,
    theme = 'dark'
}: FlowEditorProps) => {
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const [reactFlowInstance, setReactFlowInstance] = React.useState<any>(null);
    const [toastMessage, setToastMessage] = React.useState<string | null>(null);

    // Memoize nodeTypes to prevent React Flow warnings
    const memoizedNodeTypes = useMemo(() => nodeTypes, []);

    const onConnect = useCallback(
        (params: Connection) => {
            // Valida la connessione
            const validation = validateConnection(
                params.source!,
                params.target!,
                params.sourceHandle || null,
                nodes,
                edges
            );

            if (!validation.valid) {
                // Mostra toast con messaggio di errore
                setToastMessage(validation.message || 'Connessione non valida');
                console.log('❌ Connessione rifiutata:', validation.message);
                return;
            }

            setEdges((eds: Edge[]) => addEdge({ ...params, type: 'smoothstep', animated: true }, eds));
        },
        [setEdges, edges, nodes],
    );

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();

            const type = event.dataTransfer.getData('application/reactflow');
            const label = event.dataTransfer.getData('application/reactflow/label');

            if (typeof type === 'undefined' || !type) {
                return;
            }

            const position = reactFlowInstance.screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            const newNode: Node = {
                id: getId(),
                type,
                position,
                data: { label: label },
            };

            setNodes((nds: Node[]) => nds.concat(newNode));
        },
        [reactFlowInstance, setNodes],
    );

    // Function to update node data (for editable nodes like Comment)
    const handleNodeDataChange = useCallback((nodeId: string, newData: any) => {
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === nodeId) {
                    return {
                        ...node,
                        data: { ...node.data, ...newData }
                    };
                }
                return node;
            })
        );
    }, [setNodes]);

    // Handle keyboard events for deleting selected edges
    React.useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Delete or Backspace key
            if (event.key === 'Delete' || event.key === 'Backspace') {
                // Don't delete if user is typing in an input/textarea
                const target = event.target as HTMLElement;
                if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
                    return;
                }

                // Remove selected edges
                setEdges((eds) => eds.filter((edge) => !edge.selected));

                // Also remove selected nodes
                setNodes((nds) => nds.filter((node) => !node.selected));
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [setEdges, setNodes]);

    // Apply highlighting (no transition for better drag performance)
    const styledNodes = nodes.map((node: Node) => ({
        ...node,
        data: {
            ...node.data,
            onChange: handleNodeDataChange
        },
        style: {
            ...node.style,
            border: node.id === highlightedNodeId ? '2px solid #ec4899' : 'none',
            boxShadow: node.id === highlightedNodeId ? '0 0 20px #ec4899' : 'none'
        }
    }));

    // Apply selection styling to edges
    const styledEdges = edges.map((edge: Edge) => ({
        ...edge,
        style: {
            ...edge.style,
            stroke: edge.selected ? '#ec4899' : '#6366f1',
            strokeWidth: edge.selected ? 3 : 2
        }
    }));

    const bgOptions = theme === 'dark'
        ? { color: '#334155', gap: 20, size: 1 } // Darker, subtle dots for dark mode
        : { color: '#cbd5e1', gap: 20, size: 1 }; // Very light gray dots for light mode

    return (
        <div className="dndflow" style={{ width: '100%', height: '100%', display: 'flex' }}>
            <div className="reactflow-wrapper" ref={reactFlowWrapper} style={{ flexGrow: 1, height: '100%' }}>
                <ReactFlow
                    nodes={styledNodes}
                    edges={styledEdges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onInit={setReactFlowInstance}
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    onNodeClick={(event, node: Node) => onNodeClick?.(event, node)}
                    onPaneClick={onPaneClick}
                    nodeTypes={memoizedNodeTypes}
                    defaultEdgeOptions={defaultEdgeOptions}
                    proOptions={proOptions}
                    panOnDrag={true}
                    panOnScroll={false}
                    zoomOnScroll={true}
                    zoomOnDoubleClick={false}
                    selectNodesOnDrag={false}
                    snapToGrid={false}
                    nodesDraggable={true}
                    elementsSelectable={true}
                    fitView
                >
                    <Background color={bgOptions.color} gap={bgOptions.gap} size={bgOptions.size} />
                </ReactFlow>
            </div>
            {toastMessage && (
                <Toast
                    message={toastMessage}
                    onClose={() => setToastMessage(null)}
                />
            )}
        </div>
    );
};

export const FlowEditor = (props: FlowEditorProps) => {
    return (
        <ReactFlowProvider>
            <FlowEditorContent {...props} />
        </ReactFlowProvider>
    );
};
