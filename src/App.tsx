import { useState, useCallback, useRef } from 'react';
import type { Node, Edge } from 'reactflow';
import Sidebar from './components/Sidebar';
import FlowChartEditor from './components/FlowChartEditor';
import PseudoCodePanel from './components/PseudoCodePanel';
import ExecutionPanel from './components/ExecutionPanel';
import type { FlowChartNodeData, ExecutionState } from './types/flowchart';
import { FlowChartInterpreter } from './utils/interpreter';
import { BookOpen, Download, Upload } from 'lucide-react';

function App() {
  const [nodes, setNodes] = useState<Node<FlowChartNodeData>[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [executionState, setExecutionState] = useState<ExecutionState>({
    variables: {},
    output: [],
    currentNodeId: null,
    isRunning: false,
    isPaused: false,
  });
  const [showExamples, setShowExamples] = useState(false);
  const interpreterRef = useRef<FlowChartInterpreter | null>(null);

  const handleNodesChange = useCallback((newNodes: Node<FlowChartNodeData>[]) => {
    setNodes(newNodes);
  }, [setNodes]);

  const handleEdgesChange = useCallback((newEdges: Edge[]) => {
    setEdges(newEdges);
  }, [setEdges]);

  const handleRun = useCallback(async () => {
    if (nodes.length === 0) {
      alert('Aggiungi almeno un blocco al flow chart!');
      return;
    }

    const interpreter = new FlowChartInterpreter(nodes, edges, setExecutionState);

    // Configura il callback per l'input
    interpreter.setInputCallback(async () => {
      return new Promise<string>((resolve) => {
        const value = prompt('Inserisci un valore:');
        resolve(value || '');
      });
    });

    interpreterRef.current = interpreter;

    try {
      await interpreter.start();
    } catch (error) {
      console.error('Errore durante l\'esecuzione:', error);
    }
  }, [nodes, edges]);

  const handlePause = useCallback(() => {
    interpreterRef.current?.pause();
  }, []);

  const handleResume = useCallback(() => {
    interpreterRef.current?.resume();
  }, []);

  const handleStop = useCallback(() => {
    interpreterRef.current?.stop();
  }, []);

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
          setNodes(data.nodes || []);
          setEdges(data.edges || []);
        } catch (error) {
          alert('Errore nel caricamento del file');
          console.error(error);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, []);

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold">FlowChart Learning Studio</h1>
              <p className="text-sm text-indigo-100">
                Impara la programmazione con i flow chart e il pseudocodice
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowExamples(!showExamples)}
              className="flex items-center gap-2 px-4 py-2 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors font-medium"
            >
              <BookOpen className="w-4 h-4" />
              Esempi
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-400 transition-colors font-medium"
            >
              <Download className="w-4 h-4" />
              Salva
            </button>
            <button
              onClick={handleLoad}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-400 transition-colors font-medium"
            >
              <Upload className="w-4 h-4" />
              Carica
            </button>
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
              executionState={executionState}
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
            currentNodeId={executionState.currentNodeId}
          />
        </div>
      </div>

      {/* Modal esempi */}
      {showExamples && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">
                  📚 Esempi di Flow Chart
                </h2>
                <button
                  onClick={() => setShowExamples(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-bold text-blue-900 mb-2">
                  🎯 Suggerimento per iniziare
                </h3>
                <p className="text-sm text-blue-800">
                  Ogni flow chart deve iniziare con un blocco <strong>Inizio</strong> e
                  terminare con un blocco <strong>Fine</strong>. Trascina i blocchi dalla
                  sidebar a sinistra e collegali trascinando dalle maniglie.
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-bold text-green-900 mb-2">
                  💡 Doppio Click per Modificare
                </h3>
                <p className="text-sm text-green-800">
                  Fai doppio click su qualsiasi blocco per modificarne i parametri
                  (variabili, condizioni, espressioni, ecc.)
                </p>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="font-bold text-purple-900 mb-2">
                  ⚡ Esempio: Somma di Due Numeri
                </h3>
                <ol className="text-sm text-purple-800 space-y-1 list-decimal list-inside">
                  <li>Aggiungi un blocco <strong>Inizio</strong></li>
                  <li>Aggiungi un blocco <strong>Input</strong> per "a"</li>
                  <li>Aggiungi un blocco <strong>Input</strong> per "b"</li>
                  <li>Aggiungi un blocco <strong>Assegnazione</strong>: "somma = a + b"</li>
                  <li>Aggiungi un blocco <strong>Output</strong>: "somma"</li>
                  <li>Aggiungi un blocco <strong>Fine</strong></li>
                  <li>Collega tutti i blocchi in sequenza</li>
                  <li>Premi <strong>Esegui</strong>!</li>
                </ol>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h3 className="font-bold text-orange-900 mb-2">
                  🔄 Esempio: Conta fino a 10
                </h3>
                <ol className="text-sm text-orange-800 space-y-1 list-decimal list-inside">
                  <li>Aggiungi un blocco <strong>Inizio</strong></li>
                  <li>Aggiungi un blocco <strong>Ciclo Per</strong> (i da 1 a 10 passo 1)</li>
                  <li>Aggiungi un blocco <strong>Output</strong>: "i"</li>
                  <li>Collega il ciclo all'output e l'output torna al ciclo</li>
                  <li>Aggiungi un blocco <strong>Fine</strong> dopo il ciclo</li>
                  <li>Premi <strong>Esegui</strong>!</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
