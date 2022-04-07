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
