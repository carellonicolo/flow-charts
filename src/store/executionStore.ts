import { create } from 'zustand';

/**
 * Velocità di esecuzione
 */
export type ExecutionSpeed = 'instant' | 'fast' | 'normal' | 'slow';

/**
 * Modalità di esecuzione
 */
export type ExecutionMode = 'continuous' | 'step';

/**
 * Stato dell'esecuzione
 */
export interface ExecutionState {
  // Stato esecuzione
  isRunning: boolean;
  isPaused: boolean;
  isWaitingForInput: boolean;
  mode: ExecutionMode;

  // Nodo corrente
  currentNodeId: string | null;
  executedNodeIds: string[];  // Trail dei nodi eseguiti

  // Variables watch
  variables: Record<string, any>;
  variablesHistory: Record<string, any>[];

  // Output console
  output: string[];

  // Breakpoints
  breakpoints: Set<string>;

  // Velocità esecuzione
  speed: ExecutionSpeed;
  customDelay: number; // ms

  // Errori
  error: string | null;
  errorNodeId: string | null;

  // Callback input
  inputCallback: (() => Promise<string>) | null;
}

/**
 * Store Zustand per gestione esecuzione
 */
interface ExecutionStore extends ExecutionState {
  // Actions - Execution control
  start: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  step: () => void;

  // Actions - State
  setCurrentNode: (nodeId: string | null) => void;
  addExecutedNode: (nodeId: string) => void;
  clearExecutedNodes: () => void;

  // Actions - Variables
  setVariable: (name: string, value: any) => void;
  setVariables: (variables: Record<string, any>) => void;
  clearVariables: () => void;
  saveVariablesSnapshot: () => void;

  // Actions - Output
  addOutput: (text: string) => void;
  clearOutput: () => void;

  // Actions - Breakpoints
  toggleBreakpoint: (nodeId: string) => void;
  addBreakpoint: (nodeId: string) => void;
  removeBreakpoint: (nodeId: string) => void;
  clearBreakpoints: () => void;
  hasBreakpoint: (nodeId: string) => boolean;

  // Actions - Speed
  setSpeed: (speed: ExecutionSpeed) => void;
  setCustomDelay: (delay: number) => void;
  getDelay: () => number;

  // Actions - Mode
  setMode: (mode: ExecutionMode) => void;

  // Actions - Error
  setError: (error: string | null, nodeId?: string | null) => void;
  clearError: () => void;

  // Actions - Input
  setInputCallback: (callback: (() => Promise<string>) | null) => void;
  setWaitingForInput: (waiting: boolean) => void;

  // Actions - Reset
  reset: () => void;
}

/**
 * Delay per ogni velocità (ms)
 */
const SPEED_DELAYS: Record<ExecutionSpeed, number> = {
  instant: 0,
  fast: 100,
  normal: 300,
  slow: 800,
};

/**
 * Hook Zustand per execution store
 */
export const useExecutionStore = create<ExecutionStore>((set, get) => ({
  // Stato iniziale
  isRunning: false,
  isPaused: false,
  isWaitingForInput: false,
  mode: 'continuous',

  currentNodeId: null,
  executedNodeIds: [],

  variables: {},
  variablesHistory: [],

  output: [],

  breakpoints: new Set(),

  speed: 'normal',
  customDelay: 300,

  error: null,
  errorNodeId: null,

  inputCallback: null,

  // === ACTIONS - EXECUTION CONTROL ===

  start: () => {
    set({
      isRunning: true,
      isPaused: false,
      executedNodeIds: [],
      variables: {},
      variablesHistory: [],
      output: [],
      error: null,
      errorNodeId: null,
      currentNodeId: null,
    });
  },

  pause: () => {
    set({ isPaused: true });
  },

  resume: () => {
    set({ isPaused: false });
  },

  stop: () => {
    set({
      isRunning: false,
      isPaused: false,
      currentNodeId: null,
      isWaitingForInput: false,
    });
  },

  step: () => {
    // Simula un "step" - sarà gestito dall'interprete
    set({ mode: 'step' });
  },

  // === ACTIONS - STATE ===

  setCurrentNode: (nodeId) => {
    set({ currentNodeId: nodeId });
  },

  addExecutedNode: (nodeId) => {
    set((state) => ({
      executedNodeIds: [...state.executedNodeIds, nodeId],
    }));
  },

  clearExecutedNodes: () => {
    set({ executedNodeIds: [] });
  },

  // === ACTIONS - VARIABLES ===

  setVariable: (name, value) => {
    set((state) => ({
      variables: { ...state.variables, [name]: value },
    }));
  },

  setVariables: (variables) => {
    set({ variables });
  },

  clearVariables: () => {
    set({ variables: {}, variablesHistory: [] });
  },

  saveVariablesSnapshot: () => {
    const { variables, variablesHistory } = get();
    set({
      variablesHistory: [...variablesHistory, { ...variables }],
    });
  },

  // === ACTIONS - OUTPUT ===

  addOutput: (text) => {
    set((state) => ({
      output: [...state.output, text],
    }));
  },

  clearOutput: () => {
    set({ output: [] });
  },

  // === ACTIONS - BREAKPOINTS ===

  toggleBreakpoint: (nodeId) => {
    const { breakpoints } = get();
    const newBreakpoints = new Set(breakpoints);

    if (newBreakpoints.has(nodeId)) {
      newBreakpoints.delete(nodeId);
    } else {
      newBreakpoints.add(nodeId);
    }

    set({ breakpoints: newBreakpoints });
  },

  addBreakpoint: (nodeId) => {
    const { breakpoints } = get();
    const newBreakpoints = new Set(breakpoints);
    newBreakpoints.add(nodeId);
    set({ breakpoints: newBreakpoints });
  },

  removeBreakpoint: (nodeId) => {
    const { breakpoints } = get();
    const newBreakpoints = new Set(breakpoints);
    newBreakpoints.delete(nodeId);
    set({ breakpoints: newBreakpoints });
  },

  clearBreakpoints: () => {
    set({ breakpoints: new Set() });
  },

  hasBreakpoint: (nodeId) => {
    return get().breakpoints.has(nodeId);
  },

  // === ACTIONS - SPEED ===

  setSpeed: (speed) => {
    set({
      speed,
      customDelay: SPEED_DELAYS[speed],
    });
  },

  setCustomDelay: (delay) => {
    set({
      customDelay: delay,
      speed: 'normal', // Reset to normal when custom
    });
  },

  getDelay: () => {
    const { speed, customDelay } = get();
    if (speed === 'instant') return 0;
    return customDelay;
  },

  // === ACTIONS - MODE ===

  setMode: (mode) => {
    set({ mode });
  },

  // === ACTIONS - ERROR ===

  setError: (error, nodeId = null) => {
    set({
      error,
      errorNodeId: nodeId,
      isRunning: false,
      isPaused: false,
    });
  },

  clearError: () => {
    set({ error: null, errorNodeId: null });
  },

  // === ACTIONS - INPUT ===

  setInputCallback: (callback) => {
    set({ inputCallback: callback });
  },

  setWaitingForInput: (waiting) => {
    set({ isWaitingForInput: waiting });
  },

  // === ACTIONS - RESET ===

  reset: () => {
    set({
      isRunning: false,
      isPaused: false,
      isWaitingForInput: false,
      mode: 'continuous',
      currentNodeId: null,
      executedNodeIds: [],
      variables: {},
      variablesHistory: [],
      output: [],
      error: null,
      errorNodeId: null,
    });
  },
}));
