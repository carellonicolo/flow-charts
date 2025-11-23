import type { Node, Edge } from 'reactflow';
import type { FlowChartNodeData, PseudoCodeLine } from '../types/flowchart';
import { NodeType } from '../types/flowchart';

/**
 * Converte un flow chart in pseudocodice
 * Mapping 1:1 tra blocchi flow chart e istruzioni pseudocodice
 */
export class PseudoCodeConverter {
  private nodes: Node<FlowChartNodeData>[];
  private edges: Edge[];
  private pseudoCode: PseudoCodeLine[] = [];
  private visited: Set<string> = new Set();
  private indentLevel = 0;

  constructor(nodes: Node<FlowChartNodeData>[], edges: Edge[]) {
    this.nodes = nodes;
    this.edges = edges;
  }

  /**
   * Converte il flow chart in pseudocodice
   */
  convert(): PseudoCodeLine[] {
    this.pseudoCode = [];
    this.visited = new Set();
    this.indentLevel = 0;

    // Trova il nodo START
    const startNode = this.nodes.find(n => n.data.type === NodeType.START);
    if (!startNode) {
      return [];
    }

    // Inizia la conversione dal nodo START
    this.convertNode(startNode);

    return this.pseudoCode;
  }

  /**
   * Converte un singolo nodo in pseudocodice
   */
  private convertNode(node: Node<FlowChartNodeData>): void {
    if (this.visited.has(node.id)) {
      return;
    }

    this.visited.add(node.id);
    const data = node.data;

    switch (data.type) {
      case NodeType.START:
        this.addLine(node.id, 'INIZIO', data.type);
        break;

      case NodeType.END:
        this.addLine(node.id, 'FINE', data.type);
        return; // Fine del programma

      case NodeType.INPUT:
        const inputVar = data.variable || 'variabile';
        this.addLine(node.id, `LEGGI ${inputVar}`, data.type);
        break;

      case NodeType.OUTPUT:
        const outputExpr = data.expression || 'valore';
        this.addLine(node.id, `SCRIVI ${outputExpr}`, data.type);
        break;

      case NodeType.PROCESS:
        const assignment = data.expression || `${data.variable} = valore`;
        this.addLine(node.id, assignment, data.type);
        break;

      case NodeType.DECISION:
        this.convertDecision(node);
        return; // La decisione gestisce i suoi rami

      case NodeType.WHILE:
        this.convertWhile(node);
        return; // Il while gestisce il suo corpo

      case NodeType.FOR:
        this.convertFor(node);
        return; // Il for gestisce il suo corpo
    }

    // Procedi al prossimo nodo
    const nextNode = this.getNextNode(node.id);
    if (nextNode) {
      this.convertNode(nextNode);
    }
  }

  /**
   * Converte un nodo decisione (IF-ELSE)
   */
  private convertDecision(node: Node<FlowChartNodeData>): void {
    const condition = node.data.condition || 'condizione';
    this.addLine(node.id, `SE ${condition} ALLORA`, node.data.type);

    // Ramo TRUE
    this.indentLevel++;
    const trueNode = this.getNextNode(node.id, 'true');
    if (trueNode) {
      this.convertNode(trueNode);
    }
    this.indentLevel--;

    // Ramo FALSE
    const falseNode = this.getNextNode(node.id, 'false');
    if (falseNode) {
      this.addLine(node.id + '_else', 'ALTRIMENTI', node.data.type);
      this.indentLevel++;
      this.convertNode(falseNode);
      this.indentLevel--;
    }

    this.addLine(node.id + '_endif', 'FINE_SE', node.data.type);
  }

  /**
   * Converte un nodo WHILE
   */
  private convertWhile(node: Node<FlowChartNodeData>): void {
    const condition = node.data.condition || 'condizione';
    this.addLine(node.id, `MENTRE ${condition} ESEGUI`, node.data.type);

    this.indentLevel++;
    const bodyNode = this.getNextNode(node.id, 'true');
    if (bodyNode) {
      this.convertNode(bodyNode);
    }
    this.indentLevel--;

    this.addLine(node.id + '_endwhile', 'FINE_MENTRE', node.data.type);

    // Continua dopo il ciclo
    const nextNode = this.getNextNode(node.id, 'false');
    if (nextNode) {
      this.convertNode(nextNode);
    }
  }

  /**
   * Converte un nodo FOR
   */
  private convertFor(node: Node<FlowChartNodeData>): void {
    const loopVar = node.data.loopVariable || 'i';
    const start = node.data.loopStart || '1';
    const end = node.data.loopEnd || '10';
    const step = node.data.loopStep || '1';

    this.addLine(
      node.id,
      `PER ${loopVar} DA ${start} A ${end} PASSO ${step} ESEGUI`,
      node.data.type
    );

    this.indentLevel++;
    const bodyNode = this.getNextNode(node.id);
    if (bodyNode) {
      this.convertNode(bodyNode);
    }
    this.indentLevel--;

    this.addLine(node.id + '_endfor', 'FINE_PER', node.data.type);
  }

  /**
   * Aggiunge una riga di pseudocodice
   */
  private addLine(nodeId: string, text: string, type: NodeType): void {
    this.pseudoCode.push({
      nodeId,
      indent: this.indentLevel,
      text,
      type,
    });
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
}

/**
 * Formatta il pseudocodice per la visualizzazione
 */
export function formatPseudoCode(lines: PseudoCodeLine[]): string {
  return lines
    .map(line => {
      const indent = '  '.repeat(line.indent);
      return `${indent}${line.text}`;
    })
    .join('\n');
}
