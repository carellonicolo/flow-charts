import { create } from 'zustand';
import type { Node, Edge } from 'reactflow';
import type { FlowChartNodeData } from '../types/flowchart';

/**
 * Stato della History per Undo/Redo
 */
interface HistoryState {
  nodes: Node<FlowChartNodeData>[];
  edges: Edge[];
}

/**
 * Store Zustand per gestione flowchart
 * Include: nodes, edges, undo/redo, validation
 */
interface FlowchartStore {
  // Stato corrente
  nodes: Node<FlowChartNodeData>[];
  edges: Edge[];
  selectedNodes: string[];
  selectedEdges: string[];

  // History per undo/redo
  history: HistoryState[];
  historyIndex: number;
  maxHistorySize: number;

  // Validation state
  validationErrors: string[];
  validationWarnings: string[];

  // Actions - Nodes
  setNodes: (nodes: Node<FlowChartNodeData>[]) => void;
  addNode: (node: Node<FlowChartNodeData>) => void;
  updateNode: (nodeId: string, data: Partial<FlowChartNodeData>) => void;
  deleteNode: (nodeId: string) => void;
  duplicateNode: (nodeId: string) => void;

  // Actions - Edges
  setEdges: (edges: Edge[]) => void;
  addEdge: (edge: Edge) => void;
  deleteEdge: (edgeId: string) => void;

  // Actions - Selection
  setSelectedNodes: (nodeIds: string[]) => void;
  setSelectedEdges: (edgeIds: string[]) => void;
  clearSelection: () => void;

  // Actions - History
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  saveToHistory: () => void;

  // Actions - Validation
  validateFlowchart: () => void;
  clearValidation: () => void;

  // Actions - Utilities
  clearFlowchart: () => void;
  loadFlowchart: (nodes: Node<FlowChartNodeData>[], edges: Edge[]) => void;
}

/**
 * Hook Zustand per flowchart store
 */
