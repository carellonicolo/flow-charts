import type { Node, Edge } from 'reactflow';
import type { FlowChartNodeData, ExecutionState } from '../types/flowchart';
import { NodeType } from '../types/flowchart';

/**
 * Interprete per eseguire i flow chart
 * Permette l'esecuzione step-by-step con feedback visivo
 */
export class FlowChartInterpreter {
  private nodes: Node<FlowChartNodeData>[];
  private edges: Edge[];
  private state: ExecutionState;
  private onStateChange: (state: ExecutionState) => void;
  private inputCallback: (() => Promise<string>) | null = null;

  constructor(
    nodes: Node<FlowChartNodeData>[],
    edges: Edge[],
    onStateChange: (state: ExecutionState) => void
  ) {
    this.nodes = nodes;
    this.edges = edges;
    this.onStateChange = onStateChange;
    this.state = {
      variables: {},
      output: [],
      currentNodeId: null,
      isRunning: false,
      isPaused: false,
    };
  }

  /**
   * Imposta il callback per richiedere input all'utente
   */
  setInputCallback(callback: () => Promise<string>): void {
    this.inputCallback = callback;
  }

  /**
   * Avvia l'esecuzione del flow chart
   */
  async start(): Promise<void> {
    // Reset dello stato
    this.state = {
      variables: {},
      output: [],
      currentNodeId: null,
      isRunning: true,
      isPaused: false,
    };

    // Trova il nodo START
    const startNode = this.nodes.find(n => n.data.type === NodeType.START);
    if (!startNode) {
      this.state.error = 'Nodo START non trovato';
      this.notifyStateChange();
      return;
    }

    this.state.currentNodeId = startNode.id;
    this.notifyStateChange();

    // Inizia l'esecuzione
    await this.executeNode(startNode);

    this.state.isRunning = false;
    this.state.currentNodeId = null;
    this.notifyStateChange();
  }

  /**
   * Esegue un singolo nodo
   */
  private async executeNode(node: Node<FlowChartNodeData>): Promise<void> {
    if (!this.state.isRunning) {
      return;
    }

    // Pausa se richiesta
    while (this.state.isPaused) {
      await this.sleep(100);
    }

    this.state.currentNodeId = node.id;
    this.notifyStateChange();

    // Piccola pausa per visualizzare il nodo corrente
    await this.sleep(300);

    const data = node.data;

    try {
      switch (data.type) {
        case NodeType.START:
          this.addOutput('→ Programma avviato');
          break;

        case NodeType.END:
          this.addOutput('→ Programma terminato');
          return; // Fine esecuzione

        case NodeType.INPUT:
          await this.executeInput(data);
          break;

        case NodeType.OUTPUT:
          this.executeOutput(data);
          break;

        case NodeType.PROCESS:
          this.executeProcess(data);
          break;

        case NodeType.DECISION:
          await this.executeDecision(node);
          return; // La decisione gestisce il prossimo nodo

        case NodeType.WHILE:
          await this.executeWhile(node);
          return; // Il while gestisce il prossimo nodo

        case NodeType.FOR:
          await this.executeFor(node);
          return; // Il for gestisce il prossimo nodo
      }

      // Procedi al prossimo nodo
      const nextNode = this.getNextNode(node.id);
      if (nextNode) {
        await this.executeNode(nextNode);
      }
    } catch (error) {
      this.state.error = error instanceof Error ? error.message : 'Errore di esecuzione';
      this.state.isRunning = false;
      this.notifyStateChange();
    }
  }

  /**
   * Esegue un'operazione di INPUT
   */
  private async executeInput(data: FlowChartNodeData): Promise<void> {
    const variable = data.variable || 'input';

    if (!this.inputCallback) {
      throw new Error('Callback per input non configurato');
    }

    this.addOutput(`→ Richiesta input per "${variable}"`);
    const value = await this.inputCallback();

    // Prova a convertire in numero
    const numValue = parseFloat(value);
    this.state.variables[variable] = isNaN(numValue) ? value : numValue;

    this.addOutput(`  ${variable} = ${this.state.variables[variable]}`);
  }

  /**
   * Esegue un'operazione di OUTPUT
   */
  private executeOutput(data: FlowChartNodeData): void {
    const expression = data.expression || '';
    const value = this.evaluateExpression(expression);
    this.addOutput(`→ Output: ${value}`);
  }

  /**
   * Esegue un'operazione di PROCESS (assegnazione)
   */
  private executeProcess(data: FlowChartNodeData): void {
    const expression = data.expression || '';

    // Cerca pattern: variabile = espressione
    const match = expression.match(/^\s*(\w+)\s*=\s*(.+)$/);
    if (!match) {
      throw new Error(`Assegnazione non valida: ${expression}`);
    }

    const [, variable, expr] = match;
    const value = this.evaluateExpression(expr);
    this.state.variables[variable] = value;

    this.addOutput(`→ ${variable} = ${value}`);
  }

