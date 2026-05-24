import type { Node, Edge } from 'reactflow';
import { coerceValue, defaultInitialFor, type OutputPart, type VarType } from '../types/flow';

export type LogCallback = (message: string) => void;
export type InputCallback = (prompt: string) => Promise<string>;
export type HighlightCallback = (nodeId: string | null) => void;

interface VarSlot {
    type: VarType;
    value: number | string | boolean;
}

export class Executor {
    private nodes: Node[];
    private edges: Edge[];
    private vars: Record<string, VarSlot> = {};
    private log: LogCallback;
    private requestInput: InputCallback;
    private setHighlight: HighlightCallback;
    private isRunning: boolean = false;

    constructor(
        nodes: Node[],
        edges: Edge[],
        log: LogCallback,
        requestInput: InputCallback,
        setHighlight: HighlightCallback
    ) {
        this.nodes = nodes;
        this.edges = edges;
        this.log = log;
        this.requestInput = requestInput;
        this.setHighlight = setHighlight;
    }

    stop() {
        this.isRunning = false;
        this.setHighlight(null);
    }

    async execute() {
        this.isRunning = true;
        this.vars = {};
        this.log('Execution started...');

        const startNode = this.nodes.find(n => n.type === 'start');
        if (!startNode) {
            this.log('Error: No Start node found.');
            return;
        }

        let currentNode: Node | undefined = startNode;

        while (currentNode && this.isRunning) {
            this.setHighlight(currentNode.id);
            await this.delay(500);

            try {
                switch (currentNode.type) {
                    case 'start':
                        break;
                    case 'end':
                        this.log('Execution finished.');
                        this.isRunning = false;
                        break;
                    case 'declare':
                        this.executeDeclare(currentNode);
                        break;
                    case 'process':
                        this.executeProcess(currentNode);
                        break;
                    case 'input':
                        await this.executeInput(currentNode);
                        break;
                    case 'output':
                        this.executeOutput(currentNode);
                        break;
                    case 'decision':
                        currentNode = this.executeDecision(currentNode);
                        continue;
                }
            } catch (error: any) {
                this.log(`Error: ${error.message}`);
                this.isRunning = false;
                break;
            }

            if (currentNode.type !== 'decision' && this.isRunning) {
                currentNode = this.getNextNode(currentNode.id);
            }
        }

        this.setHighlight(null);
    }

    private executeDeclare(node: Node) {
        const name: string = (node.data.variableName || '').trim();
        const type: VarType = node.data.variableType || 'int';
        if (!name) throw new Error('Blocco Dichiara senza nome di variabile');
        if (Object.prototype.hasOwnProperty.call(this.vars, name)) {
            throw new Error(`Variabile "${name}" già dichiarata`);
        }
        const initialRaw: string = node.data.initialValue || '';
        const value = initialRaw.trim()
            ? coerceValue(initialRaw, type)
            : defaultInitialFor(type);
        this.vars[name] = { type, value };
        this.log(`Declare: ${name} : ${type} = ${this.formatValue(value)}`);
    }

    private executeProcess(node: Node) {
        const expression: string = node.data.expression || '';
        if (!expression.trim()) {
            this.log('Process: (espressione vuota, ignorato)');
            return;
        }
        const explicitVar: string | undefined = node.data.variableName?.trim() || undefined;

        if (expression.includes('=') && !explicitVar) {
            const [varName, valueExpr] = expression.split('=').map((s: string) => s.trim());
            this.assertDeclared(varName);
            const value = this.evaluateExpression(valueExpr);
            this.assignValue(varName, value);
            this.log(`Process: ${varName} = ${this.formatValue(this.vars[varName].value)}`);
        } else if (explicitVar) {
            this.assertDeclared(explicitVar);
            const value = this.evaluateExpression(expression);
            this.assignValue(explicitVar, value);
            this.log(`Process: ${explicitVar} = ${this.formatValue(this.vars[explicitVar].value)}`);
        } else {
            this.evaluateExpression(expression);
            this.log(`Process: ${expression}`);
        }
    }

