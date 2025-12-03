import React from 'react';
import type { Edge } from 'reactflow';
import { Route, Edit3, Trash2, RotateCcw } from 'lucide-react';

interface EdgeContextMenuProps {
  edge: Edge;
  x: number;
  y: number;
  onClose: () => void;
  onSwitchToManual: () => void;
  onSwitchToAuto: () => void;
  onResetWaypoints: () => void;
  onDelete: () => void;
}

export const EdgeContextMenu: React.FC<EdgeContextMenuProps> = ({
  edge,
  x,
  y,
  onClose,
  onSwitchToManual,
  onSwitchToAuto,
  onResetWaypoints,
  onDelete,
}) => {
  const isManual = edge.data?.routingMode === 'manual';
  const hasWaypoints = edge.data?.waypoints?.length > 0;

  return (
    <div
      className="glass-panel"
      style={{
        position: 'fixed',
        top: y,
        left: x,
        zIndex: 1000,
        padding: '8px',
        minWidth: '200px',
      }}
      onMouseLeave={onClose}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {!isManual ? (
          <button onClick={onSwitchToManual} className="context-menu-btn">
            <Edit3 size={16} />
            <span>Passa a Modalità Manuale</span>
          </button>
        ) : (
          <>
            <button onClick={onSwitchToAuto} className="context-menu-btn">
              <Route size={16} />
              <span>Torna a Routing Automatico</span>
            </button>

            {hasWaypoints && (
              <button onClick={onResetWaypoints} className="context-menu-btn">
                <RotateCcw size={16} />
                <span>Resetta Waypoints</span>
              </button>
            )}
          </>
        )}

        <div style={{ height: '1px', background: 'var(--glass-border)', margin: '4px 0' }} />

        <button onClick={onDelete} className="context-menu-btn" style={{ color: '#ef4444' }}>
          <Trash2 size={16} />
          <span>Elimina Transizione</span>
        </button>
      </div>
    </div>
  );
};
