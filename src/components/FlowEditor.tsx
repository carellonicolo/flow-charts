import React, { useRef, useCallback } from 'react';
import ReactFlow, {
    ReactFlowProvider,
    addEdge,
    Controls,
    Background,
    type Connection,
    type Edge,
    type Node,
    type OnNodesChange,
    type OnEdgesChange,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { nodeTypes } from '../nodes';

let id = 0;
const getId = () => `dndnode_${id++}`;

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

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds: Edge[]) => addEdge({ ...params, type: 'smoothstep', animated: true }, eds)),
        [setEdges],
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

    // Apply highlighting
    const styledNodes = nodes.map((node: Node) => ({
        ...node,
        style: {
            ...node.style,
            border: node.id === highlightedNodeId ? '2px solid #ec4899' : 'none',
            boxShadow: node.id === highlightedNodeId ? '0 0 20px #ec4899' : 'none',
            transition: 'all 0.3s ease'
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
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onInit={setReactFlowInstance}
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    onNodeClick={(event, node: Node) => onNodeClick?.(event, node)}
                    onPaneClick={onPaneClick}
                    nodeTypes={nodeTypes}
                    defaultEdgeOptions={{ type: 'smoothstep', animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } }}
                    fitView
                >
                    <Controls />
                    <Background color={bgOptions.color} gap={bgOptions.gap} size={bgOptions.size} />
                </ReactFlow>
            </div>
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
