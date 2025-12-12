/**
 * @file waypoint.ts
 * @description Type definitions for edge waypoints/control points
 */

/**
 * Waypoint interface - represents a control point along an edge path
 */
export interface Waypoint {
  id: string;              // Unique identifier (e.g., 'wp_1234567890')
  x: number;               // Absolute X coordinate in flow space
  y: number;               // Absolute Y coordinate in flow space
  index: number;           // Position in waypoints array (for ordering)
}

/**
 * Edge data interface for waypoint-enabled edges
 */
export interface WaypointEdgeData {
  waypoints?: Waypoint[];  // Array of waypoints along the edge path
}
