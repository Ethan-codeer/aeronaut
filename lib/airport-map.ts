export function clusterPoints<T>(
  items: readonly T[],
  project: (item: T) => { x: number; y: number },
  cell = 70,
): T[][] {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const p = project(item),
      key = `${Math.floor(p.x / cell)}:${Math.floor(p.y / cell)}`;
    const group = groups.get(key) || [];
    group.push(item);
    groups.set(key, group);
  }
  return [...groups.values()];
}
