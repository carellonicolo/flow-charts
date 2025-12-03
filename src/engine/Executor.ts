import type { Node, Edge } from 'reactflow';

export type LogCallback = (message: string) => void;
export type InputCallback = (prompt: string) => Promise<string>;
export type HighlightCallback = (nodeId: string | null) => void;

export class Executor {
    private nodes: Node[];
    private edges: Edge[];
    private variables: Record<string, any> = {};
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
        this.variables = {};
        this.log('Execution started...');

        const startNode = this.nodes.find(n => n.type === 'start');
        if (!startNode) {
            this.log('Error: No Start node found.');
            return;
        }

        let currentNode: Node | undefined = startNode;

        while (currentNode && this.isRunning) {
            this.setHighlight(currentNode.id);
            await this.delay(500); // Visual delay

            try {
                switch (currentNode.type) {
                    case 'start':
                        break;
                    case 'end':
                        this.log('Execution finished.');
                        this.isRunning = false;
                        break;
                    case 'process':
                        await this.executeProcess(currentNode);
                        break;
                    case 'input':
                        await this.executeInput(currentNode);
                        break;
                    case 'output':
                        await this.executeOutput(currentNode);
                        break;
                    case 'decision':
                        currentNode = this.executeDecision(currentNode);
                        continue; // Decision determines next node explicitly
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

    private async executeProcess(node: Node) {
        // Prefer structured data, fallback to label parsing
        const expression = node.data.expression || node.data.label;

        if (expression.includes('=')) {
            const [varName, valueExpr] = expression.split('=').map((s: string) => s.trim());
            const value = this.evaluateExpression(valueExpr);
            this.variables[varName] = value;
            this.log(`Process: ${varName} = ${value}`);
        } else {
            this.log(`Process: Executing ${expression}`);
        }
    }

    private async executeInput(node: Node) {
        const varName = node.data.variableName || node.data.label;
        const value = await this.requestInput(`Enter value for ${varName}:`);
        const numValue = Number(value);
        this.variables[varName] = isNaN(numValue) ? value : numValue;
        this.log(`Input: ${varName} = ${this.variables[varName]}`);
    }

    private async executeOutput(node: Node) {
        const expression = node.data.variableName || node.data.label;
        let value;
        if (expression.startsWith('"') || expression.startsWith("'")) {
            value = expression.slice(1, -1);
        } else if (this.variables.hasOwnProperty(expression)) {
            value = this.variables[expression];
        } else {
            value = expression;
        }
        this.log(`Output: ${value}`);
    }

    private executeDecision(node: Node): Node | undefined {
        const condition = node.data.condition || node.data.label;
        // Very simple evaluation: x > 5
        // We'll replace variables with their values and eval
        let evalCondition = condition;
        for (const [key, val] of Object.entries(this.variables)) {
            // Regex to replace whole words only
            const regex = new RegExp(`\\b${key}\\b`, 'g');
            evalCondition = evalCondition.replace(regex, typeof val === 'string' ? `"${val}"` : val);
        }

        let result = false;
        try {
            // eslint-disable-next-line no-new-func
            result = new Function(`return ${evalCondition}`)();
            this.log(`Decision: ${condition} is ${result}`);
        } catch (e) {
            this.log(`Error evaluating condition: ${condition}`);
            throw e;
        }

        // Find edges
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

    private evaluateExpression(expr: string): any {
        let evalExpr = expr;
        for (const [key, val] of Object.entries(this.variables)) {
            const regex = new RegExp(`\\b${key}\\b`, 'g');
            evalExpr = evalExpr.replace(regex, typeof val === 'string' ? `"${val}"` : val);
        }
        try {
            // eslint-disable-next-line no-new-func
            return new Function(`return ${evalExpr}`)();
        } catch (e) {
            return expr; // Fallback to string literal if eval fails
        }
    }

    private delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
