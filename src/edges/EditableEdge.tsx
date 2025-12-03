import React, { useCallback, useState, memo, useMemo } from 'react';
import { useStore, getBezierPath, EdgeLabelRenderer, type Edge } from 'reactflow';

interface WaypointData {
  id: string;
  x: number;
  y: number;
}

interface EditableEdgeProps {
  id: string;
  source: string;
  target: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  sourcePosition: any;
  targetPosition: any;
  style?: React.CSSProperties;
  markerEnd?: string;
  data?: any;
  selected?: boolean;
}

const EditableEdge: React.FC<EditableEdgeProps> = ({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
  selected,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [draggedWaypointId, setDraggedWaypointId] = useState<string | null>(null);

  const updateEdge = useStore((state) => state.updateEdge);
  const waypoints = data?.waypoints || [];

  // Calcola path SVG attraverso i waypoints
  const getPathWithWaypoints = useCallback(() => {
    if (waypoints.length === 0) {
      // Nessun waypoint = bezier standard
      return getBezierPath({
        sourceX, sourceY, sourcePosition,
        targetX, targetY, targetPosition,
      })[0];
    }

    // Costruisci path SVG con curve quadratiche attraverso waypoints
    let pathData = `M ${sourceX},${sourceY}`;

    for (let i = 0; i < waypoints.length; i++) {
      const wp = waypoints[i];
      const prevX = i === 0 ? sourceX : waypoints[i - 1].x;
      const prevY = i === 0 ? sourceY : waypoints[i - 1].y;

      // Curve quadratica con punto di controllo
      const controlX = (prevX + wp.x) / 2;
      const controlY = prevY;
      pathData += ` Q ${controlX},${controlY} ${wp.x},${wp.y}`;
    }

    // Ultimo waypoint → target
    const lastWp = waypoints[waypoints.length - 1];
    const controlX = (lastWp.x + targetX) / 2;
    const controlY = lastWp.y;
    pathData += ` Q ${controlX},${controlY} ${targetX},${targetY}`;

    return pathData;
  }, [waypoints, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition]);

  const edgePath = useMemo(() => getPathWithWaypoints(), [getPathWithWaypoints]);

  // Click edge → aggiungi waypoint
  const handleEdgeClick = useCallback((event: React.MouseEvent) => {
    if (data?.routingMode !== 'manual') return;
    event.stopPropagation();

    const svgElement = (event.target as SVGElement).ownerSVGElement;
    if (!svgElement) return;

    const bounds = svgElement.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;

    const newWaypoint: WaypointData = {
      id: `wp-${Date.now()}`,
      x,
      y
    };

    updateEdge(id, {
      data: { ...data, waypoints: [...waypoints, newWaypoint] }
    });
  }, [id, waypoints, data, updateEdge]);

  // Drag waypoint handlers
  const handleWaypointMouseDown = useCallback(
    (waypointId: string) => (event: React.MouseEvent) => {
      event.stopPropagation();
      setIsDragging(true);
      setDraggedWaypointId(waypointId);
    }, []
  );

  const handleWaypointMouseMove = useCallback((event: React.MouseEvent) => {
    if (!isDragging || !draggedWaypointId) return;

    const svgElement = document.querySelector('.react-flow__edges');
    if (!svgElement) return;

    const bounds = svgElement.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;

    const updatedWaypoints = waypoints.map((wp) =>
      wp.id === draggedWaypointId ? { ...wp, x, y } : wp
    );

    updateEdge(id, { data: { ...data, waypoints: updatedWaypoints } });
  }, [isDragging, draggedWaypointId, waypoints, id, data, updateEdge]);

  const handleWaypointMouseUp = useCallback(() => {
    setIsDragging(false);
    setDraggedWaypointId(null);
  }, []);

  // Double-click waypoint → rimuovi
  const handleWaypointDoubleClick = useCallback(
    (waypointId: string) => (event: React.MouseEvent) => {
      event.stopPropagation();
      const updatedWaypoints = waypoints.filter((wp) => wp.id !== waypointId);
      updateEdge(id, { data: { ...data, waypoints: updatedWaypoints } });
    }, [waypoints, id, data, updateEdge]
  );

  return (
    <>
      {/* Edge path principale */}
      <path
        id={id}
        style={{
          ...style,
          stroke: selected ? '#ec4899' : style.stroke || '#6366f1',
          strokeWidth: selected ? 3 : style.strokeWidth || 2,
        }}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
        onClick={handleEdgeClick}
      />

      {/* Waypoint controls (solo in manual mode) */}
      {data?.routingMode === 'manual' && (
        <EdgeLabelRenderer>
          {waypoints.map((waypoint) => (
            <div
              key={waypoint.id}
              style={{
                position: 'absolute',
                transform: `translate(-50%, -50%) translate(${waypoint.x}px, ${waypoint.y}px)`,
                pointerEvents: 'all',
                cursor: 'move',
                zIndex: 1000,
              }}
              onMouseDown={handleWaypointMouseDown(waypoint.id)}
              onMouseMove={handleWaypointMouseMove}
              onMouseUp={handleWaypointMouseUp}
              onDoubleClick={handleWaypointDoubleClick(waypoint.id)}
              className="nodrag nopan"
            >
              <div
                style={{
                  width: '14px',
                  height: '14px',
                  background: selected ? '#ec4899' : '#6366f1',
                  border: '2px solid white',
                  borderRadius: '50%',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                  transition: 'background 0.2s',
                }}
              />
            </div>
          ))}
        </EdgeLabelRenderer>
      )}
    </>
  );
};

export default memo(EditableEdge);
