import { StrongWeakMap } from '@cspell/strong-weak-map';

interface Data {
    name: string;
}

const map = new StrongWeakMap<string, Data>();

export function add(name: string): Data {
    const data = { name };
    map.set(name, data);
    return data;
}

export function get(name: string): Data | undefined {
    return map.get(name);
}

export function run(mustHave?: string) {
    add('test');

    const found = get(mustHave || 'test');
    if (!found) throw new Error('No Found');
    return true;
}
