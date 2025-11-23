// Tipi di nodi supportati nel flow chart
export const NodeType = {
  START: 'start',
  END: 'end',
  INPUT: 'input',
  OUTPUT: 'output',
  PROCESS: 'process', // Assegnazione
  DECISION: 'decision', // Condizione if-else
  WHILE: 'while', // Ciclo while
  FOR: 'for', // Ciclo for
} as const;

export type NodeType = typeof NodeType[keyof typeof NodeType];

// Dati di un nodo del flow chart
export interface FlowChartNodeData {
  label: string;
  type: NodeType;
  variable?: string; // Per input/process
  expression?: string; // Per process/decision/output
  condition?: string; // Per decision/while
  loopVariable?: string; // Per for
  loopStart?: string; // Per for
  loopEnd?: string; // Per for
  loopStep?: string; // Per for
}

// Stato dell'esecuzione
export interface ExecutionState {
  variables: Record<string, any>;
  output: string[];
  currentNodeId: string | null;
  isRunning: boolean;
  isPaused: boolean;
  error?: string;
}

// Risultato di una istruzione pseudocodice
export interface PseudoCodeLine {
  nodeId: string;
  indent: number;
  text: string;
  type: NodeType;
}
