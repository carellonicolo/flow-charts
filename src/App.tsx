import { useCallback, useRef } from 'react';
import type { Node, Edge } from 'reactflow';
import Sidebar from './components/Sidebar';
import FlowChartEditor from './components/FlowChartEditor';
import PseudoCodePanel from './components/PseudoCodePanel';
import ExecutionPanel from './components/ExecutionPanel';
import type { FlowChartNodeData } from './types/flowchart';
import { FlowChartInterpreter } from './utils/interpreter';
import { BookOpen, Download, Upload, Moon, Sun } from 'lucide-react';
import { useFlowchartStore } from './store/flowchartStore';
import { useExecutionStore } from './store/executionStore';
import { useUIStore } from './store/uiStore';
import { IconButton } from './components/ui';

function App() {
  const interpreterRef = useRef<FlowChartInterpreter | null>(null);

  // Zustand stores
  const { nodes, edges, loadFlowchart } = useFlowchartStore();
  const executionStore = useExecutionStore();
  const { theme, toggleTheme } = useUIStore();

  const handleNodesChange = useCallback((newNodes: Node<FlowChartNodeData>[]) => {
    // Callback per compatibilità
  }, []);

  const handleEdgesChange = useCallback((newEdges: Edge[]) => {
    // Callback per compatibilità
  }, []);

  const handleRun = useCallback(async () => {
    if (nodes.length === 0) {
      alert('Aggiungi almeno un blocco al flow chart!');
      return;
    }

    // Crea interprete con execution store
    const interpreter = new FlowChartInterpreter(
      nodes,
      edges,
      (state) => {
        // Aggiorna execution store
        executionStore.setVariable('temp', state);
      }
    );

    // Configura callback input
    interpreter.setInputCallback(async () => {
      return new Promise<string>((resolve) => {
        const value = prompt('Inserisci un valore:');
        resolve(value || '');
      });
    });

    interpreterRef.current = interpreter;

    try {
      executionStore.start();
      await interpreter.start();
    } catch (error) {
      console.error('Errore durante l\'esecuzione:', error);
      executionStore.setError(error instanceof Error ? error.message : 'Errore sconosciuto');
    }
  }, [nodes, edges, executionStore]);

  const handlePause = useCallback(() => {
    interpreterRef.current?.pause();
    executionStore.pause();
  }, [executionStore]);

  const handleResume = useCallback(() => {
    interpreterRef.current?.resume();
    executionStore.resume();
  }, [executionStore]);

  const handleStop = useCallback(() => {
    interpreterRef.current?.stop();
    executionStore.stop();
  }, [executionStore]);

  const handleSave = useCallback(() => {
    const data = {
      nodes,
      edges,
      version: '1.0',
      timestamp: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flowchart-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [nodes, edges]);

  const handleLoad = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          loadFlowchart(data.nodes || [], data.edges || []);
        } catch (error) {
          alert('Errore nel caricamento del file');
          console.error(error);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, [loadFlowchart]);

  return (
    <div className="flex flex-col h-screen transition-theme" style={{ background: 'var(--bg-secondary)' }}>
      {/* Header Apple-like - Minimal e elegante */}
      <header
        className="px-6 py-3 border-b transition-theme backdrop-blur"
        style={{
          background: 'var(--bg-elevated)',
          borderColor: 'var(--border-primary)',
        }}
      >
        <div className="flex items-center justify-between">
          {/* Logo e titolo */}
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center transition-theme"
              style={{ background: 'var(--accent-blue)' }}
            >
              <span className="text-xl">📊</span>
            </div>
            <div>
              <h1
                className="text-lg font-semibold transition-theme"
                style={{ color: 'var(--text-primary)' }}
              >
                FlowChart Learning Studio
              </h1>
              <p
                className="text-xs transition-theme"
                style={{ color: 'var(--text-secondary)' }}
              >
                Impara la programmazione visivamente
              </p>
            </div>
          </div>

          {/* Azioni header */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className="px-3 py-1.5 text-sm font-medium rounded-lg transition-fast hover-scale"
              style={{
                background: 'transparent',
                color: 'var(--text-primary)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--bg-secondary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <Download className="w-4 h-4 inline mr-1.5" />
              Salva
            </button>

            <button
              onClick={handleLoad}
              className="px-3 py-1.5 text-sm font-medium rounded-lg transition-fast hover-scale"
              style={{
                background: 'transparent',
                color: 'var(--text-primary)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--bg-secondary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <Upload className="w-4 h-4 inline mr-1.5" />
              Carica
            </button>

            <div
              className="w-px h-6 transition-theme"
              style={{ background: 'var(--border-primary)' }}
            />

            {/* Dark mode toggle */}
            <IconButton
              icon={theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              onClick={toggleTheme}
              aria-label="Toggle theme"
              variant="ghost"
            />
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar con blocchi */}
        <Sidebar />

        {/* Canvas flow chart */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1">
            <FlowChartEditor
              onNodesChange={handleNodesChange}
              onEdgesChange={handleEdgesChange}
            />
          </div>

          {/* Pannello esecuzione */}
          <div className="h-64">
            <ExecutionPanel
              executionState={{
                variables: executionStore.variables,
                output: executionStore.output,
                currentNodeId: executionStore.currentNodeId,
                isRunning: executionStore.isRunning,
                isPaused: executionStore.isPaused,
                error: executionStore.error,
              }}
              onRun={handleRun}
              onPause={handlePause}
              onResume={handleResume}
              onStop={handleStop}
            />
          </div>
        </div>

        {/* Pannello pseudocodice */}
        <div className="w-96">
          <PseudoCodePanel
            nodes={nodes}
            edges={edges}
            currentNodeId={executionStore.currentNodeId}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
