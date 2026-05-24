import { type Edge, type Node } from 'reactflow';
import type { OutputPart } from '../types/flow';

export interface FlowValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
}

const JS_KEYWORDS = new Set([
    'true', 'false', 'null', 'undefined',
    'Math', 'Number', 'String', 'Boolean', 'Array',
    'NaN', 'Infinity',
    'parseInt', 'parseFloat',
    'console',
    'log', 'sqrt', 'pow', 'abs', 'floor', 'ceil', 'round', 'min', 'max', 'random',
    'PI', 'E'
]);

const IDENT_RE = /[a-zA-Z_$][a-zA-Z0-9_$]*/g;

function identifiersIn(expr: string): string[] {
    if (!expr) return [];
    const cleaned = expr.replace(/"[^"]*"/g, '').replace(/'[^']*'/g, '');
    return Array.from(new Set(cleaned.match(IDENT_RE) || []))
        .filter(id => !JS_KEYWORDS.has(id) && !/^\d/.test(id));
}

export function validateFlowSyntax(nodes: Node[], edges: Edge[]): FlowValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const startNodes = nodes.filter(n => n.type === 'start');
    if (startNodes.length === 0) {
        errors.push('⚠️ Manca il blocco Start: ogni flowchart deve iniziare con un nodo Start');
    } else if (startNodes.length > 1) {
        errors.push('⚠️ Troppi blocchi Start: deve esserci un solo nodo Start');
    }

    const endNodes = nodes.filter(n => n.type === 'end');
    if (endNodes.length === 0) {
        errors.push('⚠️ Manca il blocco End: ogni flowchart deve terminare con almeno un nodo End');
    }

    const executableNodes = nodes.filter(n => n.type !== 'comment');
    if (executableNodes.length < 2) {
        errors.push('⚠️ Flowchart troppo semplice: aggiungi almeno un blocco tra Start e End');
    }

    if (startNodes.length === 1) {
        const startId = startNodes[0].id;
        const startOutgoingEdges = edges.filter(e => e.source === startId);
        if (startOutgoingEdges.length === 0) {
            errors.push('⚠️ Il blocco Start non ha connessioni in uscita');
        }
    }

    executableNodes.forEach(node => {
        if (node.type === 'end' || node.type === 'comment') return;

        const outgoingEdges = edges.filter(e => e.source === node.id);
        if (outgoingEdges.length === 0) {
            warnings.push(`⚠️ Il blocco "${node.data.label || node.type}" non ha connessioni in uscita`);
        }
    });

    executableNodes.forEach(node => {
        if (node.type === 'start' || node.type === 'comment') return;

        const incomingEdges = edges.filter(e => e.target === node.id);
        if (incomingEdges.length === 0) {
            warnings.push(`⚠️ Il blocco "${node.data.label || node.type}" non ha connessioni in entrata (nodo orfano)`);
        }
    });

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

    if (startNodes.length === 1 && endNodes.length > 0) {
        const reachable = checkReachability(startNodes[0].id, endNodes.map(n => n.id), edges);
        if (!reachable) {
            errors.push('⚠️ Il blocco Start non può raggiungere nessun blocco End: verifica le connessioni');
        }
    }

    const declaredNames = new Set<string>();
    const duplicateDeclares = new Set<string>();
    nodes.filter(n => n.type === 'declare').forEach(n => {
        const name: string = (n.data.variableName || '').trim();
        if (!name) {
            warnings.push('⚠️ Blocco Dichiara senza nome di variabile');
            return;
        }
        if (declaredNames.has(name)) duplicateDeclares.add(name);
        declaredNames.add(name);
    });
    duplicateDeclares.forEach(name => {
        errors.push(`⚠️ Variabile "${name}" dichiarata più volte`);
    });

    const reportUndeclared = (name: string, where: string) => {
        if (!declaredNames.has(name)) {
            errors.push(`⚠️ Variabile "${name}" non dichiarata (usata in ${where}). Aggiungi un blocco Dichiara prima.`);
        }
    };

    nodes.forEach(node => {
        if (node.type === 'process') {
            const expr: string = node.data.expression || '';
            const explicit: string | undefined = node.data.variableName?.trim() || undefined;
            if (expr) {
                let rhs = expr;
                if (expr.includes('=') && !explicit) {
                    const [lhs, rest] = expr.split('=').map((s: string) => s.trim());
                    if (lhs) reportUndeclared(lhs, `Azione "${expr}"`);
                    rhs = rest || '';
                }
                if (explicit) reportUndeclared(explicit, `Azione "${expr}"`);
                identifiersIn(rhs).forEach(id => reportUndeclared(id, `Azione "${expr}"`));
            }
        } else if (node.type === 'decision') {
            const cond: string = node.data.condition || '';
            identifiersIn(cond).forEach(id => reportUndeclared(id, `Decisione "${cond}"`));
        } else if (node.type === 'input') {
            const v: string = (node.data.variableName || '').trim();
            if (!v) {
                errors.push('⚠️ Blocco Input senza variabile selezionata');
            } else {
                reportUndeclared(v, 'Input');
            }
        } else if (node.type === 'output') {
            const parts: OutputPart[] = Array.isArray(node.data.parts) ? node.data.parts : [];
            if (parts.length === 0 && node.data.expression) {
                identifiersIn(node.data.expression).forEach(id => reportUndeclared(id, `Output "${node.data.expression}"`));
            } else {
                parts.forEach(p => {
                    if (p.kind === 'var' && p.value) reportUndeclared(p.value, 'Output');
                });
            }
        } else if (node.type === 'declare') {
            const initial: string = node.data.initialValue || '';
            if (initial && node.data.variableType !== 'string') {
                identifiersIn(initial).forEach(id => {
                    if (id !== node.data.variableName) reportUndeclared(id, `Valore iniziale di "${node.data.variableName}"`);
                });
            }
        }
    });

    return {
        valid: errors.length === 0,
        errors,
        warnings,
    };
}

function checkReachability(startId: string, endIds: string[], edges: Edge[]): boolean {
    const visited = new Set<string>();
    const queue = [startId];

    while (queue.length > 0) {
        const current = queue.shift()!;
        if (endIds.includes(current)) {
            return true;
        }

        if (visited.has(current)) continue;
        visited.add(current);

        const outgoing = edges.filter(e => e.source === current);
        outgoing.forEach(edge => {
            if (!visited.has(edge.target)) {
                queue.push(edge.target);
            }
        });
    }

    return false;
}

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
