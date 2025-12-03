import React from 'react';
import { useNodes } from 'reactflow';
import { getSmartEdge } from '@tisoap/react-flow-smart-edge';
import EditableEdge from './EditableEdge';

// Custom Smart Edge con options configurabili
export const SmartBezierEdgeWithConfig = (props: any) => {
  const nodes = useNodes();

  const smartEdgeResponse = getSmartEdge({
    sourcePosition: props.sourcePosition,
    targetPosition: props.targetPosition,
    sourceX: props.sourceX,
    sourceY: props.sourceY,
    targetX: props.targetX,
    targetY: props.targetY,
    nodes,
    options: {
      nodePadding: props.data?.nodePadding || 20,
      gridRatio: 10,
    },
  });

  // Se non riesce a calcolare un path, non renderizza nulla
  if (!smartEdgeResponse) {
    return null;
  }

  const { svgPathString } = smartEdgeResponse;

  return (
    <path
      id={props.id}
      className="react-flow__edge-path"
      d={svgPathString}
      markerEnd={props.markerEnd}
      style={props.style}
    />
  );
};

export const edgeTypes = {
  smart: SmartBezierEdgeWithConfig,
  editable: EditableEdge,
};
