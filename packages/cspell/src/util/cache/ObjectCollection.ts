/* eslint-disable @typescript-eslint/no-explicit-any */

interface Tree<V extends object> {
    v?: V;
    c?: Map<string, Map<unknown, Tree<V>>>;
}

const compare = Intl.Collator().compare;

export class ShallowObjectCollection<T extends object> {
    private tree: Tree<T> = {};

    get(v: T): T {
        if (typeof v !== 'object' || v === null) {
            return v;
        }
        const keys = Object.entries(v)
            .filter((entry) => entry[1] !== undefined)
            .sort((a, b) => compare(a[0], b[0]));
        let t = this.tree;
        for (const [key, obj] of keys) {
            if (!t.c) {
                t.c = new Map();
            }
            const c0 = t.c.get(key);
            const cc = c0 || new Map<unknown, Tree<T>>();
            if (!c0) {
                t.c.set(key, cc);
            }
            const c1 = cc.get(obj);
            const ccc = c1 || {};
            if (!c1) {
                cc.set(obj, ccc);
            }
            t = ccc;
        }

        if (t.v) return t.v;
        t.v = v;
        return v;
    }
}

interface Value {
    string?: string;
    number?: number;
    boolean?: boolean;
    object?: object;
    array?: Array<unknown>;
    bigint?: bigint;
    function?: any;
    symbol?: symbol;
    undefined?: undefined;
    null?: null;
}

type Types = keyof Value;

// type TypeMask = {
//     [K in Types]?: boolean;
// };

interface Col {
    v?: Value;
    c?: Record<string, Map<unknown, Col>>;
}

interface CollectionRoot extends Col {
    contains: WeakMap<any, any>;
}

export class Collection {
    private col: CollectionRoot = { contains: new Map() };

    /**
     * Add a plain object to the collection.
     * The actual object used is returned.
     * By adding the object to the collection, it is now owned by the collection.
     * Do not add class objects.
     * @param v any object or primitive
     * @returns v or the matching object.
     */
    add<T>(v: T): T {
        return addToCollection(this.col, v);
    }
}

// const objectLike: TypeMask = {
//     array: true,
//     object: true,
// };

function addToCollection<T>(root: CollectionRoot, v: T): T {
    const known = root.contains;

    function addValToCol(c: Col, v: T): T {
        const t = toValueType(v);
        const val = c.v || Object.create(null);
        const r = val[t] ?? v;
        val[t] = r;
        c.v = val;
        return val[t];
    }

    function walk(col: Col, path: [string, any][]): Col {
        path = path.filter((entry) => entry[1] !== undefined).sort((a, b) => compare(a[0], b[0]));

        for (const [k, v] of path) {
            const c: Record<string, Map<any, Col>> = col.c || Object.create(null);
            col.c = c;
            const m = c[k] || new Map();
            c[k] = m;
            const has = m.get(v);
            col = has || Object.create(null);
            if (!has) {
                m.set(v, col);
            }
        }
        return col;
    }

    function normalizeObjectEntries(entries: [string, any][]): [string, any][] {
        for (const entry of entries) {
            entry[1] = add(entry[1]);
        }
        return entries;
    }

    function normalizeToPath<T>(v: T): [string, any][] {
        if (typeof v !== 'object' || !v) {
            return [['', v]];
        }

        const entries = normalizeObjectEntries(Object.entries(v));
        const obj: any = v;

        if (!Object.isFrozen(v)) {
            for (const [k, v] of entries) {
                obj[k] = v;
            }
            Object.freeze(obj);
        }
        return entries;
    }

    function add(v: T): T {
        const isObjectLike = typeof v === 'object' && !!v;
        if (isObjectLike) {
            const cached = known.get(v);
            if (cached !== undefined) {
                return cached;
            }
            known.set(v, v);
        }
        const path = normalizeToPath(v);
        const c = walk(root, path);
        const r = addValToCol(c, v);
        if (isObjectLike) {
            known.set(v, r);
        }
        return r;
    }
    return add(v);
}

function toValueType(v: any): Types {
    const t = typeof v;
    if (t !== 'object') return t;
    if (v instanceof Array) return 'array';
    if (v === null) return 'null';
    return t;
}
