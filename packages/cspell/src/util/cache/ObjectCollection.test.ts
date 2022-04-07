import { ShallowObjectCollection } from './ObjectCollection';

const objects = (function () {
    const empty = {};
    const a = { name: 'a' };
    const b = { name: 'b' };
    const bb = { name: 'b', value: 42 };
    const c = { kind: 'c', name: 'a' };
    const n = { kind: 'c', nested: a };
    return { empty, a, b, bb, c, n };
})();

describe('ObjectCollection', () => {
    const { empty, a, b, bb, c, n } = objects;
    test.each`
        objects                                            | expected
        ${[a, b, { ...a }, bb, c, n, empty, {}]}           | ${[a, b, a, bb, c, n, empty, empty]}
        ${['', 0, a, 42, empty, c, 'hello', {}, { ...c }]} | ${['', 0, a, 42, empty, c, 'hello', empty, c]}
    `('ShallowObjectCollection', ({ objects, expected }: { objects: object[]; expected: unknown[] }) => {
        const c = new ShallowObjectCollection();
        const r = objects.map((v) => c.get(v));
        expect(r).toEqual(expected);
    });
});
