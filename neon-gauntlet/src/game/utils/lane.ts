import { GROUND_Y } from '../constants'

export function laneToY(lane: number, z = 0) {
  return GROUND_Y + (lane - 0.72) * 92 - z
}
