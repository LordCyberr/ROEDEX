// ─── Wall Inference Engine ─────────────────────────────────────────────────────
// Detects wall collisions from player movement data.
//
// HOW IT WORKS:
//   When the player is moving in direction A but their actual position delta
//   is significantly different (perpendicular or near-zero in direction A),
//   they are being blocked by a wall in direction A.
//
//   This uses a sliding window of 3 consecutive position samples.
//   When a sudden velocity drop is detected in one axis, a wall point is
//   inferred 1.5 game units ahead in the direction of the blocked movement.
//
// USAGE (in playerSlice.ts when isRecordingBarrier is true):
//   const wallPt = inferWallFromVelocity(prevVel, currVel, currPos);
//   if (wallPt) addRoutePoint({ action: 'move', ...wallPt }, zone, 'barrier');

export interface Vector2 {
  x: number;
  y: number;
}

// How much velocity must drop in one axis to count as a wall collision
const VELOCITY_DROP_THRESHOLD = 1.8; // game-units/sec
// Minimum speed the player must be moving before wall detection is active
const MIN_SPEED_THRESHOLD = 0.5;
// How far ahead of the player to place the inferred wall point
const WALL_OFFSET_UNITS = 1.5;

/**
 * Given two consecutive velocity samples and the current player position,
 * returns the inferred wall point if a collision is detected, or null.
 *
 * Call this every time a new position packet arrives while isRecordingBarrier is true.
 */
export function inferWallFromVelocity(
  prevVelocity: Vector2,
  currVelocity: Vector2,
  currPos: Vector2
): Vector2 | null {
  const prevSpeed = Math.hypot(prevVelocity.x, prevVelocity.y);

  // Only detect walls when the player was actually moving
  if (prevSpeed < MIN_SPEED_THRESHOLD) return null;

  // Compute velocity drop in each axis
  const dropX = Math.abs(prevVelocity.x) - Math.abs(currVelocity.x);
  const dropY = Math.abs(prevVelocity.y) - Math.abs(currVelocity.y);

  // Normalize previous velocity to get the intended direction
  const nx = prevVelocity.x / prevSpeed;
  const ny = prevVelocity.y / prevSpeed;

  // If the player suddenly stopped or slowed sharply in the direction they were moving
  const primaryDrop = nx * nx * dropX + ny * ny * dropY; // dot product: drop in movement direction

  if (primaryDrop >= VELOCITY_DROP_THRESHOLD) {
    // Wall detected: place a point WALL_OFFSET_UNITS ahead in movement direction
    return {
      x: currPos.x + nx * WALL_OFFSET_UNITS,
      y: currPos.y + ny * WALL_OFFSET_UNITS,
    };
  }

  return null;
}

/**
 * Smooth velocity using an exponential low-pass filter.
 * Alpha closer to 1 = more responsive but jittery.
 * Alpha closer to 0 = smoother but more lag.
 */
export function smoothVelocity(prev: Vector2, raw: Vector2, alpha = 0.5): Vector2 {
  return {
    x: prev.x * (1 - alpha) + raw.x * alpha,
    y: prev.y * (1 - alpha) + raw.y * alpha,
  };
}
