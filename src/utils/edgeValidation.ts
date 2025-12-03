import { type Edge, type Node } from 'reactflow';

export interface NodeConnectionRules {
    maxInputs: number;
    maxOutputs: number;
    canBeTarget: boolean;
    canBeSource: boolean;
}

// Regole per ogni tipo di nodo
const NODE_RULES: Record<string, NodeConnectionRules> = {
    start: { maxInputs: 0, maxOutputs: 1, canBeTarget: false, canBeSource: true },
    end: { maxInputs: Infinity, maxOutputs: 0, canBeTarget: true, canBeSource: false },
    process: { maxInputs: Infinity, maxOutputs: 1, canBeTarget: true, canBeSource: true },
    decision: { maxInputs: Infinity, maxOutputs: 2, canBeTarget: true, canBeSource: true },
    input: { maxInputs: Infinity, maxOutputs: 1, canBeTarget: true, canBeSource: true },
    output: { maxInputs: Infinity, maxOutputs: 1, canBeTarget: true, canBeSource: true },
    comment: { maxInputs: 0, maxOutputs: 0, canBeTarget: false, canBeSource: false },
};

export interface ValidationResult {
    valid: boolean;
    message?: string;
}

export function validateConnection(
    source: string,
    target: string,
    sourceHandle: string | null,
    nodes: Node[],
    edges: Edge[]
): ValidationResult {
    const sourceNode = nodes.find(n => n.id === source);
    const targetNode = nodes.find(n => n.id === target);

    if (!sourceNode || !targetNode) {
        return { valid: false, message: 'Nodo non trovato' };
    }

    const sourceRules = NODE_RULES[sourceNode.type || 'process'];
    const targetRules = NODE_RULES[targetNode.type || 'process'];

    // Check 1: Source può essere sorgente?
    if (!sourceRules.canBeSource) {
        const nodeNames: Record<string, string> = {
            end: 'End',
            comment: 'Comment'
        };
        return {
            valid: false,
            message: `Il blocco ${nodeNames[sourceNode.type || ''] || sourceNode.type} non può avere connessioni in uscita`
        };
    }

    // Check 2: Target può essere destinazione?
    if (!targetRules.canBeTarget) {
        const nodeNames: Record<string, string> = {
            start: 'Start',
            comment: 'Comment'
        };
        return {
            valid: false,
            message: `Il blocco ${nodeNames[targetNode.type || ''] || targetNode.type} non può ricevere connessioni in ingresso`
        };
    }

    // Check 3: Connessione duplicata?
    const duplicateEdge = edges.some(
        edge =>
            edge.source === source &&
            edge.target === target &&
            edge.sourceHandle === sourceHandle
    );
    if (duplicateEdge) {
        return { valid: false, message: 'Connessione già esistente tra questi nodi' };
    }

    // Check 4: Max output raggiunto?
    const outgoingEdges = edges.filter(e => e.source === source);
    if (outgoingEdges.length >= sourceRules.maxOutputs) {
        const messages: Record<string, string> = {
            start: 'Il blocco Start può avere solo 1 connessione in uscita',
            process: 'Il blocco Process può avere solo 1 connessione in uscita',
            decision: 'Il blocco Decision ha già 2 connessioni in uscita (True e False)',
            input: 'Il blocco Input può avere solo 1 connessione in uscita',
            output: 'Il blocco Output può avere solo 1 connessione in uscita',
        };
        return {
            valid: false,
            message: messages[sourceNode.type || 'process'] || 'Limite di connessioni in uscita raggiunto'
        };
    }

    // Check 5: Self-connection?
    if (source === target) {
        return { valid: false, message: 'Non puoi collegare un blocco a se stesso' };
    }

    return { valid: true };
}
