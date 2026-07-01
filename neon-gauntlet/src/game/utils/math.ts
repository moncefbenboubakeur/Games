export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

export function sign(value: number) {
  if (value < 0) return -1
  if (value > 0) return 1
  return 0
}

export function choose<T>(items: T[], index: number) {
  return items[Math.max(0, Math.min(items.length - 1, index))]
}
