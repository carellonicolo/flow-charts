/**
 * @file WaypointEdge.tsx
 * @description Custom ReactFlow edge component with waypoint/control points support
 */

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { type EdgeProps, BaseEdge, useReactFlow } from 'reactflow';
import { Trash } from 'lucide-react';
import { type WaypointEdgeData, type Waypoint } from '../types/waypoint';

/**
 * Calculate SVG path through waypoints using line segments
 *
 * @param sourceX - X coordinate of source node
 * @param sourceY - Y coordinate of source node
 * @param targetX - X coordinate of target node
 * @param targetY - Y coordinate of target node
 * @param waypoints - Array of waypoints to route through
 * @returns SVG path string
 */
function calculatePathWithWaypoints(
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number,
  waypoints: Waypoint[]
): string {
  // No waypoints → straight line
  if (waypoints.length === 0) {
    return `M ${sourceX},${sourceY} L ${targetX},${targetY}`;
  }

  // Sort waypoints by index to maintain order
  const sorted = [...waypoints].sort((a, b) => a.index - b.index);

  // Build path with linear segments through waypoints
  let path = `M ${sourceX},${sourceY}`;
  sorted.forEach(wp => {
    path += ` L ${wp.x},${wp.y}`;
  });
  path += ` L ${targetX},${targetY}`;

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
}

/**
 * Draggable circle representing a waypoint on the edge
 */
const WaypointCircle: React.FC<WaypointCircleProps> = ({
  waypoint,
  isSelected,
  onSelect,
  onDrag
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
      style={{
        cursor: isDragging ? 'grabbing' : 'grab',
        pointerEvents: 'all'
      }}
      className="waypoint-circle nodrag nopan"
    />
  );
};

/**
 * Props for TrashIcon component
 */
interface TrashIconProps {
  position: Waypoint;
  onDelete: () => void;
}

/**
 * Trash icon button for deleting a waypoint
 */
const TrashIcon: React.FC<TrashIconProps> = ({ position, onDelete }) => {
  // Position icon to the right of the waypoint
  const iconX = position.x + 15;
  const iconY = position.y - 10;

  return (
    <foreignObject
      x={iconX - 14}
      y={iconY - 14}
      width={28}
      height={28}
      style={{ overflow: 'visible', pointerEvents: 'none' }}
    >
      <div
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="trash-icon-container"
        style={{
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          border: '2px solid #ef4444',
          backgroundColor: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          pointerEvents: 'all',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}
      >
        <Trash
          size={16}
          color="#ef4444"
        />
      </div>
    </foreignObject>
  );
};

/**
 * Main WaypointEdge component
 * Custom edge with support for waypoints/control points
 */
export const WaypointEdge: React.FC<EdgeProps<WaypointEdgeData>> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
  markerEnd,
  style
}) => {
  const { setEdges, screenToFlowPosition } = useReactFlow();
  const [selectedWaypoint, setSelectedWaypoint] = useState<string | null>(null);

  const waypoints = data?.waypoints || [];

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

  // Calculate SVG path (memoized for performance)
  const edgePath = useMemo(() =>
    calculatePathWithWaypoints(sourceX, sourceY, targetX, targetY, waypoints),
    [sourceX, sourceY, targetX, targetY, waypoints]
  );

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

      {/* Waypoint circles */}
      {waypoints.map(wp => (
        <WaypointCircle
          key={wp.id}
          waypoint={wp}
          isSelected={selectedWaypoint === wp.id}
          onSelect={() => setSelectedWaypoint(wp.id)}
          onDrag={handleWaypointDrag}
        />
      ))}

      {/* Trash icon for selected waypoint */}
      {selectedWaypoint && (
        <TrashIcon
          position={waypoints.find(wp => wp.id === selectedWaypoint)!}
          onDelete={() => handleDeleteWaypoint(selectedWaypoint)}
        />
      )}
    </g>
  );
};
