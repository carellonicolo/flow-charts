import { type Node, type Edge } from 'reactflow';
import { VAR_TYPE_LABELS, type OutputPart, type VarType } from '../types/flow';

export type PseudoLine =
    | { kind: 'simple'; nodeId: string; text: string; nodeType: string }
    | { kind: 'if'; nodeId: string; condition: string; then: PseudoLine[]; else: PseudoLine[]; hasMerge: boolean }
    | { kind: 'while'; nodeId: string; condition: string; body: PseudoLine[] }
    | { kind: 'until'; nodeId: string; condition: string; body: PseudoLine[] }
    | { kind: 'goto'; targetNodeId: string };

interface Ctx {
    nodes: Node[];
    edges: Edge[];
}

function nodeById(ctx: Ctx, id: string | undefined): Node | undefined {
    if (!id) return undefined;
    return ctx.nodes.find(n => n.id === id);
}

function getSimpleNext(ctx: Ctx, id: string): string | undefined {
    const edge = ctx.edges.find(e => e.source === id && !e.sourceHandle);
    if (edge) return edge.target;
    const any = ctx.edges.find(e => e.source === id);
    return any?.target;
}

function reachesNode(
    ctx: Ctx,
    fromId: string | undefined,
    targetId: string,
    visited = new Set<string>()
): boolean {
    if (!fromId) return false;
    if (fromId === targetId) return true;
    if (visited.has(fromId)) return false;
    visited.add(fromId);
    const out = ctx.edges.filter(e => e.source === fromId);
    for (const e of out) {
        if (reachesNode(ctx, e.target, targetId, visited)) return true;
    }
    return false;
}

function findMergePoint(
    ctx: Ctx,
    aId: string | undefined,
    bId: string | undefined
): string | null {
    if (!aId || !bId) return null;
    const reachA = new Set<string>();
    const queueA = [aId];
    while (queueA.length) {
        const cur = queueA.shift()!;
        if (reachA.has(cur)) continue;
        reachA.add(cur);
        ctx.edges.filter(e => e.source === cur).forEach(e => queueA.push(e.target));
    }
    const queueB = [bId];
    const visitedB = new Set<string>();
    while (queueB.length) {
        const cur = queueB.shift()!;
        if (visitedB.has(cur)) continue;
        visitedB.add(cur);
        if (reachA.has(cur)) return cur;
        ctx.edges.filter(e => e.source === cur).forEach(e => queueB.push(e.target));
    }
    return null;
}

function simpleLineForNode(node: Node): string {
    switch (node.type) {
        case 'declare': {
            const name: string = node.data.variableName || '?';
            const type: VarType = node.data.variableType || 'int';
            const initial: string = node.data.initialValue || '';
            const typeLabel = VAR_TYPE_LABELS[type].pseudo;
            return initial
                ? `DECLARE ${name} : ${typeLabel} := ${initial}`
                : `DECLARE ${name} : ${typeLabel}`;
        }
        case 'process': {
            const expr: string = node.data.expression || '';
            const explicit: string | undefined = node.data.variableName?.trim() || undefined;
            if (explicit) return `${explicit} := ${expr}`;
            if (expr.includes('=')) {
                const [lhs, rhs] = expr.split('=').map((s: string) => s.trim());
                return `${lhs} := ${rhs}`;
            }
            return expr || '(noop)';
        }
        case 'input': {
            const v: string = node.data.variableName || '?';
            const prompt: string = node.data.prompt || '';
            return prompt ? `READ ${v}  // "${prompt}"` : `READ ${v}`;
        }
        case 'output': {
            const parts: OutputPart[] = Array.isArray(node.data.parts) ? node.data.parts : [];
            if (parts.length > 0) {
                const repr = parts.map(p => p.kind === 'text' ? `"${p.value}"` : p.value).join(', ');
                return `WRITE ${repr}`;
            }
            return `WRITE ${node.data.expression || node.data.label || '(empty)'}`;
        }
        case 'comment':
            return `// ${(node.data.label || '').replace(/\n/g, ' ')}`;
        case 'end':
            return 'END';
        default:
            return node.data.label || node.type || '';
    }
}

