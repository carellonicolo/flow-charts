import { useState, useRef, useEffect } from 'react';
import { ReactFlowProvider, useNodesState, useEdgesState } from 'reactflow';
import { toPng, toJpeg } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { FlowEditor } from './components/FlowEditor';
import { Console } from './components/Console';
import { Sidebar, type HelpContent } from './components/Sidebar';
import { Header } from './components/Header';
import { CommandBar } from './components/CommandBar';
import { HelpModal } from './components/HelpModal';
import { Toast } from './components/Toast';
import { PseudocodeView } from './components/PseudocodeView';
import { Executor } from './engine/Executor';
import { validateFlowSyntax, formatValidationMessage } from './utils/flowValidation';
import { buildExport, LANG_LABELS, type TargetLang } from './utils/codegen';
import type { LogEntry, LogKind } from './types/console';
import { useTranslation } from './i18n/i18nContext';
import { useFlowHistory } from './utils/useFlowHistory';
import { useShortcuts } from './utils/useShortcuts';
import { ShortcutsHelp } from './components/ShortcutsHelp';
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
  const { t } = useTranslation();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isWaitingForInput, setIsWaitingForInput] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const pushLog = (kind: LogKind, text: string) => {
    setLogs(prev => [...prev, { kind, text, ts: Date.now() }]);
  };
  const resetLogs = (entries: { kind: LogKind; text: string }[]) => {
    const now = Date.now();
    setLogs(entries.map(e => ({ ...e, ts: now })));
  };

  // Help Modal states
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [helpModalTitle, setHelpModalTitle] = useState('');
  const [helpModalContent, setHelpModalContent] = useState<HelpContent | string>('');

  // Mobile states
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);

  // View mode
  const [viewMode, setViewMode] = useState<'flowchart' | 'pseudocode'>('flowchart');

  // Shortcuts help dialog
  const [shortcutsHelpOpen, setShortcutsHelpOpen] = useState(false);

  // Hidden file input for Cmd+O
  const openInputRef = useRef<HTMLInputElement>(null);

  // In-app clipboard for Cmd+C / Cmd+V / Cmd+X
  const clipboardRef = useRef<{ nodes: any[]; edges: any[] }>({ nodes: [], edges: [] });

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const { undo, redo, canUndo, canRedo } = useFlowHistory(nodes, edges, setNodes, setEdges);

  const copySelectedNodes = () => {
    const selected = nodes.filter(n => n.selected);
    if (selected.length === 0) return;
    const ids = new Set(selected.map(n => n.id));
    const innerEdges = edges.filter(e => ids.has(e.source) && ids.has(e.target));
    clipboardRef.current = {
      nodes: selected.map(n => JSON.parse(JSON.stringify(n))),
      edges: innerEdges.map(e => JSON.parse(JSON.stringify(e))),
    };
    pushLog('system', `📋 ${selected.length} ${selected.length === 1 ? 'blocco copiato' : 'blocchi copiati'}`);
  };

  const cutSelectedNodes = () => {
    const selected = nodes.filter(n => n.selected);
    if (selected.length === 0) return;
    copySelectedNodes();
    const ids = new Set(selected.map(n => n.id));
    setNodes(nodes.filter(n => !ids.has(n.id)));
    setEdges(edges.filter(e => !ids.has(e.source) && !ids.has(e.target)));
  };

  const pasteNodes = () => {
    const clip = clipboardRef.current;
    if (!clip.nodes.length) return;
    const stamp = Date.now();
    const idMap = new Map<string, string>();
    const offset = { x: 40, y: 40 };
    const newNodes = clip.nodes.map((n: any, i: number) => {
      const newId = `${n.id}_paste_${stamp}_${i}`;
      idMap.set(n.id, newId);
      return {
        ...n,
        id: newId,
        position: { x: (n.position?.x ?? 0) + offset.x, y: (n.position?.y ?? 0) + offset.y },
        selected: true,
        data: { ...n.data },
      };
    });
    const newEdges = clip.edges
      .filter((e: any) => idMap.has(e.source) && idMap.has(e.target))
      .map((e: any, i: number) => ({
        ...e,
        id: `${e.id}_paste_${stamp}_${i}`,
        source: idMap.get(e.source)!,
        target: idMap.get(e.target)!,
        selected: false,
        data: e.data ? { ...e.data, waypoints: Array.isArray(e.data.waypoints) ? [...e.data.waypoints] : [] } : { waypoints: [] },
      }));
    setNodes([...nodes.map(n => ({ ...n, selected: false })), ...newNodes]);
    setEdges([...edges, ...newEdges]);
    pushLog('system', `📋 ${newNodes.length} ${newNodes.length === 1 ? 'blocco incollato' : 'blocchi incollati'}`);
  };

  const duplicateSelectedNodes = () => {
    const selected = nodes.filter(n => n.selected);
    if (selected.length === 0) return;
    const offset = { x: 40, y: 40 };
    const stamp = Date.now();
    const dupes = selected.map((n, i) => ({
      ...n,
      id: `${n.id}_dup_${stamp}_${i}`,
      position: { x: n.position.x + offset.x, y: n.position.y + offset.y },
      selected: false,
      data: { ...n.data },
    }));
    setNodes([...nodes.map(n => ({ ...n, selected: false })), ...dupes]);
  };

  useShortcuts({
    onSave: () => handleDownloadJSON(),
    onOpen: () => openInputRef.current?.click(),
    onRunToggle: () => handleRun(),
    onClear: () => handleClear(),
    onDuplicate: duplicateSelectedNodes,
    onCopy: copySelectedNodes,
    onPaste: pasteNodes,
    onCut: cutSelectedNodes,
    onViewFlowchart: () => setViewMode('flowchart'),
    onViewPseudocode: () => setViewMode('pseudocode'),
    onEscape: () => {
      setNodes(nds => nds.map(n => ({ ...n, selected: false })));
      setEdges(eds => eds.map(e => ({ ...e, selected: false })));
      setShortcutsHelpOpen(false);
    },
    onHelp: () => setShortcutsHelpOpen(o => !o),
  });

  const executorRef = useRef<Executor | null>(null);
  const inputResolverRef = useRef<((value: string) => void) | null>(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Il toggle tema ora vive nella <carello-shell>, che scrive data-theme su
  // <html>. Osserviamo l'attributo per mantenere allineato lo stato React
  // (usato da FlowEditor, export, ecc.) quando il tema cambia dalla shell.
  useEffect(() => {
    const root = document.documentElement;
    const observer = new MutationObserver(() => {
      const next = root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      setTheme(prev => (prev === next ? prev : next));
    });
    observer.observe(root, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    localStorage.setItem('color-theme', colorTheme);
  }, [colorTheme]);

  const handleStop = () => {
    if (executorRef.current) {
      executorRef.current.stop();
      pushLog('warning', `⏹️ ${t('console.interrupted')}`);
    }
    if (inputResolverRef.current) {
      inputResolverRef.current('');
      inputResolverRef.current = null;
    }
    setIsExecuting(false);
    setHighlightedNodeId(null);
    setIsWaitingForInput(false);
    setCurrentPrompt('');
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
      resetLogs([{ kind: 'error', text: errorMessage }]);
      setIsConsoleOpen(true); // Mostra console con errori
      return;
    }

    // Se ci sono warning, mostrali nella console ma continua
    if (validation.warnings.length > 0) {
      const warningMessage = formatValidationMessage(validation);
      resetLogs([{ kind: 'warning', text: warningMessage }]);
    } else {
      resetLogs([{ kind: 'system', text: `✅ ${t('console.validationPassed')}` }]);
    }

    setIsExecuting(true);
    setHighlightedNodeId(null);
    setIsWaitingForInput(false);
    setValidationError(null);
    // Open console on mobile when running
    setIsConsoleOpen(true);

    // Executor signature: nodes, edges, emit, requestInput, setHighlight, t
    executorRef.current = new Executor(
      nodes,
      edges,
      (entry) => setLogs(prev => [...prev, { ...entry, ts: Date.now() }]),
      (prompt) => {
        setCurrentPrompt(prompt);
        setIsWaitingForInput(true);
        setIsConsoleOpen(true); // Ensure console is open for input
        pushLog('prompt', prompt);
        return new Promise<string>((resolve) => {
          inputResolverRef.current = resolve;
        });
      },
      (nodeId) => setHighlightedNodeId(nodeId),
      t
    );

    try {
      await executorRef.current.execute();
    } catch (error: any) {
      pushLog('error', error.message);
    } finally {
      setIsExecuting(false);
      setHighlightedNodeId(null);
      setIsWaitingForInput(false);
      setCurrentPrompt('');
      inputResolverRef.current = null;
    }
  };

  const handleInput = (value: string) => {
    pushLog('input', value);
    setIsWaitingForInput(false);
    setCurrentPrompt('');
    if (inputResolverRef.current) {
      inputResolverRef.current(value);
      inputResolverRef.current = null;
    }
  };

  const onPaneClick = () => {
    // Close mobile panels when clicking on the canvas
    if (window.innerWidth <= 768) {
      setIsSidebarOpen(false);
      setIsConsoleOpen(false);
    }
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
    resetLogs([{ kind: 'system', text: '🧹 Area di lavoro ripulita' }]);
  };

  const handleExport = async (format: 'pdf' | 'png' | 'jpeg') => {
    const flowElement = document.querySelector('.reactflow-wrapper') as HTMLElement;
    if (!flowElement) return;

    pushLog('system', `⚙️ Generazione ${format.toUpperCase()} in corso...`);

    // Switch the canvas to a clean "exporting" mode so colored glows,
    // backdrop-filter blur and overlays don't bleed into the captured image.
    flowElement.classList.add('exporting');
    // Wait two animation frames to make sure the browser repainted without effects.
    await new Promise(requestAnimationFrame);
    await new Promise(requestAnimationFrame);

    try {
      const filter = (node: HTMLElement) => {
        if (!(node instanceof HTMLElement)) return true;
        if (node.classList?.contains('properties-side-panel')) return false;
        if (node.classList?.contains('react-flow__node-toolbar')) return false;
        if (node.classList?.contains('react-flow__minimap')) return false;
        if (node.classList?.contains('react-flow__controls')) return false;
        return true;
      };

      const options = {
        backgroundColor: theme === 'dark' ? '#0f172a' : '#f1f5f9',
        pixelRatio: 2,
        cacheBust: true,
        filter,
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
        const dataUrl = await toJpeg(flowElement, { ...options, quality: 0.92 });
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = 'flow-chart.jpg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      pushLog('system', `📄 ${format.toUpperCase()} scaricato con successo`);
    } catch (error) {
      console.error(`Errore durante il download del ${format.toUpperCase()}:`, error);
      pushLog('error', `❌ Errore durante il download del ${format.toUpperCase()}`);
    } finally {
      flowElement.classList.remove('exporting');
    }
  };

  const handleDownloadPDF = () => handleExport('pdf');
  const handleDownloadPNG = () => handleExport('png');
  const handleDownloadJPEG = () => handleExport('jpeg');

  const handleDownloadJSON = () => {
    try {
      const payload = {
        version: 1,
        type: 'flow-charts-project',
        savedAt: new Date().toISOString(),
        nodes,
        edges,
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `flow-chart-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      pushLog('system', '💾 Progetto JSON salvato');
    } catch (error) {
      console.error(error);
      pushLog('error', '❌ Errore durante il salvataggio JSON');
    }
  };

  const handleImportJSON = (file: File) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = String(ev.target?.result || '');
        const parsed = JSON.parse(text);
        if (!parsed || !Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) {
          throw new Error('JSON non valido: mancano "nodes" o "edges"');
        }
        if (isExecuting) handleStop();
        setNodes(parsed.nodes);
        setEdges(parsed.edges);
        pushLog('system', `📂 Progetto caricato: ${parsed.nodes.length} blocchi, ${parsed.edges.length} connessioni`);
      } catch (error: any) {
        console.error(error);
        pushLog('error', `❌ Errore caricamento JSON: ${error.message || error}`);
      }
    };
    reader.onerror = () => {
      pushLog('error', '❌ Impossibile leggere il file selezionato');
    };
    reader.readAsText(file);
  };

  const handlePseudoDownload = (langs: TargetLang[], format: 'txt' | 'pdf') => {
    const base = langs.length === 0
      ? 'pseudocodice'
      : langs.length === 1
        ? `pseudocodice-${langs[0]}`
        : 'pseudocodice-e-codice';
    const label = langs.length === 0
      ? 'Pseudocodice'
      : langs.length === 1
        ? `Pseudocodice + ${LANG_LABELS[langs[0]]}`
        : 'Pseudocodice + tutti i linguaggi';
    try {
      const text = buildExport(nodes, edges, langs);
      if (format === 'txt') {
        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${base}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
        const margin = 40;
        const lineHeight = 14;
        const fontSize = 11;
        pdf.setFont('courier', 'normal');
        pdf.setFontSize(fontSize);
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const usableWidth = pageWidth - margin * 2;
        let y = margin;
        pdf.setFontSize(14);
        pdf.text(label, margin, y);
        y += 24;
        pdf.setFontSize(fontSize);
        for (const line of text.split('\n')) {
          const wrapped = pdf.splitTextToSize(line || ' ', usableWidth);
          for (const w of wrapped) {
            if (y + lineHeight > pageHeight - margin) {
              pdf.addPage();
              y = margin;
            }
            pdf.text(w, margin, y);
            y += lineHeight;
          }
        }
        pdf.save(`${base}.pdf`);
      }
      pushLog('system', `📄 ${label} (${format.toUpperCase()}) scaricato`);
    } catch (error) {
      console.error(error);
      pushLog('error', `❌ Errore durante l'export ${format.toUpperCase()}`);
    }
  };

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

    const txt = (s: string) => ({ kind: 'text' as const, value: s });
    const varp = (s: string) => ({ kind: 'var' as const, value: s });

    if (exampleName === 'hello') {
      newNodes = [
        { id: 'c1', type: 'comment', position: { x: 50, y: 50 }, data: { label: 'SCOPO:\nPrimo programma introduttivo.\nMostra output di testo.\n\nSCELTE:\n- Output diretto\n- Testo tra virgolette\n- Flusso lineare' } },
        { id: '1', type: 'start', position: { x: 300, y: 50 }, data: { label: 'Start' } },
        { id: '2', type: 'output', position: { x: 300, y: 200 }, data: { label: '"Hello World"', parts: [txt('Hello World')] } },
        { id: '3', type: 'end', position: { x: 300, y: 350 }, data: { label: 'End' } },
      ];
      newEdges = [
        { id: 'e1-2', source: '1', target: '2', type: 'waypoint', data: { waypoints: [] }, animated: true },
        { id: 'e2-3', source: '2', target: '3', type: 'waypoint', data: { waypoints: [] }, animated: true },
      ];
    } else if (exampleName === 'counter') {
      newNodes = [
        { id: 'c1', type: 'comment', position: { x: 50, y: 20 }, data: { label: 'SCOPO:\nCiclo iterativo 1-5.' } },
        { id: '1', type: 'start', position: { x: 300, y: 20 }, data: { label: 'Start' } },
        { id: 'd', type: 'declare', position: { x: 300, y: 120 }, data: { label: 'i', variableName: 'i', variableType: 'int', initialValue: '1' } },
        { id: '3', type: 'decision', position: { x: 300, y: 260 }, data: { label: 'i <= 5', condition: 'i <= 5' } },
        { id: '4', type: 'output', position: { x: 300, y: 440 }, data: { label: 'i', parts: [varp('i')] } },
        { id: '5', type: 'process', position: { x: 300, y: 570 }, data: { label: 'i := i + 1', variableName: 'i', expression: 'i + 1' } },
        { id: '6', type: 'end', position: { x: 580, y: 260 }, data: { label: 'End' } },
      ];
      newEdges = [
        { id: 'e1-d', source: '1', target: 'd', type: 'waypoint', data: { waypoints: [] }, animated: true },
        { id: 'ed-3', source: 'd', target: '3', type: 'waypoint', data: { waypoints: [] }, animated: true },
        { id: 'e3-4', source: '3', target: '4', sourceHandle: 'true', type: 'waypoint', data: { waypoints: [] }, animated: true },
        { id: 'e4-5', source: '4', target: '5', type: 'waypoint', data: { waypoints: [] }, animated: true },
        { id: 'e5-3', source: '5', target: '3', type: 'waypoint', data: { waypoints: [] }, animated: true },
        { id: 'e3-6', source: '3', target: '6', sourceHandle: 'false', type: 'waypoint', data: { waypoints: [] }, animated: true },
      ];
    } else if (exampleName === 'sum') {
      newNodes = [
        { id: 'c1', type: 'comment', position: { x: 50, y: 80 }, data: { label: 'SCOPO:\nSomma due numeri.' } },
        { id: '1', type: 'start', position: { x: 300, y: 50 }, data: { label: 'Start' } },
        { id: 'da', type: 'declare', position: { x: 300, y: 150 }, data: { label: 'a', variableName: 'a', variableType: 'int' } },
        { id: 'db', type: 'declare', position: { x: 300, y: 270 }, data: { label: 'b', variableName: 'b', variableType: 'int' } },
        { id: 'ds', type: 'declare', position: { x: 300, y: 390 }, data: { label: 'somma', variableName: 'somma', variableType: 'int' } },
        { id: '2', type: 'input', position: { x: 300, y: 510 }, data: { label: '→ a', variableName: 'a', prompt: 'Numero a' } },
        { id: '3', type: 'input', position: { x: 300, y: 630 }, data: { label: '→ b', variableName: 'b', prompt: 'Numero b' } },
        { id: '4', type: 'process', position: { x: 300, y: 750 }, data: { label: 'somma := a + b', variableName: 'somma', expression: 'a + b' } },
        { id: '5', type: 'output', position: { x: 300, y: 880 }, data: { label: '"Somma: " + somma', parts: [txt('Somma: '), varp('somma')] } },
        { id: '6', type: 'end', position: { x: 300, y: 1010 }, data: { label: 'End' } },
      ];
      newEdges = [
        { id: 'e1-da', source: '1', target: 'da', type: 'waypoint', data: { waypoints: [] }, animated: true },
        { id: 'eda-db', source: 'da', target: 'db', type: 'waypoint', data: { waypoints: [] }, animated: true },
        { id: 'edb-ds', source: 'db', target: 'ds', type: 'waypoint', data: { waypoints: [] }, animated: true },
        { id: 'eds-2', source: 'ds', target: '2', type: 'waypoint', data: { waypoints: [] }, animated: true },
        { id: 'e2-3', source: '2', target: '3', type: 'waypoint', data: { waypoints: [] }, animated: true },
        { id: 'e3-4', source: '3', target: '4', type: 'waypoint', data: { waypoints: [] }, animated: true },
        { id: 'e4-5', source: '4', target: '5', type: 'waypoint', data: { waypoints: [] }, animated: true },
        { id: 'e5-6', source: '5', target: '6', type: 'waypoint', data: { waypoints: [] }, animated: true },
      ];
    } else if (exampleName === 'evenodd') {
      newNodes = [
        { id: 'c1', type: 'comment', position: { x: 50, y: 80 }, data: { label: 'SCOPO:\nPari o dispari.' } },
        { id: '1', type: 'start', position: { x: 300, y: 50 }, data: { label: 'Start' } },
        { id: 'dn', type: 'declare', position: { x: 300, y: 150 }, data: { label: 'n', variableName: 'n', variableType: 'int' } },
        { id: 'dr', type: 'declare', position: { x: 300, y: 270 }, data: { label: 'resto', variableName: 'resto', variableType: 'int' } },
        { id: '2', type: 'input', position: { x: 300, y: 390 }, data: { label: '→ n', variableName: 'n', prompt: 'Numero n' } },
        { id: '3', type: 'process', position: { x: 300, y: 510 }, data: { label: 'resto := n % 2', variableName: 'resto', expression: 'n % 2' } },
        { id: '4', type: 'decision', position: { x: 300, y: 640 }, data: { label: 'resto == 0', condition: 'resto == 0' } },
        { id: '5', type: 'output', position: { x: 300, y: 820 }, data: { label: '"Pari"', parts: [txt('Pari')] } },
        { id: '6', type: 'output', position: { x: 580, y: 640 }, data: { label: '"Dispari"', parts: [txt('Dispari')] } },
        { id: '7', type: 'end', position: { x: 300, y: 950 }, data: { label: 'End' } },
        { id: '8', type: 'end', position: { x: 580, y: 790 }, data: { label: 'End' } },
      ];
      newEdges = [
        { id: 'e1-dn', source: '1', target: 'dn', type: 'waypoint', data: { waypoints: [] }, animated: true },
        { id: 'edn-dr', source: 'dn', target: 'dr', type: 'waypoint', data: { waypoints: [] }, animated: true },
        { id: 'edr-2', source: 'dr', target: '2', type: 'waypoint', data: { waypoints: [] }, animated: true },
        { id: 'e2-3', source: '2', target: '3', type: 'waypoint', data: { waypoints: [] }, animated: true },
        { id: 'e3-4', source: '3', target: '4', type: 'waypoint', data: { waypoints: [] }, animated: true },
        { id: 'e4-5', source: '4', target: '5', sourceHandle: 'true', type: 'waypoint', data: { waypoints: [] }, animated: true },
        { id: 'e4-6', source: '4', target: '6', sourceHandle: 'false', type: 'waypoint', data: { waypoints: [] }, animated: true },
        { id: 'e5-7', source: '5', target: '7', type: 'waypoint', data: { waypoints: [] }, animated: true },
        { id: 'e6-8', source: '6', target: '8', type: 'waypoint', data: { waypoints: [] }, animated: true },
      ];
    } else if (exampleName === 'max3') {
      newNodes = [
        { id: 'c1', type: 'comment', position: { x: 850, y: 50 }, data: { label: 'SCOPO:\nMassimo tra 3.' } },
        { id: '1', type: 'start', position: { x: 450, y: 50 }, data: { label: 'Start' } },
        { id: 'da', type: 'declare', position: { x: 450, y: 150 }, data: { label: 'a', variableName: 'a', variableType: 'int' } },
        { id: 'db', type: 'declare', position: { x: 450, y: 270 }, data: { label: 'b', variableName: 'b', variableType: 'int' } },
        { id: 'dc', type: 'declare', position: { x: 450, y: 390 }, data: { label: 'c', variableName: 'c', variableType: 'int' } },
        { id: '2', type: 'input', position: { x: 450, y: 510 }, data: { label: '→ a', variableName: 'a' } },
        { id: '3', type: 'input', position: { x: 450, y: 620 }, data: { label: '→ b', variableName: 'b' } },
        { id: '4', type: 'input', position: { x: 450, y: 730 }, data: { label: '→ c', variableName: 'c' } },
        { id: '5', type: 'decision', position: { x: 450, y: 850 }, data: { label: 'a > b', condition: 'a > b' } },
        { id: '6', type: 'decision', position: { x: 250, y: 1030 }, data: { label: 'a > c', condition: 'a > c' } },
        { id: '7', type: 'decision', position: { x: 650, y: 1030 }, data: { label: 'b > c', condition: 'b > c' } },
        { id: '8', type: 'output', position: { x: 100, y: 1210 }, data: { label: '"Max: " + a', parts: [txt('Max: '), varp('a')] } },
        { id: '9', type: 'output', position: { x: 400, y: 1210 }, data: { label: '"Max: " + c', parts: [txt('Max: '), varp('c')] } },
        { id: '10', type: 'output', position: { x: 650, y: 1210 }, data: { label: '"Max: " + b', parts: [txt('Max: '), varp('b')] } },
        { id: '11', type: 'output', position: { x: 900, y: 1210 }, data: { label: '"Max: " + c', parts: [txt('Max: '), varp('c')] } },
        { id: '12', type: 'end', position: { x: 450, y: 1360 }, data: { label: 'End' } },
      ];
      newEdges = [
        { id: 'e1-da', source: '1', target: 'da', type: 'waypoint', data: { waypoints: [] }, animated: true },
        { id: 'eda-db', source: 'da', target: 'db', type: 'waypoint', data: { waypoints: [] }, animated: true },
        { id: 'edb-dc', source: 'db', target: 'dc', type: 'waypoint', data: { waypoints: [] }, animated: true },
        { id: 'edc-2', source: 'dc', target: '2', type: 'waypoint', data: { waypoints: [] }, animated: true },
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
        { id: 'c1', type: 'comment', position: { x: 50, y: 80 }, data: { label: 'SCOPO:\nFattoriale n!' } },
        { id: 'f1', type: 'start', position: { x: 350, y: 50 }, data: { label: 'Start' } },
        { id: 'dn', type: 'declare', position: { x: 350, y: 150 }, data: { label: 'n', variableName: 'n', variableType: 'int' } },
        { id: 'dr', type: 'declare', position: { x: 350, y: 270 }, data: { label: 'risultato', variableName: 'risultato', variableType: 'int', initialValue: '1' } },
        { id: 'f2', type: 'input', position: { x: 350, y: 400 }, data: { label: '→ n', variableName: 'n', prompt: 'Numero n' } },
        { id: 'f4', type: 'decision', position: { x: 350, y: 530 }, data: { label: 'n > 1', condition: 'n > 1' } },
        { id: 'f5', type: 'process', position: { x: 350, y: 710 }, data: { label: 'risultato := risultato * n', variableName: 'risultato', expression: 'risultato * n' } },
        { id: 'f6', type: 'process', position: { x: 350, y: 830 }, data: { label: 'n := n - 1', variableName: 'n', expression: 'n - 1' } },
        { id: 'f7', type: 'output', position: { x: 630, y: 530 }, data: { label: '"Risultato: " + risultato', parts: [txt('Risultato: '), varp('risultato')] } },
        { id: 'f8', type: 'end', position: { x: 630, y: 680 }, data: { label: 'End' } },
      ];
      newEdges = [
        { id: 'fe1-dn', source: 'f1', target: 'dn', type: 'waypoint', data: { waypoints: [] }, animated: true },
        { id: 'fedn-dr', source: 'dn', target: 'dr', type: 'waypoint', data: { waypoints: [] }, animated: true },
        { id: 'fedr-2', source: 'dr', target: 'f2', type: 'waypoint', data: { waypoints: [] }, animated: true },
        { id: 'fe2-4', source: 'f2', target: 'f4', type: 'waypoint', data: { waypoints: [] }, animated: true },
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
      {/* Top bar unificata Carello: brand, breadcrumb, launcher app, toggle
          tema e menu account. I controlli specifici di Flow Chart sono iniettati
          nello slot "app-actions" dal componente <Header>. */}
      <carello-shell
        app-name="Flow Chart"
        app-icon="Workflow"
        accent="#6366f1"
        user="NC"
        data-hub-url="https://nicolocarello.it"
        data-auth-url="https://auth.nicolocarello.it"
      >
        <Header
          colorTheme={colorTheme}
          onColorThemeChange={setColorTheme}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isConsoleOpen={isConsoleOpen}
          onToggleConsole={() => setIsConsoleOpen(!isConsoleOpen)}
          onLoadExample={loadExample}
          onStartExercise={handleStartExercise}
        />
      </carello-shell>

      <div className="main-content">
        <div className={`sidebar-wrapper ${isSidebarOpen ? 'open' : ''}`}>
          <Sidebar onOpenHelp={handleOpenHelp} />
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
          {viewMode === 'flowchart' ? (
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
          ) : (
            <PseudocodeView
              nodes={nodes}
              edges={edges}
              setNodes={setNodes}
              setEdges={setEdges}
              theme={theme}
              onDownload={handlePseudoDownload}
            />
          )}

          <CommandBar
            isExecuting={isExecuting}
            onRun={handleRun}
            onClear={handleClear}
            onUndo={undo}
            onRedo={redo}
            canUndo={canUndo}
            canRedo={canRedo}
            viewMode={viewMode}
            onChangeViewMode={setViewMode}
            onDownloadPDF={handleDownloadPDF}
            onDownloadPNG={handleDownloadPNG}
            onDownloadJPEG={handleDownloadJPEG}
            onDownloadJSON={handleDownloadJSON}
            onImportJSON={handleImportJSON}
            onShowShortcuts={() => setShortcutsHelpOpen(true)}
          />

          <div className={`console-container ${isConsoleOpen ? 'open' : ''}`}>
            <Console
              logs={logs}
              onInput={handleInput}
              isWaitingForInput={isWaitingForInput}
              currentPrompt={currentPrompt}
              onClear={() => setLogs([])}
              onClose={() => setIsConsoleOpen(false)}
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
      <ShortcutsHelp
        isOpen={shortcutsHelpOpen}
        onClose={() => setShortcutsHelpOpen(false)}
      />
      <input
        ref={openInputRef}
        type="file"
        accept="application/json,.json"
        style={{ display: 'none' }}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleImportJSON(f);
          e.target.value = '';
        }}
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
