import { type Node, type Edge } from 'reactflow';
import { type OutputPart, type VarType } from '../types/flow';
import { structureFlow, buildPseudocodeProgram, type PseudoLine } from './pseudocode';

export type TargetLang = 'python' | 'java' | 'c' | 'cpp' | 'javascript' | 'csharp' | 'php';

// Display order used by the language switcher and the combined export.
export const TARGET_LANGS: TargetLang[] = ['python', 'java', 'c', 'cpp', 'javascript', 'csharp', 'php'];

interface CodegenCtx {
    nodes: Node[];
    indent: string;
    declares: Node[];
    inputs: Set<string>; // variables that get a READ at some point
}

// ----- helpers -------------------------------------------------------------

function typeMap(t: VarType, lang: TargetLang): string {
    if (lang === 'python' || lang === 'javascript' || lang === 'php') return ''; // dynamically typed
    if (lang === 'java') {
        if (t === 'int') return 'int';
        if (t === 'float') return 'double';
        if (t === 'string') return 'String';
        if (t === 'bool') return 'boolean';
    }
    if (lang === 'c') {
        if (t === 'int') return 'int';
        if (t === 'float') return 'double';
        if (t === 'string') return 'char[256]';
        if (t === 'bool') return 'bool';
    }
    if (lang === 'cpp') {
        if (t === 'int') return 'int';
        if (t === 'float') return 'double';
        if (t === 'string') return 'std::string';
        if (t === 'bool') return 'bool';
    }
    if (lang === 'csharp') {
        if (t === 'int') return 'int';
        if (t === 'float') return 'double';
        if (t === 'string') return 'string';
        if (t === 'bool') return 'bool';
    }
    return 'int';
}

function pythonDefault(t: VarType): string {
    switch (t) {
        case 'int': return '0';
        case 'float': return '0.0';
        case 'string': return '""';
        case 'bool': return 'False';
    }
}

function jcDefault(t: VarType, lang: TargetLang): string {
    switch (t) {
        case 'int': return '0';
        case 'float': return '0.0';
        case 'string': return lang === 'c' ? '{0}' : '""';
        case 'bool': return lang === 'python' ? 'False' : 'false';
    }
}

// PHP requires every variable reference to be prefixed with `$`. We tokenize so
// string literals are left untouched and boolean/logical keywords are skipped.
function phpVars(src: string): string {
    return src.replace(/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|[A-Za-z_]\w*/g, (m) => {
        if (m[0] === '"' || m[0] === "'") return m;
        const low = m.toLowerCase();
        if (['true', 'false', 'null', 'and', 'or', 'not', 'vero', 'falso'].includes(low)) return m;
        return '$' + m;
    });
}

// Left-hand side of an assignment / declared name, adjusted per language.
function vname(name: string, lang: TargetLang): string {
    const n = name.trim();
    return lang === 'php' ? '$' + n : n;
}

/**
 * Translate a single boolean/numeric expression from pseudocode-ish (Italian
 * variables, ==, !=, &&, ||) into the target language. Most syntax is already
 * compatible so we only adjust booleans for Python.
 */
function expr(src: string, lang: TargetLang): string {
    if (!src) return '';
    let out = src;
    if (lang === 'python') {
        out = out.replace(/\b&&\b/g, ' and ');
        out = out.replace(/\b\|\|\b/g, ' or ');
        out = out.replace(/\b!(?!=)/g, ' not ');
        out = out.replace(/\btrue\b/gi, 'True');
        out = out.replace(/\bfalse\b/gi, 'False');
    } else if (lang === 'php') {
        out = out.replace(/\bvero\b/gi, 'true');
        out = out.replace(/\bfalso\b/gi, 'false');
        out = phpVars(out);
    } else {
        out = out.replace(/\bvero\b/gi, 'true');
        out = out.replace(/\bfalso\b/gi, 'false');
    }
    return out.replace(/\s+/g, ' ').trim();
}

// ----- statement emitters --------------------------------------------------

