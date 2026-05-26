import { useCallback, useEffect, useRef, useState } from 'react';
import { type Node, type Edge } from 'reactflow';

interface Snapshot {
    nodes: Node[];
    edges: Edge[];
}

/**
 * Strip volatile UI flags so selecting/hovering a node doesn't create a
 * spurious history entry.
 */
function normalize(s: { nodes: Node[]; edges: Edge[] }): Snapshot {
    return {
        nodes: s.nodes.map(n => {
            const { selected, dragging, ...rest } = n as any;
            return rest;
        }),
        edges: s.edges.map(e => {
            const { selected, ...rest } = e as any;
            return rest;
        }),
    };
}

function deepClone<T>(x: T): T {
    return JSON.parse(JSON.stringify(x));
}

function snapsEqual(a: Snapshot, b: Snapshot): boolean {
    return JSON.stringify(a) === JSON.stringify(b);
}

export interface FlowHistory {
    undo: () => void;
    redo: () => void;
    canUndo: boolean;
    canRedo: boolean;
    reset: () => void;
}

interface Options {
    debounceMs?: number;
    capacity?: number;
}

export function useFlowHistory(
    nodes: Node[],
    edges: Edge[],
    setNodes: (n: Node[]) => void,
    setEdges: (e: Edge[]) => void,
    options: Options = {},
): FlowHistory {
    const { debounceMs = 350, capacity = 100 } = options;
    const [past, setPast] = useState<Snapshot[]>([]);
    const [future, setFuture] = useState<Snapshot[]>([]);

    const lastSnap = useRef<Snapshot>(normalize({ nodes, edges }));
    const isApplyingHistory = useRef(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Track changes and store a normalized snapshot after a short idle window.
    useEffect(() => {
        if (isApplyingHistory.current) {
            // The change came from undo/redo itself: just refresh the baseline.
            isApplyingHistory.current = false;
            lastSnap.current = normalize({ nodes, edges });
            return;
        }

        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
            const current = normalize({ nodes, edges });
            if (snapsEqual(current, lastSnap.current)) return;

            const prev = lastSnap.current;
            setPast(p => {
                const next = [...p, deepClone(prev)];
                if (next.length > capacity) next.shift();
                return next;
            });
            setFuture([]);
            lastSnap.current = current;
        }, debounceMs);

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [nodes, edges, debounceMs, capacity]);

    const apply = useCallback((snap: Snapshot) => {
        isApplyingHistory.current = true;
        setNodes(deepClone(snap.nodes));
        setEdges(deepClone(snap.edges));
        lastSnap.current = snap;
    }, [setNodes, setEdges]);

    // Plain (non-functional) setters here: nesting setters inside a functional
    // updater would be called twice under React 18 StrictMode and double-push.
    const undo = useCallback(() => {
        if (past.length === 0) return;
        const previous = past[past.length - 1];
        const current = normalize({ nodes, edges });
        setPast(past.slice(0, -1));
        setFuture([deepClone(current), ...future]);
        apply(previous);
    }, [past, future, nodes, edges, apply]);

    const redo = useCallback(() => {
        if (future.length === 0) return;
        const next = future[0];
        const current = normalize({ nodes, edges });
        setFuture(future.slice(1));
        setPast([...past, deepClone(current)]);
        apply(next);
    }, [past, future, nodes, edges, apply]);

    const reset = useCallback(() => {
        setPast([]);
        setFuture([]);
        lastSnap.current = normalize({ nodes, edges });
    }, [nodes, edges]);

    // Keyboard shortcuts (Ctrl/Cmd+Z, Ctrl/Cmd+Shift+Z, Ctrl+Y)
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement | null;
            if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
                return;
            }
            const mod = e.ctrlKey || e.metaKey;
            if (!mod) return;
            const key = e.key.toLowerCase();
            if (key === 'z' && !e.shiftKey) {
                e.preventDefault();
                undo();
            } else if ((key === 'z' && e.shiftKey) || key === 'y') {
                e.preventDefault();
                redo();
            }
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [undo, redo]);

    return {
        undo,
        redo,
        canUndo: past.length > 0,
        canRedo: future.length > 0,
        reset,
    };
}
