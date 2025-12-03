import { type Edge, type Node } from 'reactflow';

export interface FlowValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
}

/**
 * Valida la struttura sintattica di un flowchart prima dell'esecuzione
 */
export function validateFlowSyntax(nodes: Node[], edges: Edge[]): FlowValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. Verifica presenza nodo Start
    const startNodes = nodes.filter(n => n.type === 'start');
    if (startNodes.length === 0) {
        errors.push('⚠️ Manca il blocco Start: ogni flowchart deve iniziare con un nodo Start');
    } else if (startNodes.length > 1) {
        errors.push('⚠️ Troppi blocchi Start: deve esserci un solo nodo Start');
    }

    // 2. Verifica presenza nodo End
    const endNodes = nodes.filter(n => n.type === 'end');
    if (endNodes.length === 0) {
        errors.push('⚠️ Manca il blocco End: ogni flowchart deve terminare con almeno un nodo End');
    }

    // 3. Verifica che ci siano nodi oltre a Start/End/Comment
    const executableNodes = nodes.filter(n => n.type !== 'comment');
    if (executableNodes.length < 2) {
        errors.push('⚠️ Flowchart troppo semplice: aggiungi almeno un blocco tra Start e End');
    }

    // 4. Verifica connessioni del nodo Start
    if (startNodes.length === 1) {
        const startId = startNodes[0].id;
        const startOutgoingEdges = edges.filter(e => e.source === startId);
        if (startOutgoingEdges.length === 0) {
            errors.push('⚠️ Il blocco Start non ha connessioni in uscita');
        }
    }

    // 5. Verifica che tutti i nodi (tranne End e Comment) abbiano connessioni in uscita
    executableNodes.forEach(node => {
        if (node.type === 'end' || node.type === 'comment') return;

        const outgoingEdges = edges.filter(e => e.source === node.id);
        if (outgoingEdges.length === 0) {
            warnings.push(`⚠️ Il blocco "${node.data.label || node.type}" non ha connessioni in uscita`);
        }
    });

    // 6. Verifica che tutti i nodi (tranne Start e Comment) abbiano connessioni in entrata
    executableNodes.forEach(node => {
        if (node.type === 'start' || node.type === 'comment') return;

        const incomingEdges = edges.filter(e => e.target === node.id);
        if (incomingEdges.length === 0) {
            warnings.push(`⚠️ Il blocco "${node.data.label || node.type}" non ha connessioni in entrata (nodo orfano)`);
        }
    });

    // 7. Verifica che Decision abbia entrambe le uscite (true e false)
    const decisionNodes = nodes.filter(n => n.type === 'decision');
    decisionNodes.forEach(node => {
        const outgoingEdges = edges.filter(e => e.source === node.id);
        const hasTrue = outgoingEdges.some(e => e.sourceHandle === 'true');
        const hasFalse = outgoingEdges.some(e => e.sourceHandle === 'false');

        if (!hasTrue && !hasFalse) {
            errors.push(`⚠️ Il blocco Decision "${node.data.label || 'senza nome'}" non ha nessuna connessione in uscita`);
        } else if (!hasTrue) {
            warnings.push(`⚠️ Il blocco Decision "${node.data.label || 'senza nome'}" non ha connessione True`);
        } else if (!hasFalse) {
            warnings.push(`⚠️ Il blocco Decision "${node.data.label || 'senza nome'}" non ha connessione False`);
        }
    });

    // 8. Verifica raggiungibilità: Start può raggiungere End?
    if (startNodes.length === 1 && endNodes.length > 0) {
        const reachable = checkReachability(startNodes[0].id, endNodes.map(n => n.id), edges);
        if (!reachable) {
            errors.push('⚠️ Il blocco Start non può raggiungere nessun blocco End: verifica le connessioni');
        }
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings
    };
}

/**
 * Verifica se esiste un percorso da startId a qualsiasi endId
 */
function checkReachability(startId: string, endIds: string[], edges: Edge[]): boolean {
    const visited = new Set<string>();
    const queue = [startId];

    while (queue.length > 0) {
        const current = queue.shift()!;
        if (endIds.includes(current)) {
            return true; // Trovato percorso verso End
        }

        if (visited.has(current)) continue;
        visited.add(current);

        // Aggiungi tutti i nodi raggiungibili dalla corrente
        const outgoing = edges.filter(e => e.source === current);
        outgoing.forEach(edge => {
            if (!visited.has(edge.target)) {
                queue.push(edge.target);
            }
        });
    }

    return false; // Nessun End raggiungibile
}

/**
 * Formatta i risultati della validazione in un messaggio leggibile
 */
export function formatValidationMessage(result: FlowValidationResult): string {
    const lines: string[] = [];

    if (result.errors.length > 0) {
        lines.push('❌ ERRORI CRITICI:');
        result.errors.forEach(err => lines.push(`  ${err}`));
    }

    if (result.warnings.length > 0) {
        if (lines.length > 0) lines.push('');
        lines.push('⚠️ AVVISI:');
        result.warnings.forEach(warn => lines.push(`  ${warn}`));
    }

    if (result.valid && result.warnings.length === 0) {
        lines.push('✅ Flowchart valido e pronto per l\'esecuzione!');
    }

    return lines.join('\n');
}