function emitSimple(node: Node, ctx: CodegenCtx, lang: TargetLang): string {
    const i = ctx.indent;
    if (node.type === 'process') {
        const explicit = node.data.variableName?.trim();
        const e: string = node.data.expression || '';
        if (explicit) {
            return `${i}${vname(explicit, lang)} = ${expr(e, lang)}${stmtTerm(lang)}`;
        }
        if (e.includes('=')) {
            const [lhs, rhs] = e.split('=').map((s: string) => s.trim());
            return `${i}${vname(lhs, lang)} = ${expr(rhs, lang)}${stmtTerm(lang)}`;
        }
        return `${i}${expr(e, lang)}${stmtTerm(lang)}`;
    }
    if (node.type === 'input') {
        const v: string = node.data.variableName || '';
        const t: VarType = findVarType(v, ctx) || 'string';
        const prompt: string = node.data.prompt || '';
        return readStatement(v, t, prompt, lang, i);
    }
    if (node.type === 'output') {
        const parts: OutputPart[] = Array.isArray(node.data.parts) ? node.data.parts : [];
        return writeStatement(parts, ctx, lang, i, node);
    }
    if (node.type === 'comment') {
        const text = (node.data.label || '').replace(/\n/g, ' ');
        return `${i}${commentMark(lang)} ${text}`;
    }
    if (node.type === 'end') {
        return ''; // implicit
    }
    return '';
}

function commentMark(lang: TargetLang): string {
    return lang === 'python' ? '#' : '//';
}

function stmtTerm(lang: TargetLang): string {
    return lang === 'python' ? '' : ';';
}

function findVarType(name: string, ctx: CodegenCtx): VarType | undefined {
    const d = ctx.declares.find(n => (n.data.variableName || '').trim() === name);
    return d ? (d.data.variableType as VarType) : undefined;
}