  /**
   * Esegue una DECISIONE (if-else)
   */
  private async executeDecision(node: Node<FlowChartNodeData>): Promise<void> {
    const condition = node.data.condition || '';
    const result = this.evaluateCondition(condition);

    this.addOutput(`→ Condizione "${condition}" = ${result}`);

    const nextNode = this.getNextNode(node.id, result ? 'true' : 'false');
    if (nextNode) {
      await this.executeNode(nextNode);
    }
  }

  /**
   * Esegue un ciclo WHILE
   */
  private async executeWhile(node: Node<FlowChartNodeData>): Promise<void> {
    const condition = node.data.condition || '';
    let iterations = 0;
    const MAX_ITERATIONS = 10000; // Protezione loop infiniti

    this.addOutput(`→ Inizio ciclo MENTRE`);

    while (this.evaluateCondition(condition) && this.state.isRunning) {
      if (iterations++ > MAX_ITERATIONS) {
        throw new Error('Loop infinito rilevato (>10000 iterazioni)');
      }

      const bodyNode = this.getNextNode(node.id, 'true');
      if (bodyNode) {
        await this.executeNode(bodyNode);
      }
    }

    this.addOutput(`→ Fine ciclo MENTRE (${iterations} iterazioni)`);

    // Continua dopo il ciclo
    const nextNode = this.getNextNode(node.id, 'false');
    if (nextNode) {
      await this.executeNode(nextNode);
    }
  }

  /**
   * Esegue un ciclo FOR
   */
  private async executeFor(node: Node<FlowChartNodeData>): Promise<void> {
    const loopVar = node.data.loopVariable || 'i';
    const start = this.evaluateExpression(node.data.loopStart || '0');
    const end = this.evaluateExpression(node.data.loopEnd || '10');
    const step = this.evaluateExpression(node.data.loopStep || '1');

    this.addOutput(`→ Inizio ciclo FOR: ${loopVar} da ${start} a ${end} passo ${step}`);

    for (let i = start; i <= end; i += step) {
      if (!this.state.isRunning) break;

      this.state.variables[loopVar] = i;

      const bodyNode = this.getNextNode(node.id);
      if (bodyNode) {
        await this.executeNode(bodyNode);
      }
    }

    this.addOutput(`→ Fine ciclo FOR`);
  }

  /**
   * Valuta un'espressione matematica/stringa
   */
  private evaluateExpression(expr: string): any {
    try {
      // Sostituisci le variabili con i loro valori
      let evaluated = expr;
      for (const [varName, varValue] of Object.entries(this.state.variables)) {
        const regex = new RegExp(`\\b${varName}\\b`, 'g');
        evaluated = evaluated.replace(regex, String(varValue));
      }

      // Rimuovi caratteri pericolosi (sicurezza)
      if (/[;{}]/.test(evaluated)) {
        throw new Error('Espressione non valida');
      }

      // Valuta l'espressione in modo sicuro
      // eslint-disable-next-line no-new-func
      return Function(`"use strict"; return (${evaluated})`)();
    } catch (error) {
      throw new Error(`Errore nella valutazione di "${expr}": ${error}`);
    }
  }

  /**
   * Valuta una condizione booleana
   */
  private evaluateCondition(condition: string): boolean {
    const result = this.evaluateExpression(condition);
    return Boolean(result);
  }

  /**
   * Trova il prossimo nodo collegato
   */
  private getNextNode(nodeId: string, label?: string): Node<FlowChartNodeData> | null {
    const edge = this.edges.find(
      e => e.source === nodeId && (!label || e.label === label)
    );

    if (!edge) {
      return null;
    }

    return this.nodes.find(n => n.id === edge.target) || null;
  }

  /**
   * Aggiunge una riga all'output
   */
  private addOutput(text: string): void {
    this.state.output.push(text);
    this.notifyStateChange();
  }

  /**
   * Notifica il cambio di stato
   */
  private notifyStateChange(): void {
    this.onStateChange({ ...this.state });
  }

  /**
   * Pausa l'esecuzione
   */
  pause(): void {
    this.state.isPaused = true;
    this.notifyStateChange();
  }

  /**
   * Riprende l'esecuzione
   */
  resume(): void {
    this.state.isPaused = false;
    this.notifyStateChange();
  }

  /**
   * Ferma l'esecuzione
   */
  stop(): void {
    this.state.isRunning = false;
    this.state.isPaused = false;
    this.notifyStateChange();
  }

  /**
   * Utility per attendere
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
