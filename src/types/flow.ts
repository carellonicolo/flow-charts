/**
 * Shared data shapes for nodes in the flowchart.
 * Stored on `node.data` of React Flow nodes.
 */

export type VarType = 'int' | 'float' | 'string' | 'bool';

export const VAR_TYPE_LABELS: Record<VarType, { it: string; en: string; pseudo: string }> = {
    int: { it: 'Intero', en: 'Integer', pseudo: 'INTEGER' },
    float: { it: 'Decimale', en: 'Float', pseudo: 'REAL' },
    string: { it: 'Stringa', en: 'String', pseudo: 'STRING' },
    bool: { it: 'Booleano', en: 'Boolean', pseudo: 'BOOLEAN' },
};

export interface DeclareNodeData {
    variableName: string;
    variableType: VarType;
    initialValue?: string;
    label?: string;
}

export interface ProcessNodeData {
    variableName?: string;
    expression: string;
    label?: string;
}

export interface InputNodeData {
    variableName: string;
    prompt?: string;
    label?: string;
}

export type OutputPart =
    | { kind: 'text'; value: string }
    | { kind: 'var'; value: string };

export interface OutputNodeData {
    parts: OutputPart[];
    label?: string;
    expression?: string;
}

export type DecisionHandlePos = 'bottom' | 'right' | 'left';

export interface DecisionNodeData {
    condition: string;
    truePosition?: DecisionHandlePos;
    falsePosition?: DecisionHandlePos;
    label?: string;
}

export interface CommentNodeData {
    label: string;
}

export interface StartEndNodeData {
    label?: string;
}

export function defaultDataForType(type: string): Record<string, unknown> {
    switch (type) {
        case 'declare':
            return { variableName: '', variableType: 'int' as VarType, initialValue: '', label: '' };
        case 'process':
            return { variableName: '', expression: '', label: '' };
        case 'input':
            return { variableName: '', prompt: '', label: '' };
        case 'output':
            return { parts: [] as OutputPart[], label: '' };
        case 'decision':
            return { condition: '', truePosition: 'bottom' as DecisionHandlePos, falsePosition: 'right' as DecisionHandlePos, label: '' };
        default:
            return { label: '' };
    }
}

export function previewOutput(parts: OutputPart[]): string {
    if (!parts || parts.length === 0) return '...';
    return parts
        .map(p => (p.kind === 'text' ? `"${p.value}"` : p.value || '?'))
        .join(' + ');
}

export function coerceValue(raw: string, type: VarType): number | string | boolean {
    const trimmed = raw.trim();
    if (type === 'int') {
        const n = parseInt(trimmed, 10);
        if (Number.isNaN(n)) throw new Error(`Valore "${raw}" non è un intero valido`);
        return n;
    }
    if (type === 'float') {
        const n = parseFloat(trimmed.replace(',', '.'));
        if (Number.isNaN(n)) throw new Error(`Valore "${raw}" non è un numero decimale valido`);
        return n;
    }
    if (type === 'bool') {
        const lower = trimmed.toLowerCase();
        if (['true', 'vero', '1', 'sì', 'si'].includes(lower)) return true;
        if (['false', 'falso', '0', 'no'].includes(lower)) return false;
        throw new Error(`Valore "${raw}" non è un booleano valido (usa true/false)`);
    }
    return raw;
}

export function defaultInitialFor(type: VarType): number | string | boolean {
    switch (type) {
        case 'int': return 0;
        case 'float': return 0;
        case 'string': return '';
        case 'bool': return false;
    }
}
