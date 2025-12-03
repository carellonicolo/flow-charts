import type { Edge } from 'reactflow';

// Switch edge a modalità manuale
export function switchToManualMode(edge: Edge): Edge {
  return {
    ...edge,
    type: 'editable',
    data: { ...edge.data, routingMode: 'manual', waypoints: edge.data?.waypoints || [] },
  };
}

// Switch edge a modalità automatica
export function switchToAutoMode(edge: Edge): Edge {
  return {
    ...edge,
    type: 'smart',
    data: { ...edge.data, routingMode: 'auto', waypoints: [] },
  };
}

// Reset waypoints (mantiene modalità)
export function resetEdgeWaypoints(edge: Edge): Edge {
  return {
    ...edge,
    data: { ...edge.data, waypoints: [] },
  };
}

// Check se edge è in modalità manuale
export function isManualMode(edge: Edge): boolean {
  return edge.data?.routingMode === 'manual' || edge.type === 'editable';
}
