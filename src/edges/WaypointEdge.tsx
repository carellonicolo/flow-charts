/**
 * @file WaypointEdge.tsx
 * @description Custom ReactFlow edge component with waypoint/control points support
 */

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { type EdgeProps, BaseEdge, Position, getSmoothStepPath, useReactFlow } from 'reactflow';
import { type WaypointEdgeData, type Waypoint } from '../types/waypoint';

/**
 * Smooth a polyline that has waypoints by adding small quadratic curves at
 * each corner, so the path looks like a routed circuit rather than a zig-zag.
 */
function calculatePathWithWaypoints(
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number,
  waypoints: Waypoint[]
): string {
  if (waypoints.length === 0) {
    return `M ${sourceX},${sourceY} L ${targetX},${targetY}`;
  }
  const sorted = [...waypoints].sort((a, b) => a.index - b.index);
  const pts: { x: number; y: number }[] = [
    { x: sourceX, y: sourceY },
    ...sorted.map(w => ({ x: w.x, y: w.y })),
    { x: targetX, y: targetY },
  ];
  const r = 10;
  let path = `M ${pts[0].x},${pts[0].y}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const prev = pts[i - 1];
    const cur = pts[i];
    const next = pts[i + 1];
    const v1x = cur.x - prev.x;
    const v1y = cur.y - prev.y;
    const v2x = next.x - cur.x;
    const v2y = next.y - cur.y;
    const l1 = Math.hypot(v1x, v1y) || 1;
    const l2 = Math.hypot(v2x, v2y) || 1;
    const k1 = Math.min(r, l1 / 2);
    const k2 = Math.min(r, l2 / 2);
    const startX = cur.x - (v1x / l1) * k1;
    const startY = cur.y - (v1y / l1) * k1;
    const endX = cur.x + (v2x / l2) * k2;
    const endY = cur.y + (v2y / l2) * k2;
    path += ` L ${startX},${startY} Q ${cur.x},${cur.y} ${endX},${endY}`;
  }
  path += ` L ${pts[pts.length - 1].x},${pts[pts.length - 1].y}`;
  return path;
}

/**
 * Props for WaypointCircle component
 */
interface WaypointCircleProps {
  waypoint: Waypoint;
  isSelected: boolean;
  onSelect: () => void;
  onDrag: (waypointId: string, x: number, y: number) => void;
  onRemove: () => void;
}

/**
 * Draggable circle representing a waypoint on the edge.
 * Double-click removes the waypoint.
 */
const WaypointCircle: React.FC<WaypointCircleProps> = ({
  waypoint,
  isSelected,
  onSelect,
  onDrag,
  onRemove,
}) => {
  const { screenToFlowPosition } = useReactFlow();
  const isDraggingRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);

  // Handle mouse down to start dragging
  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault(); // Prevent ReactFlow from intercepting
    isDraggingRef.current = true;
    setIsDragging(true);
    onSelect();

    // Mouse move handler for dragging
    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!isDraggingRef.current) return;

      // Convert screen coordinates to flow coordinates
      const pos = screenToFlowPosition({
        x: e.clientX,
        y: e.clientY
      });

      onDrag(waypoint.id, pos.x, pos.y);
    };

    // Mouse up handler to stop dragging
    const handleMouseUp = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      isDraggingRef.current = false;
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [waypoint.id, onSelect, onDrag, screenToFlowPosition]);

  return (
    <circle
      cx={waypoint.x}
      cy={waypoint.y}
      r={6}
      fill={isSelected ? '#8b5cf6' : '#6366f1'}
      stroke="white"
      strokeWidth={2}
      onMouseDown={handleMouseDown}
      onClick={(e) => { e.stopPropagation(); e.preventDefault(); onSelect(); }}
      onDoubleClick={(e) => { e.stopPropagation(); e.preventDefault(); onRemove(); }}
      style={{
        cursor: isDragging ? 'grabbing' : 'grab',
        pointerEvents: 'all'
      }}
      className="waypoint-circle nodrag nopan"
    >
      <title>Trascina per spostare · Doppio click per eliminare</title>
    </circle>
  );
};

/**
 * Main WaypointEdge component
 * Custom edge with support for waypoints/control points.
 * Waypoints can be removed by double-clicking on them. Edges are removed
 * by selecting them and pressing Backspace/Delete (handled in FlowEditor).
 */
export const WaypointEdge: React.FC<EdgeProps<WaypointEdgeData>> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  markerEnd,
  style
}) => {
  const { setEdges, screenToFlowPosition } = useReactFlow();
  const [selectedWaypoint, setSelectedWaypoint] = useState<string | null>(null);

  const waypoints = data?.waypoints || [];

  // Smooth-step path that respects the entry/exit direction from the handles.
  // This is what makes Decision edges automatically reorient when the user
  // moves the True/False outputs to left/right/bottom.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [smoothPath, _labelX, _labelY] = useMemo(() => {
    const dx = targetX - sourceX;
    const dy = targetY - sourceY;
    const sp = sourcePosition || Position.Bottom;
    const tp = targetPosition || Position.Top;

    // Straight-line shortcut: same column, top↔bottom orientation, no detour needed.
    // Avoids the "snake" effect getSmoothStepPath shows when nodes are close.
    const sameColumn = Math.abs(dx) < 4;
    const sameRow = Math.abs(dy) < 4;
    const verticalFlow =
      (sp === Position.Bottom && tp === Position.Top && dy > 0) ||
      (sp === Position.Top && tp === Position.Bottom && dy < 0);
    const horizontalFlow =
      (sp === Position.Right && tp === Position.Left && dx > 0) ||
      (sp === Position.Left && tp === Position.Right && dx < 0);

    if ((sameColumn && verticalFlow) || (sameRow && horizontalFlow)) {
      const labelX = (sourceX + targetX) / 2;
      const labelY = (sourceY + targetY) / 2;
      return [`M ${sourceX},${sourceY} L ${targetX},${targetY}`, labelX, labelY] as const;
    }

    // Otherwise, scale the offset by the actual gap between nodes so we don't
    // force a long zig-zag when the two blocks are close together.
    const gap = Math.max(Math.abs(dx), Math.abs(dy));
    const offset = Math.max(8, Math.min(40, gap / 4));

    return getSmoothStepPath({
      sourceX,
      sourceY,
      sourcePosition: sp,
      targetX,
      targetY,
      targetPosition: tp,
      borderRadius: 16,
      offset,
    });
  }, [sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition]);


  // Deselect waypoint when clicking outside the edge
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      // Check if click is outside waypoint circles and trash icon
      const target = e.target as Element;
      const isWaypointOrTrash = target.closest('.waypoint-circle') ||
        target.closest('foreignObject') ||
        target.classList?.contains('waypoint-circle');

      if (!isWaypointOrTrash && selectedWaypoint) {
        setSelectedWaypoint(null);
      }
    };

    document.addEventListener('click', handleGlobalClick);
    return () => document.removeEventListener('click', handleGlobalClick);
  }, [selectedWaypoint]);

  // Use smooth-step path (curved, orthogonal) when no manual waypoints.
  // With waypoints, fall back to a polyline routed through them with rounded corners.
  const edgePath = useMemo(() => {
    if (waypoints.length === 0) return smoothPath;
    return calculatePathWithWaypoints(sourceX, sourceY, targetX, targetY, waypoints);
  }, [smoothPath, sourceX, sourceY, targetX, targetY, waypoints]);

  // Handler for double-click to create waypoint
  const handleEdgeDoubleClick = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();

    // Convert screen coordinates to flow space
    const position = screenToFlowPosition({
      x: event.clientX,
      y: event.clientY
    });

    // Create new waypoint
    const newWaypoint: Waypoint = {
      id: `wp_${Date.now()}`,
      x: position.x,
      y: position.y,
      index: waypoints.length
    };

    // Update edge with new waypoint
    setEdges(edges => edges.map(edge => {
      if (edge.id !== id) return edge;
      return {
        ...edge,
        data: {
          ...edge.data,
          waypoints: [...(edge.data?.waypoints || []), newWaypoint]
        }
      };
    }));
  }, [id, waypoints, setEdges, screenToFlowPosition]);

  // Handler for dragging waypoint
  const handleWaypointDrag = useCallback((wpId: string, x: number, y: number) => {
    setEdges(edges => edges.map(edge => {
      if (edge.id !== id) return edge;
      return {
        ...edge,
        data: {
          ...edge.data,
          waypoints: edge.data?.waypoints?.map((wp: Waypoint) =>
            wp.id === wpId ? { ...wp, x, y } : wp
          )
        }
      };
    }));
  }, [id, setEdges]);

  // Handler for deleting waypoint
  const handleDeleteWaypoint = useCallback((wpId: string) => {
    setEdges(edges => edges.map(edge => {
      if (edge.id !== id) return edge;
      return {
        ...edge,
        data: {
          ...edge.data,
          waypoints: edge.data?.waypoints?.filter((wp: Waypoint) => wp.id !== wpId)
        }
      };
    }));
    setSelectedWaypoint(null);
  }, [id, setEdges]);

  // Handler for clicking on edge (deselects waypoint)
  const handleEdgeClick = useCallback((event: React.MouseEvent) => {
    // Deselect any selected waypoint when clicking on the edge
    if (selectedWaypoint) {
      event.stopPropagation();
      setSelectedWaypoint(null);
    }
  }, [selectedWaypoint]);

  return (
    <g className="react-flow__edge-waypoint">
      {/* Main edge path */}
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={style}
      />

      {/* Invisible wider path for easier double-clicking and clicking */}
      <path
        d={edgePath}
        fill="none"
        strokeWidth={30}
        stroke="transparent"
        onDoubleClick={handleEdgeDoubleClick}
        onClick={handleEdgeClick}
        style={{
          cursor: 'crosshair',
          pointerEvents: 'stroke'
        }}
        className="waypoint-edge-hitarea"
      />

      {/* Waypoint circles — double-click to remove */}
      {waypoints.map(wp => (
        <WaypointCircle
          key={wp.id}
          waypoint={wp}
          isSelected={selectedWaypoint === wp.id}
          onSelect={() => setSelectedWaypoint(wp.id)}
          onDrag={handleWaypointDrag}
          onRemove={() => handleDeleteWaypoint(wp.id)}
        />
      ))}
    </g>
  );
};
