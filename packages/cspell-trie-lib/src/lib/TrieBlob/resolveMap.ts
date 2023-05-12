export function resolveMap<K, V>(map: Map<K, V>, key: K, resolve: (key: K) => V): V {
    const r = map.get(key);
    if (r !== undefined) return r;
    const v = resolve(key);
    map.set(key, v);
    return v;
}