    private async executeInput(node: Node) {
        const varName: string = (node.data.variableName || '').trim();
        if (!varName) throw new Error('Blocco Input senza variabile assegnata');
        this.assertDeclared(varName);
        const slot = this.vars[varName];
        const prompt = node.data.prompt || `Inserisci ${varName}`;
        const raw = await this.requestInput(prompt);
        const value = coerceValue(raw, slot.type);
        slot.value = value;
        this.log(`Input: ${varName} = ${this.formatValue(value)}`);
    }

    private executeOutput(node: Node) {
        const parts: OutputPart[] = Array.isArray(node.data.parts) ? node.data.parts : [];
        if (parts.length === 0) {
            const legacy = node.data.expression;
            if (legacy) {
                const evaluated = this.evaluateExpression(legacy);
                this.log(`Output: ${this.formatValue(evaluated)}`);
            } else {
                this.log('Output: (vuoto)');
            }
            return;
        }
        const text = parts
            .map(p => {
                if (p.kind === 'text') return p.value;
                this.assertDeclared(p.value);
                return this.formatValue(this.vars[p.value].value);
            })
            .join('');
        this.log(`Output: ${text}`);
    }

    private executeDecision(node: Node): Node | undefined {
        const condition: string = node.data.condition || node.data.label || '';
        let result = false;
        try {
            result = !!this.evaluateExpression(condition);
            this.log(`Decision: ${condition} is ${result}`);
        } catch (e) {
            this.log(`Error evaluating condition: ${condition}`);
            throw e;
        }

        const trueEdge = this.edges.find(e => e.source === node.id && e.sourceHandle === 'true');
        const falseEdge = this.edges.find(e => e.source === node.id && e.sourceHandle === 'false');

        const nextEdge = result ? trueEdge : falseEdge;
        if (!nextEdge) return undefined;
        return this.nodes.find(n => n.id === nextEdge.target);
    }

    private getNextNode(nodeId: string): Node | undefined {
        const edge = this.edges.find(e => e.source === nodeId);
        if (!edge) return undefined;
        return this.nodes.find(n => n.id === edge.target);
    }

    private assertDeclared(name: string) {
        if (!Object.prototype.hasOwnProperty.call(this.vars, name)) {
            throw new Error(`Variabile "${name}" non dichiarata. Aggiungi un blocco Dichiara prima.`);
        }
    }

    private assignValue(name: string, value: any) {
        const slot = this.vars[name];
        if (slot.type === 'int') {
            const n = Number(value);
            if (!Number.isFinite(n)) throw new Error(`Valore non numerico per "${name}"`);
            slot.value = Math.trunc(n);
        } else if (slot.type === 'float') {
            const n = Number(value);
            if (!Number.isFinite(n)) throw new Error(`Valore non numerico per "${name}"`);
            slot.value = n;
        } else if (slot.type === 'bool') {
            slot.value = !!value;
        } else {
            slot.value = String(value);
        }
    }

    private evaluateExpression(expr: string): any {
        let evalExpr = expr;
        const sortedNames = Object.keys(this.vars).sort((a, b) => b.length - a.length);
        for (const name of sortedNames) {
            const val = this.vars[name].value;
            const regex = new RegExp(`\\b${name}\\b`, 'g');
            const replacement = typeof val === 'string' ? JSON.stringify(val) : String(val);
            evalExpr = evalExpr.replace(regex, replacement);
        }
        try {
            // eslint-disable-next-line no-new-func
            return new Function(`return (${evalExpr})`)();
        } catch (e: any) {
            throw new Error(`Espressione non valida: "${expr}" (${e.message})`);
        }
    }

    private formatValue(v: number | string | boolean): string {
        if (typeof v === 'string') return v;
        if (typeof v === 'boolean') return v ? 'true' : 'false';
        return String(v);
    }

    private delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
