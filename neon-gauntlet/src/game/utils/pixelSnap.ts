export function snap(value: number) {
  return Math.round(value)
}

export function snapActor(actor: { x: number; y: number }) {
  actor.x = snap(actor.x)
  actor.y = snap(actor.y)
}
