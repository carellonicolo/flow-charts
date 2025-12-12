/**
 * @file index.ts
 * @description Export edge types for ReactFlow
 */

import { WaypointEdge } from './WaypointEdge';

/**
 * Custom edge types registry for ReactFlow
 */
export const edgeTypes = {
  waypoint: WaypointEdge,
};
