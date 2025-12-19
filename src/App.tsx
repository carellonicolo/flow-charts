import { useState, useRef, useEffect } from 'react';
import { ReactFlowProvider, useNodesState, useEdgesState } from 'reactflow';
import { toPng, toJpeg, toBlob } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { FlowEditor } from './components/FlowEditor';
import { Console } from './components/Console';
import { Sidebar, type HelpContent } from './components/Sidebar';
import { Header } from './components/Header';
import { HelpModal } from './components/HelpModal';
import { Toast } from './components/Toast';
import { Executor } from './engine/Executor';
import { validateFlowSyntax, formatValidationMessage } from './utils/flowValidation';
import './styles/main.css';

function AppContent() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as 'light' | 'dark') || 'dark';
  });
  const [colorTheme, setColorTheme] = useState<string>(() => {
    return localStorage.getItem('color-theme') || 'indigo';
  });
  const [highlightedNodeId, setHighlightedNodeId] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [isWaitingForInput, setIsWaitingForInput] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Help Modal states
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [helpModalTitle, setHelpModalTitle] = useState('');
  const [helpModalContent, setHelpModalContent] = useState<HelpContent | string>('');

  // Mobile states
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const executorRef = useRef<Executor | null>(null);
  const consoleRef = useRef<any>(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('color-theme', colorTheme);
  }, [colorTheme]);

  const handleStop = () => {
    if (executorRef.current) {
      executorRef.current.stop();
      setLogs(prev => [...prev, '⏹️ Esecuzione interrotta dall\'utente']);
    }
    setIsExecuting(false);
    setHighlightedNodeId(null);
    setIsWaitingForInput(false);
  };

  const handleRun = async () => {
    // Se già in esecuzione, ferma
    if (isExecuting) {
      handleStop();
      return;
    }

    // Valida il flowchart prima di eseguire
    const validation = validateFlowSyntax(nodes, edges);

    if (!validation.valid) {
      // Mostra errori di validazione
      const errorMessage = formatValidationMessage(validation);
      setValidationError(errorMessage);
      setLogs([errorMessage]);
      setIsConsoleOpen(true); // Mostra console con errori
      return;
    }

    // Se ci sono warning, mostrali nella console ma continua
    if (validation.warnings.length > 0) {
      const warningMessage = formatValidationMessage(validation);
      setLogs([warningMessage, '', 'Starting execution...']);
    } else {
      setLogs(['✅ Validazione superata!', 'Starting execution...']);
    }

    setIsExecuting(true);
    setHighlightedNodeId(null);
    setIsWaitingForInput(false);
    setValidationError(null);
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
      setLogs(prev => [...prev, '✅ Execution finished.']);
    } catch (error: any) {
      setLogs(prev => [...prev, `❌ Error: ${error.message}`]);
    } finally {
      setIsExecuting(false);
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

  const onPaneClick = () => {
    // Close mobile panels when clicking on the canvas
    if (window.innerWidth <= 768) {
      setIsSidebarOpen(false);
      setIsConsoleOpen(false);
    }
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleOpenHelp = (title: string, content: HelpContent | string) => {
    console.log('📖 App.handleOpenHelp chiamato:', title);
    setHelpModalTitle(title);
    setHelpModalContent(content);
    setHelpModalOpen(true);
    console.log('✅ Help modal state aggiornato');
  };

  const handleClear = () => {
    if (isExecuting) handleStop();
    setNodes([]);
    setEdges([]);
    setLogs(['🧹 Area di lavoro ripulita']);
  };

  const handleExport = async (format: 'pdf' | 'png' | 'jpeg') => {
    const flowElement = document.querySelector('.reactflow-wrapper') as HTMLElement;
    if (!flowElement) return;

    setLogs(prev => [...prev, `⚙️ Generazione ${format.toUpperCase()} in corso...`]);

    try {
      const options = {
        backgroundColor: theme === 'dark' ? '#0f172a' : '#f1f5f9',
        pixelRatio: 1.5,
        cacheBust: true,
      };

      if (format === 'pdf' || format === 'png') {
        const dataUrl = await toPng(flowElement, options);

        if (format === 'pdf') {
          const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'px',
            format: [flowElement.offsetWidth, flowElement.offsetHeight]
          });
          pdf.addImage(dataUrl, 'PNG', 0, 0, flowElement.offsetWidth, flowElement.offsetHeight);
          pdf.save('flow-chart.pdf');
        } else {
          const link = document.createElement('a');
          link.href = dataUrl;
          link.download = 'flow-chart.png';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } else if (format === 'jpeg') {
        const dataUrl = await toJpeg(flowElement, { ...options, quality: 0.9 });
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = 'flow-chart.jpg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      setLogs(prev => [...prev, `📄 ${format.toUpperCase()} scaricato con successo`]);
    } catch (error) {
      console.error(`Errore durante il download del ${format.toUpperCase()}:`, error);
      setLogs(prev => [...prev, `❌ Errore durante il download del ${format.toUpperCase()}`]);
    }
  };

  const handleDownloadPDF = () => handleExport('pdf');
  const handleDownloadPNG = () => handleExport('png');
  const handleDownloadJPEG = () => handleExport('jpeg');

  const handleStartExercise = (description: string) => {
    handleClear();
    const newNode = {
      id: `ex-comment-${Date.now()}`,
      type: 'comment',
      position: { x: 50, y: 50 },
      data: { label: `🎯 ESERCIZIO:\n${description}` }
    };
    setNodes([newNode]);
  };

  const loadExample = (exampleName: string) => {
    let newNodes: any[] = [];
    let newEdges: any[] = [];

    if (exampleName === 'hello') {
      newNodes = [
        { id: 'c1', type: 'comment', position: { x: 50, y: 50 }, data: { label: 'SCOPO:\nPrimo programma introduttivo.\nMostra output di testo.\n\nSCELTE:\n- Output diretto\n- Testo tra virgolette\n- Flusso lineare' } },
        { id: '1', type: 'start', position: { x: 300, y: 50 }, data: { label: 'Start' } },
        { id: '2', type: 'output', position: { x: 300, y: 200 }, data: { label: 'Hello World', expression: '"Hello World"' } },
        { id: '3', type: 'end', position: { x: 300, y: 350 }, data: { label: 'End' } },
      ];
      newEdges = [
        { id: 'e1-2', source: '1', target: '2', type: 'waypoint', data: { waypoints: [] }, animated: true },
        { id: 'e2-3', source: '2', target: '3', type: 'waypoint', data: { waypoints: [] }, animated: true },
      ];
    } else if (exampleName === 'counter') {
      newNodes = [
        { id: 'c1', type: 'comment', position: { x: 50, y: 20 }, data: { label: 'SCOPO:\nCiclo iterativo 1-5.\n\nSCELTE:\n- Contatore i=1\n- Condizione i<=5\n- Incremento i+1\n- False esce' } },
        { id: '1', type: 'start', position: { x: 300, y: 20 }, data: { label: 'Start' } },
        { id: '2', type: 'process', position: { x: 300, y: 120 }, data: { label: 'i = 1', variableName: 'i', expression: '1' } },
        { id: '3', type: 'decision', position: { x: 300, y: 240 }, data: { label: 'i <= 5', condition: 'i <= 5' } },
        { id: '4', type: 'output', position: { x: 300, y: 420 }, data: { label: 'Print i', expression: 'i' } },
        { id: '5', type: 'process', position: { x: 300, y: 550 }, data: { label: 'i = i + 1', variableName: 'i', expression: 'i + 1' } },
        { id: '6', type: 'end', position: { x: 580, y: 240 }, data: { label: 'End' } },
      ];
      newEdges = [
        { id: 'e1-2', source: '1', target: '2', type: 'waypoint', data: { waypoints: [] }, animated: true },
        { id: 'e2-3', source: '2', target: '3', type: 'waypoint', data: { waypoints: [] }, animated: true },
        { id: 'e3-4', source: '3', target: '4', sourceHandle: 'true', type: 'waypoint', data: { waypoints: [] }, animated: true },
        { id: 'e4-5', source: '4', target: '5', type: 'waypoint', data: { waypoints: [] }, animated: true },
        { id: 'e5-3', source: '5', target: '3', type: 'waypoint', data: { waypoints: [] }, animated: true },
        { id: 'e3-6', source: '3', target: '6', sourceHandle: 'false', type: 'waypoint', data: { waypoints: [] }, animated: true },
      ];
    } else if (exampleName === 'sum') {
      newNodes = [
        { id: 'c1', type: 'comment', position: { x: 50, y: 80 }, data: { label: 'SCOPO:\nSomma due numeri.\n\nSCELTE:\n- Input a e b separati\n- Process per somma\n- Output risultato' } },
        { id: '1', type: 'start', position: { x: 300, y: 50 }, data: { label: 'Start' } },
        { id: '2', type: 'input', position: { x: 300, y: 170 }, data: { label: 'Numero a', variableName: 'a' } },
        { id: '3', type: 'input', position: { x: 300, y: 300 }, data: { label: 'Numero b', variableName: 'b' } },
        { id: '4', type: 'process', position: { x: 300, y: 430 }, data: { label: 'somma = a + b', variableName: 'somma', expression: 'a + b' } },
        { id: '5', type: 'output', position: { x: 300, y: 560 }, data: { label: 'somma', expression: 'somma' } },
        { id: '6', type: 'end', position: { x: 300, y: 690 }, data: { label: 'End' } },
      ];
      newEdges = [
        { id: 'e1-2', source: '1', target: '2', type: 'waypoint', data: { waypoints: [] }, animated: true },
        { id: 'e2-3', source: '2', target: '3', type: 'waypoint', data: { waypoints: [] }, animated: true },
        { id: 'e3-4', source: '3', target: '4', type: 'waypoint', data: { waypoints: [] }, animated: true },
        { id: 'e4-5', source: '4', target: '5', type: 'waypoint', data: { waypoints: [] }, animated: true },
        { id: 'e5-6', source: '5', target: '6', type: 'waypoint', data: { waypoints: [] }, animated: true },
      ];
    } else if (exampleName === 'evenodd') {
      newNodes = [
        { id: 'c1', type: 'comment', position: { x: 50, y: 80 }, data: { label: 'SCOPO:\nPari o dispari.\n\nSCELTE:\n- Modulo n%2\n- Decision resto==0\n- Output diversi' } },
        { id: '1', type: 'start', position: { x: 300, y: 50 }, data: { label: 'Start' } },
        { id: '2', type: 'input', position: { x: 300, y: 170 }, data: { label: 'Numero n', variableName: 'n' } },
        { id: '3', type: 'process', position: { x: 300, y: 290 }, data: { label: 'resto = n % 2', variableName: 'resto', expression: 'n % 2' } },
        { id: '4', type: 'decision', position: { x: 300, y: 420 }, data: { label: 'resto == 0', condition: 'resto == 0' } },
        { id: '5', type: 'output', position: { x: 300, y: 600 }, data: { label: 'Pari', expression: '"Pari"' } },
        { id: '6', type: 'output', position: { x: 580, y: 420 }, data: { label: 'Dispari', expression: '"Dispari"' } },
        { id: '7', type: 'end', position: { x: 300, y: 730 }, data: { label: 'End' } },
        { id: '8', type: 'end', position: { x: 580, y: 570 }, data: { label: 'End' } },
      ];
      newEdges = [
        { id: 'e1-2', source: '1', target: '2', type: 'waypoint', data: { waypoints: [] }, animated: true },
        { id: 'e2-3', source: '2', target: '3', type: 'waypoint', data: { waypoints: [] }, animated: true },
        { id: 'e3-4', source: '3', target: '4', type: 'waypoint', data: { waypoints: [] }, animated: true },
        { id: 'e4-5', source: '4', target: '5', sourceHandle: 'true', type: 'waypoint', data: { waypoints: [] }, animated: true },
        { id: 'e4-6', source: '4', target: '6', sourceHandle: 'false', type: 'waypoint', data: { waypoints: [] }, animated: true },
        { id: 'e5-7', source: '5', target: '7', type: 'waypoint', data: { waypoints: [] }, animated: true },
        { id: 'e6-8', source: '6', target: '8', type: 'waypoint', data: { waypoints: [] }, animated: true },
      ];
    } else if (exampleName === 'max3') {
      newNodes = [
        { id: 'c1', type: 'comment', position: { x: 850, y: 50 }, data: { label: 'SCOPO:\nMassimo tra 3.\n\nSCELTE:\n- Decision annidati\n- Confronto a vs b\n- Vincente vs c' } },
        { id: '1', type: 'start', position: { x: 450, y: 50 }, data: { label: 'Start' } },
        { id: '2', type: 'input', position: { x: 450, y: 170 }, data: { label: 'a', variableName: 'a' } },
        { id: '3', type: 'input', position: { x: 450, y: 280 }, data: { label: 'b', variableName: 'b' } },
        { id: '4', type: 'input', position: { x: 450, y: 390 }, data: { label: 'c', variableName: 'c' } },
        { id: '5', type: 'decision', position: { x: 450, y: 510 }, data: { label: 'a > b', condition: 'a > b' } },
        { id: '6', type: 'decision', position: { x: 250, y: 690 }, data: { label: 'a > c', condition: 'a > c' } },
        { id: '7', type: 'decision', position: { x: 650, y: 690 }, data: { label: 'b > c', condition: 'b > c' } },
        { id: '8', type: 'output', position: { x: 100, y: 870 }, data: { label: 'Max: a', expression: 'a' } },
        { id: '9', type: 'output', position: { x: 400, y: 870 }, data: { label: 'Max: c', expression: 'c' } },
        { id: '10', type: 'output', position: { x: 650, y: 870 }, data: { label: 'Max: b', expression: 'b' } },
        { id: '11', type: 'output', position: { x: 900, y: 870 }, data: { label: 'Max: c', expression: 'c' } },
        { id: '12', type: 'end', position: { x: 450, y: 1020 }, data: { label: 'End' } },
      ];
      newEdges = [
        { id: 'e1-2', source: '1', target: '2', type: 'waypoint', data: { waypoints: [] }, animated: true },
        { id: 'e2-3', source: '2', target: '3', type: 'waypoint', data: { waypoints: [] }, animated: true },
        { id: 'e3-4', source: '3', target: '4', type: 'waypoint', data: { waypoints: [] }, animated: true },
        { id: 'e4-5', source: '4', target: '5', type: 'waypoint', data: { waypoints: [] }, animated: true },
        { id: 'e5-6', source: '5', target: '6', sourceHandle: 'true', type: 'waypoint', data: { waypoints: [] }, animated: true },
        { id: 'e5-7', source: '5', target: '7', sourceHandle: 'false', type: 'waypoint', data: { waypoints: [] }, animated: true },
        { id: 'e6-8', source: '6', target: '8', sourceHandle: 'true', type: 'waypoint', data: { waypoints: [] }, animated: true },
        { id: 'e6-9', source: '6', target: '9', sourceHandle: 'false', type: 'waypoint', data: { waypoints: [] }, animated: true },
        { id: 'e7-10', source: '7', target: '10', sourceHandle: 'true', type: 'waypoint', data: { waypoints: [] }, animated: true },
        { id: 'e7-11', source: '7', target: '11', sourceHandle: 'false', type: 'waypoint', data: { waypoints: [] }, animated: true },
        { id: 'e8-12', source: '8', target: '12', type: 'waypoint', data: { waypoints: [] }, animated: true },
        { id: 'e9-12', source: '9', target: '12', type: 'waypoint', data: { waypoints: [] }, animated: true },
        { id: 'e10-12', source: '10', target: '12', type: 'waypoint', data: { waypoints: [] }, animated: true },
        { id: 'e11-12', source: '11', target: '12', type: 'waypoint', data: { waypoints: [] }, animated: true },
      ];
    } else if (exampleName === 'factorial') {
      newNodes = [
        { id: 'c1', type: 'comment', position: { x: 50, y: 80 }, data: { label: 'SCOPO:\nFattoriale n!\n\nSCELTE:\n- risultato=1\n- Loop n>1\n- calcola ris * n\n- decrementa n' } },
        { id: 'f1', type: 'start', position: { x: 350, y: 50 }, data: { label: 'Start' } },
        { id: 'f2', type: 'input', position: { x: 350, y: 170 }, data: { label: 'Numero n', variableName: 'n' } },
        { id: 'f3', type: 'process', position: { x: 350, y: 280 }, data: { label: 'risultato = 1', variableName: 'risultato', expression: '1' } },
        { id: 'f4', type: 'decision', position: { x: 350, y: 410 }, data: { label: 'n > 1?', condition: 'n > 1' } },
        { id: 'f5', type: 'process', position: { x: 350, y: 590 }, data: { label: 'ris = ris * n', variableName: 'risultato', expression: 'risultato * n' } },
        { id: 'f6', type: 'process', position: { x: 350, y: 710 }, data: { label: 'n = n - 1', variableName: 'n', expression: 'n - 1' } },
        { id: 'f7', type: 'output', position: { x: 630, y: 410 }, data: { label: 'risultato', expression: 'risultato' } },
        { id: 'f8', type: 'end', position: { x: 630, y: 560 }, data: { label: 'End' } },
      ];
      newEdges = [
        { id: 'fe1-2', source: 'f1', target: 'f2', type: 'waypoint', data: { waypoints: [] }, animated: true },
        { id: 'fe2-3', source: 'f2', target: 'f3', type: 'waypoint', data: { waypoints: [] }, animated: true },
        { id: 'fe3-4', source: 'f3', target: 'f4', type: 'waypoint', data: { waypoints: [] }, animated: true },
        { id: 'fe4-5', source: 'f4', target: 'f5', sourceHandle: 'true', type: 'waypoint', data: { waypoints: [] }, animated: true },
        { id: 'fe5-6', source: 'f5', target: 'f6', type: 'waypoint', data: { waypoints: [] }, animated: true },
        { id: 'fe6-4', source: 'f6', target: 'f4', type: 'waypoint', data: { waypoints: [] }, animated: true },
        { id: 'fe4-7', source: 'f4', target: 'f7', sourceHandle: 'false', type: 'waypoint', data: { waypoints: [] }, animated: true },
        { id: 'fe7-8', source: 'f7', target: 'f8', type: 'waypoint', data: { waypoints: [] }, animated: true },
      ];
    }

    setNodes(newNodes);
    setEdges(newEdges);
  };


  return (
    <div className="app-container" data-theme={theme} data-color-theme={colorTheme}>
      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        colorTheme={colorTheme}
        onColorThemeChange={setColorTheme}
        isExecuting={isExecuting}
        onRun={handleRun}
        onDownloadPDF={handleDownloadPDF}
        onDownloadPNG={handleDownloadPNG}
        onDownloadJPEG={handleDownloadJPEG}
        onClear={handleClear}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isConsoleOpen={isConsoleOpen}
        onToggleConsole={() => setIsConsoleOpen(!isConsoleOpen)}
        onLoadExample={loadExample}
        onStartExercise={handleStartExercise}
      />

      <div className="main-content">
        <div className={`sidebar-wrapper ${isSidebarOpen ? 'open' : ''}`}>
          <Sidebar onOpenHelp={handleOpenHelp} />
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
          <FlowEditor
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            setEdges={setEdges}
            setNodes={setNodes}
            highlightedNodeId={highlightedNodeId}
            onPaneClick={onPaneClick}
            theme={theme}
          />

          <div className={`console-container ${isConsoleOpen ? 'open' : ''}`}>
            <Console
              ref={consoleRef}
              logs={logs}
              onInput={handleInput}
              isWaitingForInput={isWaitingForInput}
            />
          </div>
        </div>
      </div>
      {validationError && (
        <Toast
          message={validationError.split('\n')[0]}
          onClose={() => setValidationError(null)}
          duration={5000}
        />
      )}
      <HelpModal
        isOpen={helpModalOpen}
        onClose={() => setHelpModalOpen(false)}
        title={helpModalTitle}
        content={helpModalContent}
      />
    </div>
  );
}

function App() {
  return (
    <ReactFlowProvider>
      <AppContent />
    </ReactFlowProvider>
  );
}

export default App;
