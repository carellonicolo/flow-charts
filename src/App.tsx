```javascript
import React, { useState, useRef, useEffect } from 'react';
import { useNodesState, useEdgesState } from 'reactflow';
import { Moon, Sun, Play, Menu, Terminal } from 'lucide-react';
import { FlowEditor } from './components/FlowEditor';
import { Console } from './components/Console';
import { PropertiesPanel } from './components/PropertiesPanel';
import { Sidebar } from './components/Sidebar';
import { Executor } from './engine/Executor';
import './styles/main.css';

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [highlightedNodeId, setHighlightedNodeId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [isWaitingForInput, setIsWaitingForInput] = useState(false);
  
  // Mobile states
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const executorRef = useRef<Executor | null>(null);
  const consoleRef = useRef<any>(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const handleRun = async () => {
    setLogs(['Starting execution...']);
    setHighlightedNodeId(null);
    setIsWaitingForInput(false);
    // Open console on mobile when running
    setIsConsoleOpen(true);

    // Executor signature: nodes, edges, logCallback, requestInput, setHighlight
    executorRef.current = new Executor(
      nodes,
      edges,
      (log) => setLogs(prev => [...prev, log]),
      async (msg) => {
        setIsWaitingForInput(true);
        setIsConsoleOpen(true); // Ensure console is open for input
        // We need to wait for input. Console component handles the UI.
        // We return a promise that resolves when input is provided.
        // The Console component doesn't have a direct "requestInput" method exposed via ref in the previous code?
        // Let's check Console.tsx content from previous steps or assume we need to implement it.
        // Actually, in step 393 I tried to use consoleRef.current.requestInput.
        // If Console is forwardRef, we can expose methods.
        return new Promise<string>((resolve) => {
          if (consoleRef.current) {
            consoleRef.current.requestInput(resolve);
          } else {
            // Fallback if ref is not working
            const val = window.prompt(msg);
            resolve(val || '');
          }
        });
      },
      (nodeId) => setHighlightedNodeId(nodeId)
    );

    try {
      await executorRef.current.execute();
      setLogs(prev => [...prev, 'Execution finished.']);
    } catch (error: any) {
      setLogs(prev => [...prev, `Error: ${ error.message } `]);
    } finally {
      setHighlightedNodeId(null);
      setIsWaitingForInput(false);
    }
  };

  const handleInput = (value: string) => {
    if (consoleRef.current) {
      consoleRef.current.handleInputChange(value);
    }
    setIsWaitingForInput(false);
  };

  const onNodeClick = (_: React.MouseEvent, node: any) => {
    setSelectedNodeId(node.id);
  };

  const onPaneClick = () => {
    setSelectedNodeId(null);
    // Close mobile panels when clicking on the canvas
    if (window.innerWidth <= 768) {
      setIsSidebarOpen(false);
      setIsConsoleOpen(false);
    }
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const loadExample = (exampleName: string) => {
    let newNodes: any[] = [];
    let newEdges: any[] = [];

    if (exampleName === 'hello') {
      newNodes = [
        { id: '1', type: 'start', position: { x: 250, y: 50 }, data: { label: 'Start' } },
        { id: '2', type: 'output', position: { x: 250, y: 200 }, data: { label: 'Hello World', expression: '"Hello World"' } },
        { id: '3', type: 'end', position: { x: 250, y: 350 }, data: { label: 'End' } },
      ];
      newEdges = [
        { id: 'e1-2', source: '1', target: '2', type: 'smoothstep', animated: true },
        { id: 'e2-3', source: '2', target: '3', type: 'smoothstep', animated: true },
      ];
    } else if (exampleName === 'counter') {
      newNodes = [
        { id: '1', type: 'start', position: { x: 250, y: 20 }, data: { label: 'Start' } },
        { id: '2', type: 'process', position: { x: 250, y: 120 }, data: { label: 'i = 1', variableName: 'i', expression: '1' } },
        { id: '3', type: 'decision', position: { x: 250, y: 220 }, data: { label: 'i <= 5', condition: 'i <= 5' } },
        { id: '4', type: 'output', position: { x: 250, y: 350 }, data: { label: 'Print i', expression: 'i' } },
        { id: '5', type: 'process', position: { x: 250, y: 450 }, data: { label: 'i = i + 1', variableName: 'i', expression: 'i + 1' } },
        { id: '6', type: 'end', position: { x: 500, y: 220 }, data: { label: 'End' } },
      ];
      newEdges = [
        { id: 'e1-2', source: '1', target: '2', type: 'smoothstep', animated: true },
        { id: 'e2-3', source: '2', target: '3', type: 'smoothstep', animated: true },
        { id: 'e3-4', source: '3', target: '4', sourceHandle: 'true', type: 'smoothstep', animated: true, label: 'True' },
        { id: 'e4-5', source: '4', target: '5', type: 'smoothstep', animated: true },
        { id: 'e5-3', source: '5', target: '3', type: 'smoothstep', animated: true },
        { id: 'e3-6', source: '3', target: '6', sourceHandle: 'false', type: 'smoothstep', animated: true, label: 'False' },
      ];
    }

    setNodes(newNodes);
    setEdges(newEdges);
  };

  const selectedNode = nodes.find(n => n.id === selectedNodeId) || null;

  return (
    <div className="app-container" data-theme={theme}>
      <div className="main-content">
        <div className={`sidebar - wrapper ${ isSidebarOpen ? 'open' : '' } `}>
          <Sidebar />
        </div>
        
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
          <div className="top-controls">
            {/* Mobile Menu Toggle */}
            <button 
              className="btn btn-icon mobile-only" 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              title="Toggle Menu"
            >
              <Menu size={20} />
            </button>

            <select
              onChange={(e) => {
                if (e.target.value) loadExample(e.target.value);
              }}
              className="example-select"
              defaultValue=""
            >
              <option value="" disabled>Load Example...</option>
              <option value="hello">Hello World</option>
              <option value="counter">Loop 1 to 5</option>
            </select>

            <button className="btn btn-primary" onClick={handleRun} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Play size={16} /> <span className="desktop-only">Run Flow</span>
            </button>

            {/* Mobile Console Toggle */}
            <button 
              className={`btn btn - icon mobile - only ${ isConsoleOpen ? 'active' : '' } `}
              onClick={() => setIsConsoleOpen(!isConsoleOpen)}
              title="Toggle Console"
              style={{ color: isConsoleOpen ? 'var(--primary-color)' : 'inherit' }}
            >
              <Terminal size={20} />
            </button>

            <button
              onClick={toggleTheme}
              className="btn btn-icon"
              title="Toggle Theme"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
          </div>
          
          <FlowEditor
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            setEdges={setEdges}
            setNodes={setNodes}
            highlightedNodeId={highlightedNodeId}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            theme={theme}
          />
          
          <div className={`console - container ${ isConsoleOpen ? 'open' : '' } `}>
            <Console
              ref={consoleRef}
              logs={logs}
              onInput={handleInput}
              isWaitingForInput={isWaitingForInput}
            />
          </div>
        </div>
      </div>
      {selectedNode && (
        <PropertiesPanel
          selectedNode={selectedNode}
          onClose={() => setSelectedNodeId(null)}
          onUpdateNode={(id: string, data: any) => {
            setNodes((nds) => nds.map((node) => {
              if (node.id === id) {
                return { ...node, data: { ...node.data, ...data } };
              }
              return node;
            }));
            setSelectedNodeId(null);
          }}
        />
      )}
    </div>
  );
}

export default App;