function readStatement(v: string, t: VarType, prompt: string, lang: TargetLang, indent: string): string {
    const lines: string[] = [];
    const promptShow = prompt ? prompt.replace(/"/g, '\\"') : `Inserisci ${v}`;
    switch (lang) {
        case 'python':
            if (t === 'int') lines.push(`${indent}${v} = int(input("${promptShow}: "))`);
            else if (t === 'float') lines.push(`${indent}${v} = float(input("${promptShow}: "))`);
            else if (t === 'bool') lines.push(`${indent}${v} = input("${promptShow}: ").strip().lower() in ("true", "1", "sì", "si")`);
            else lines.push(`${indent}${v} = input("${promptShow}: ")`);
            return lines.join('\n');
        case 'java':
            lines.push(`${indent}System.out.print("${promptShow}: ");`);
            if (t === 'int') lines.push(`${indent}${v} = sc.nextInt();`);
            else if (t === 'float') lines.push(`${indent}${v} = sc.nextDouble();`);
            else if (t === 'bool') lines.push(`${indent}${v} = sc.nextBoolean();`);
            else lines.push(`${indent}${v} = sc.next();`);
            return lines.join('\n');
        case 'c':
            lines.push(`${indent}printf("${promptShow}: ");`);
            if (t === 'int') lines.push(`${indent}scanf("%d", &${v});`);
            else if (t === 'float') lines.push(`${indent}scanf("%lf", &${v});`);
            else if (t === 'string') lines.push(`${indent}scanf("%255s", ${v});`);
            else lines.push(`${indent}{ int _b; scanf("%d", &_b); ${v} = _b != 0; }`);
            return lines.join('\n');
        case 'cpp':
            lines.push(`${indent}std::cout << "${promptShow}: ";`);
            lines.push(`${indent}std::cin >> ${v};`);
            return lines.join('\n');
        case 'javascript': {
            const ask = `prompt("${promptShow}: ")`;
            if (t === 'int') lines.push(`${indent}${v} = parseInt(${ask}, 10);`);
            else if (t === 'float') lines.push(`${indent}${v} = parseFloat(${ask});`);
            else if (t === 'bool') lines.push(`${indent}${v} = ["true", "1", "sì", "si"].includes(${ask}.trim().toLowerCase());`);
            else lines.push(`${indent}${v} = ${ask};`);
            return lines.join('\n');
        }
        case 'csharp':
            lines.push(`${indent}Console.Write("${promptShow}: ");`);
            if (t === 'int') lines.push(`${indent}${v} = int.Parse(Console.ReadLine());`);
            else if (t === 'float') lines.push(`${indent}${v} = double.Parse(Console.ReadLine());`);
            else if (t === 'bool') lines.push(`${indent}${v} = bool.Parse(Console.ReadLine());`);
            else lines.push(`${indent}${v} = Console.ReadLine();`);
            return lines.join('\n');
        case 'php': {
            const pv = '$' + v;
            lines.push(`${indent}echo "${promptShow}: ";`);
            if (t === 'int') lines.push(`${indent}${pv} = (int) trim(fgets(STDIN));`);
            else if (t === 'float') lines.push(`${indent}${pv} = (float) trim(fgets(STDIN));`);
            else if (t === 'bool') lines.push(`${indent}${pv} = in_array(strtolower(trim(fgets(STDIN))), ["true", "1", "sì", "si"], true);`);
            else lines.push(`${indent}${pv} = trim(fgets(STDIN));`);
            return lines.join('\n');
        }
    }
}

function writeStatement(parts: OutputPart[], _ctx: CodegenCtx, lang: TargetLang, indent: string, node: Node): string {
    if (parts.length === 0) {
        const legacy = node.data.expression;
        if (legacy) {
            return writeFromTokens([{ kind: 'expr', value: legacy }], lang, indent);
        }
        return `${indent}${commentMark(lang)} output vuoto`;
    }
    const tokens = parts.map(p => p.kind === 'text'
        ? { kind: 'text' as const, value: p.value }
        : { kind: 'var' as const, value: p.value });
    return writeFromTokens(tokens, lang, indent);
}

type Tok =
    | { kind: 'text'; value: string }
    | { kind: 'var'; value: string }
    | { kind: 'expr'; value: string };

function writeFromTokens(tokens: Tok[], lang: TargetLang, indent: string): string {
    if (lang === 'python') {
        const args = tokens.map(t => {
            if (t.kind === 'text') return JSON.stringify(t.value);
            return `str(${t.value})`;
        });
        return `${indent}print(${args.join(' + ')})`;
    }
    if (lang === 'java') {
        const args = tokens.map(t => t.kind === 'text' ? JSON.stringify(t.value) : t.value);
        return `${indent}System.out.println(${args.join(' + ')});`;
    }
    if (lang === 'cpp') {
        const stream = tokens.map(t => t.kind === 'text' ? JSON.stringify(t.value) : t.value).join(' << ');
        return `${indent}std::cout << ${stream} << std::endl;`;
    }
    if (lang === 'javascript') {
        const args = tokens.map(t => t.kind === 'text'
            ? JSON.stringify(t.value)
            : (tokens.length > 1 ? `String(${t.value})` : t.value));
        return `${indent}console.log(${args.join(' + ')});`;
    }
    if (lang === 'csharp') {
        const hasVar = tokens.some(t => t.kind !== 'text');
        if (!hasVar) {
            const s = tokens.map(t => t.value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')).join('');
            return `${indent}Console.WriteLine("${s}");`;
        }
        const inner = tokens.map(t => t.kind === 'text'
            ? t.value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\{/g, '{{').replace(/\}/g, '}}')
            : `{${t.value}}`).join('');
        return `${indent}Console.WriteLine($"${inner}");`;
    }
    if (lang === 'php') {
        const single = (s: string) => `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
        const parts = tokens.map(t => t.kind === 'text' ? single(t.value) : phpVars(t.value));
        return `${indent}echo ${parts.join(' . ')} . PHP_EOL;`;
    }
    // C
    const fmt = tokens.map(t => {
        if (t.kind === 'text') return t.value.replace(/%/g, '%%').replace(/"/g, '\\"');
        return '%g';
    }).join('');
    const args = tokens.filter(t => t.kind !== 'text').map(t => (t as { value: string }).value);
    const argList = args.length > 0 ? ', ' + args.map(a => `(double)(${a})`).join(', ') : '';
    return `${indent}printf("${fmt}\\n"${argList});`;
}

function emitBlock(lines: PseudoLine[], ctx: CodegenCtx, lang: TargetLang): string {
    const out: string[] = [];
    for (const ln of lines) {
        if (ln.kind === 'simple') {
            const node = ctx.nodes.find(n => n.id === ln.nodeId);
            if (node) {
                const s = emitSimple(node, ctx, lang);
                if (s.length > 0) out.push(s);
            }
        } else if (ln.kind === 'if') {
            const inner: CodegenCtx = { ...ctx, indent: ctx.indent + indentUnit(lang) };
            const c = expr(ln.condition, lang);
            if (lang === 'python') {
                out.push(`${ctx.indent}if ${c}:`);
                const body = emitBlock(ln.then, inner, lang);
                out.push(body || `${inner.indent}pass`);
                if (ln.else.length > 0) {
                    out.push(`${ctx.indent}else:`);
                    out.push(emitBlock(ln.else, inner, lang) || `${inner.indent}pass`);
                }
            } else {
                out.push(`${ctx.indent}if (${c}) {`);
                out.push(emitBlock(ln.then, inner, lang));
                if (ln.else.length > 0) {
                    out.push(`${ctx.indent}} else {`);
                    out.push(emitBlock(ln.else, inner, lang));
                }
                out.push(`${ctx.indent}}`);
            }
        } else if (ln.kind === 'while') {
            const inner: CodegenCtx = { ...ctx, indent: ctx.indent + indentUnit(lang) };
            const c = expr(ln.condition, lang);
            if (lang === 'python') {
                out.push(`${ctx.indent}while ${c}:`);
                out.push(emitBlock(ln.body, inner, lang) || `${inner.indent}pass`);
            } else {
                out.push(`${ctx.indent}while (${c}) {`);
                out.push(emitBlock(ln.body, inner, lang));
                out.push(`${ctx.indent}}`);
            }
        } else if (ln.kind === 'until') {
            const inner: CodegenCtx = { ...ctx, indent: ctx.indent + indentUnit(lang) };
            const c = expr(ln.condition, lang);
            if (lang === 'python') {
                out.push(`${ctx.indent}while True:`);
                out.push(emitBlock(ln.body, inner, lang) || `${inner.indent}pass`);
                out.push(`${inner.indent}if ${c}:`);
                out.push(`${inner.indent}${indentUnit(lang)}break`);
            } else {
                out.push(`${ctx.indent}do {`);
                out.push(emitBlock(ln.body, inner, lang));
                out.push(`${ctx.indent}} while (!(${c}));`);
            }
        } else if (ln.kind === 'goto') {
            out.push(`${ctx.indent}${commentMark(lang)} GOTO ${ln.targetNodeId}`);
        }
    }
    return out.filter(s => s.length > 0).join('\n');
}

function indentUnit(lang: TargetLang): string {
    return lang === 'python' ? '    ' : '    ';
}

function emitDeclarations(declares: Node[], lang: TargetLang, indent: string): string[] {
    const lines: string[] = [];
    for (const d of declares) {
        const name: string = (d.data.variableName || '').trim();
        if (!name) continue;
        const type: VarType = d.data.variableType || 'int';
        const initial: string = (d.data.initialValue || '').trim();
        if (lang === 'python') {
            const val = initial ? expr(initial, lang) : pythonDefault(type);
            lines.push(`${indent}${name} = ${val}`);
        } else if (lang === 'java' || lang === 'cpp') {
            const t = typeMap(type, lang);
            const val = initial ? expr(initial, lang) : jcDefault(type, lang);
            lines.push(`${indent}${t} ${name} = ${val};`);
        } else if (lang === 'csharp') {
            const t = typeMap(type, lang);
            const val = initial ? expr(initial, lang) : jcDefault(type, lang);
            lines.push(`${indent}${t} ${name} = ${val};`);
        } else if (lang === 'javascript') {
            const val = initial ? expr(initial, lang) : jcDefault(type, lang);
            lines.push(`${indent}let ${name} = ${val};`);
        } else if (lang === 'php') {
            const val = initial ? expr(initial, lang) : jcDefault(type, lang);
            lines.push(`${indent}$${name} = ${val};`);
        } else if (lang === 'c') {
            const t = typeMap(type, lang);
            if (type === 'string') {
                lines.push(`${indent}char ${name}[256] = ${initial ? expr(initial, lang) : '""'};`);
            } else {
                const val = initial ? expr(initial, lang) : jcDefault(type, lang);
                lines.push(`${indent}${t} ${name} = ${val};`);
            }
        }
    }
    return lines;
}

// ----- top-level program emit ---------------------------------------------

export function generateCode(nodes: Node[], edges: Edge[], lang: TargetLang): string {
    const ast = structureFlow(nodes, edges);
    const declares = nodes.filter(n => n.type === 'declare');
    const usesInput = nodes.some(n => n.type === 'input');

    const ctx: CodegenCtx = {
        nodes,
        indent: '',
        declares,
        inputs: new Set(),
    };

    if (lang === 'python') {
        const indent = '';
        const decls = emitDeclarations(declares, lang, indent);
        const body = emitBlock(ast, { ...ctx, indent }, lang);
        const parts = [
            decls.length > 0 ? decls.join('\n') : '',
            body,
        ].filter(Boolean);
        return parts.join('\n\n');
    }

    if (lang === 'java') {
        const indent = '        ';
        const decls = emitDeclarations(declares, lang, indent);
        const body = emitBlock(ast, { ...ctx, indent }, lang);
        const lines: string[] = [];
        if (usesInput) lines.push('import java.util.Scanner;', '');
        lines.push('public class Program {');
        lines.push('    public static void main(String[] args) {');
        if (usesInput) lines.push(`${indent}Scanner sc = new Scanner(System.in);`);
        if (decls.length > 0) lines.push(decls.join('\n'));
        if (body) lines.push(body);
        lines.push('    }');
        lines.push('}');
        return lines.join('\n');
    }

    if (lang === 'c') {
        const indent = '    ';
        const decls = emitDeclarations(declares, lang, indent);
        const body = emitBlock(ast, { ...ctx, indent }, lang);
        const needsStdBool = declares.some(d => d.data.variableType === 'bool');
        const lines: string[] = ['#include <stdio.h>'];
        if (needsStdBool) lines.push('#include <stdbool.h>');
        lines.push('', 'int main(void) {');
        if (decls.length > 0) lines.push(decls.join('\n'));
        if (body) lines.push(body);
        lines.push(`${indent}return 0;`);
        lines.push('}');
        return lines.join('\n');
    }

    if (lang === 'javascript') {
        const indent = '';
        const decls = emitDeclarations(declares, lang, indent);
        const body = emitBlock(ast, { ...ctx, indent }, lang);
        const parts = [
            decls.length > 0 ? decls.join('\n') : '',
            body,
        ].filter(Boolean);
        return parts.join('\n\n');
    }

    if (lang === 'csharp') {
        const indent = '        ';
        const decls = emitDeclarations(declares, lang, indent);
        const body = emitBlock(ast, { ...ctx, indent }, lang);
        const lines: string[] = ['using System;', '', 'class Program {', '    static void Main() {'];
        if (decls.length > 0) lines.push(decls.join('\n'));
        if (body) lines.push(body);
        lines.push('    }');
        lines.push('}');
        return lines.join('\n');
    }

    if (lang === 'php') {
        const indent = '';
        const decls = emitDeclarations(declares, lang, indent);
        const body = emitBlock(ast, { ...ctx, indent }, lang);
        const lines: string[] = ['<?php', ''];
        if (decls.length > 0) lines.push(decls.join('\n'));
        if (body) lines.push(body);
        return lines.join('\n');
    }

    // cpp
    const indent = '    ';
    const decls = emitDeclarations(declares, lang, indent);
    const body = emitBlock(ast, { ...ctx, indent }, lang);
    const usesString = declares.some(d => d.data.variableType === 'string');
    const lines: string[] = ['#include <iostream>'];
    if (usesString) lines.push('#include <string>');
    lines.push('', 'int main() {');
    if (decls.length > 0) lines.push(decls.join('\n'));
    if (body) lines.push(body);
    lines.push(`${indent}return 0;`);
    lines.push('}');
    return lines.join('\n');
}

export const LANG_LABELS: Record<TargetLang, string> = {
    python: 'Python',
    java: 'Java',
    c: 'C',
    cpp: 'C++',
    javascript: 'JavaScript',
    csharp: 'C#',
    php: 'PHP',
};

// Export document: the pseudocode, optionally followed by a section per
// language. With no languages it returns the plain pseudocode (no banners);
// with one or more it adds a banner before each section.
export function buildExport(nodes: Node[], edges: Edge[], langs: TargetLang[]): string {
    const pseudo = buildPseudocodeProgram(nodes, edges).trimEnd();
    if (langs.length === 0) return pseudo + '\n';

    const bar = '='.repeat(54);
    const section = (title: string, body: string) => `${bar}\n  ${title}\n${bar}\n\n${body.trimEnd()}`;
    const blocks: string[] = [section('PSEUDOCODICE', pseudo)];
    for (const lang of langs) {
        blocks.push(section(LANG_LABELS[lang], generateCode(nodes, edges, lang)));
    }
    return blocks.join('\n\n\n') + '\n';
}