export function structureFlow(nodes: Node[], edges: Edge[]): PseudoLine[] {
    const ctx: Ctx = { nodes, edges };
    const start = nodes.find(n => n.type === 'start');
    if (!start) return [];

    function walk(fromId: string | undefined, stopId: string | null, visited: Set<string>): PseudoLine[] {
        const out: PseudoLine[] = [];
        let curId: string | undefined = fromId;

        while (curId && curId !== stopId) {
            if (visited.has(curId)) {
                out.push({ kind: 'goto', targetNodeId: curId });
                break;
            }
            visited.add(curId);

            const node = nodeById(ctx, curId);
            if (!node) break;

            if (node.type === 'start') {
                curId = getSimpleNext(ctx, curId);
                continue;
            }
            if (node.type === 'comment') {
                curId = getSimpleNext(ctx, curId);
                continue;
            }
            if (node.type === 'end') {
                out.push({ kind: 'simple', nodeId: node.id, text: 'END', nodeType: 'end' });
                break;
            }
            if (node.type === 'decision') {
                const trueEdge = edges.find(e => e.source === curId && e.sourceHandle === 'true');
                const falseEdge = edges.find(e => e.source === curId && e.sourceHandle === 'false');
                const trueT = trueEdge?.target;
                const falseT = falseEdge?.target;

                const trueLoops = !!(trueT && reachesNode(ctx, trueT, node.id));
                const falseLoops = !!(falseT && reachesNode(ctx, falseT, node.id));

                if (trueLoops && !falseLoops) {
                    const body = walk(trueT, node.id, new Set(visited));
                    out.push({
                        kind: 'while',
                        nodeId: node.id,
                        condition: node.data.condition || '',
                        body,
                    });
                    curId = falseT;
                    continue;
                }
                if (falseLoops && !trueLoops) {
                    const body = walk(falseT, node.id, new Set(visited));
                    out.push({
                        kind: 'until',
                        nodeId: node.id,
                        condition: node.data.condition || '',
                        body,
                    });
                    curId = trueT;
                    continue;
                }

                const merge = findMergePoint(ctx, trueT, falseT);
                const thenBranch = trueT ? walk(trueT, merge, new Set(visited)) : [];
                const elseBranch = falseT ? walk(falseT, merge, new Set(visited)) : [];
                out.push({
                    kind: 'if',
                    nodeId: node.id,
                    condition: node.data.condition || '',
                    then: thenBranch,
                    else: elseBranch,
                    hasMerge: merge !== null,
                });
                if (merge) {
                    visited.delete(merge);
                    curId = merge;
                } else {
                    curId = undefined;
                }
                continue;
            }

            out.push({
                kind: 'simple',
                nodeId: node.id,
                text: simpleLineForNode(node),
                nodeType: node.type || 'process',
            });
            curId = getSimpleNext(ctx, curId);
        }

        return out;
    }

    return walk(start.id, null, new Set());
}

export function renderPseudoText(lines: PseudoLine[], indent = 0): string {
    const ind = '  '.repeat(indent);
    const out: string[] = [];
    for (const line of lines) {
        if (line.kind === 'simple') {
            out.push(`${ind}${line.text}`);
        } else if (line.kind === 'if') {
            out.push(`${ind}IF ${line.condition} THEN`);
            out.push(renderPseudoText(line.then, indent + 1));
            if (line.else.length > 0) {
                out.push(`${ind}ELSE`);
                out.push(renderPseudoText(line.else, indent + 1));
            }
            out.push(`${ind}END IF`);
        } else if (line.kind === 'while') {
            out.push(`${ind}WHILE ${line.condition} DO`);
            out.push(renderPseudoText(line.body, indent + 1));
            out.push(`${ind}END WHILE`);
        } else if (line.kind === 'until') {
            out.push(`${ind}REPEAT`);
            out.push(renderPseudoText(line.body, indent + 1));
            out.push(`${ind}UNTIL ${line.condition}`);
        } else if (line.kind === 'goto') {
            out.push(`${ind}GOTO ${line.targetNodeId}`);
        }
    }
    return out.filter(s => s.length > 0).join('\n');
}

export function buildPseudocodeProgram(nodes: Node[], edges: Edge[]): string {
    const lines = structureFlow(nodes, edges);
    const body = renderPseudoText(lines, 1);
    return `BEGIN\n${body}\n`;
}