export const useFlowchartStore = create<FlowchartStore>((set, get) => ({
  // Stato iniziale
  nodes: [],
  edges: [],
  selectedNodes: [],
  selectedEdges: [],

  // History
  history: [],
  historyIndex: -1,
  maxHistorySize: 50,

  // Validation
  validationErrors: [],
  validationWarnings: [],

  // === ACTIONS - NODES ===

  setNodes: (nodes) => {
    set({ nodes });
    get().saveToHistory();
    get().validateFlowchart();
  },

  addNode: (node) => {
    set((state) => ({
      nodes: [...state.nodes, node],
    }));
    get().saveToHistory();
    get().validateFlowchart();
  },

  updateNode: (nodeId, data) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...data } }
          : node
      ),
    }));
    get().saveToHistory();
    get().validateFlowchart();
  },

  deleteNode: (nodeId) => {
    set((state) => ({
      nodes: state.nodes.filter((node) => node.id !== nodeId),
      edges: state.edges.filter(
        (edge) => edge.source !== nodeId && edge.target !== nodeId
      ),
      selectedNodes: state.selectedNodes.filter((id) => id !== nodeId),
    }));
    get().saveToHistory();
    get().validateFlowchart();
  },

  duplicateNode: (nodeId) => {
    const state = get();
    const nodeToDuplicate = state.nodes.find((node) => node.id === nodeId);
    if (!nodeToDuplicate) return;

    const newNode: Node<FlowChartNodeData> = {
      ...nodeToDuplicate,
      id: `node_${Date.now()}`,
      position: {
        x: nodeToDuplicate.position.x + 50,
        y: nodeToDuplicate.position.y + 50,
      },
      selected: false,
    };

    set((state) => ({
      nodes: [...state.nodes, newNode],
    }));
    get().saveToHistory();
  },

  // === ACTIONS - EDGES ===

  setEdges: (edges) => {
    set({ edges });
    get().saveToHistory();
    get().validateFlowchart();
  },

  addEdge: (edge) => {
    set((state) => ({
      edges: [...state.edges, edge],
    }));
    get().saveToHistory();
    get().validateFlowchart();
  },

  deleteEdge: (edgeId) => {
    set((state) => ({
      edges: state.edges.filter((edge) => edge.id !== edgeId),
      selectedEdges: state.selectedEdges.filter((id) => id !== edgeId),
    }));
    get().saveToHistory();
    get().validateFlowchart();
  },

  // === ACTIONS - SELECTION ===

  setSelectedNodes: (nodeIds) => set({ selectedNodes: nodeIds }),

  setSelectedEdges: (edgeIds) => set({ selectedEdges: edgeIds }),

  clearSelection: () => set({ selectedNodes: [], selectedEdges: [] }),

  // === ACTIONS - HISTORY (Undo/Redo) ===

  saveToHistory: () => {
    const { nodes, edges, history, historyIndex, maxHistorySize } = get();

    // Crea snapshot corrente
    const snapshot: HistoryState = {
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges)),
    };

    // Rimuovi gli stati "future" se siamo in mezzo alla history
    const newHistory = history.slice(0, historyIndex + 1);

    // Aggiungi nuovo snapshot
    newHistory.push(snapshot);

    // Limita dimensione history
    if (newHistory.length > maxHistorySize) {
      newHistory.shift();
    }

    set({
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  undo: () => {
    const { history, historyIndex } = get();

    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const snapshot = history[newIndex];

      set({
        nodes: JSON.parse(JSON.stringify(snapshot.nodes)),
        edges: JSON.parse(JSON.stringify(snapshot.edges)),
        historyIndex: newIndex,
      });

      get().validateFlowchart();
    }
  },

  redo: () => {
    const { history, historyIndex } = get();

    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const snapshot = history[newIndex];

      set({
        nodes: JSON.parse(JSON.stringify(snapshot.nodes)),
        edges: JSON.parse(JSON.stringify(snapshot.edges)),
        historyIndex: newIndex,
      });

      get().validateFlowchart();
    }
  },

  canUndo: () => {
    const { historyIndex } = get();
    return historyIndex > 0;
  },

  canRedo: () => {
    const { history, historyIndex } = get();
    return historyIndex < history.length - 1;
  },

  // === ACTIONS - VALIDATION ===

  validateFlowchart: () => {
    const { nodes, edges } = get();
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check: Deve esserci almeno un nodo START
    const startNodes = nodes.filter((node) => node.data.type === 'start');
    if (startNodes.length === 0) {
      errors.push('Manca il nodo START');
    } else if (startNodes.length > 1) {
      warnings.push('Ci sono più nodi START');
    }

    // Check: Deve esserci almeno un nodo END
    const endNodes = nodes.filter((node) => node.data.type === 'end');
    if (endNodes.length === 0) {
      errors.push('Manca il nodo END');
    } else if (endNodes.length > 1) {
      warnings.push('Ci sono più nodi END');
    }

    // Check: Nodi disconnessi (senza connessioni in entrata o uscita)
    if (nodes.length > 1) {
      nodes.forEach((node) => {
        if (node.data.type === 'start') {
          // START deve avere almeno un'uscita
          const hasOutgoing = edges.some((edge) => edge.source === node.id);
          if (!hasOutgoing) {
            warnings.push(`Nodo START non connesso`);
          }
        } else if (node.data.type === 'end') {
          // END deve avere almeno un'entrata
          const hasIncoming = edges.some((edge) => edge.target === node.id);
          if (!hasIncoming) {
            warnings.push(`Nodo END non connesso`);
          }
        } else {
          // Altri nodi devono avere sia entrata che uscita
          const hasIncoming = edges.some((edge) => edge.target === node.id);
          const hasOutgoing = edges.some((edge) => edge.source === node.id);
          if (!hasIncoming || !hasOutgoing) {
            warnings.push(`Nodo "${node.data.label || node.id}" disconnesso`);
          }
        }
      });
    }

    // Check: Validazione espressioni/condizioni
    nodes.forEach((node) => {
      if (node.data.type === 'process' && !node.data.expression) {
        warnings.push(`Nodo processo senza espressione`);
      }
      if (node.data.type === 'decision' && !node.data.condition) {
        warnings.push(`Nodo decisione senza condizione`);
      }
      if (node.data.type === 'while' && !node.data.condition) {
        warnings.push(`Ciclo while senza condizione`);
      }
      if (node.data.type === 'input' && !node.data.variable) {
        warnings.push(`Nodo input senza variabile`);
      }
    });

    set({
      validationErrors: errors,
      validationWarnings: warnings,
    });
  },

  clearValidation: () => {
    set({ validationErrors: [], validationWarnings: [] });
  },

  // === ACTIONS - UTILITIES ===

  clearFlowchart: () => {
    set({
      nodes: [],
      edges: [],
      selectedNodes: [],
      selectedEdges: [],
      history: [],
      historyIndex: -1,
      validationErrors: [],
      validationWarnings: [],
    });
  },

  loadFlowchart: (nodes, edges) => {
    set({
      nodes,
      edges,
      selectedNodes: [],
      selectedEdges: [],
      history: [],
      historyIndex: -1,
    });
    get().saveToHistory();
    get().validateFlowchart();
  },
}));
