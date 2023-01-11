import { Collection, ShallowObjectCollection } from './ObjectCollection';

const objects = (function () {
    const empty = {};
    const a = { name: 'a' };
    const b = { name: 'b' };
    const bb = { name: 'b', value: 42 };
    const c = { kind: 'c', name: 'a' };
    const n = { kind: 'c', a };
    const ab = { a: a, b: b };
    const arr = ['hello', a, b, c];
    const cir = { values: [] };
    (cir.values as unknown[]).push(cir);
    return { empty, a, b, bb, c, n, ab, arr, cir };
})();

describe('ObjectCollection', () => {
    const { empty, a, b, bb, c, n, ab } = objects;
    test.each`
        objects                                                                    | expected
        ${[a, b, { ...a }, bb, c, n, empty, {}]}                                   | ${[a, b, a, bb, c, n, empty, empty]}
        ${['', 0, a, 42, empty, c, 'hello', {}, { ...c }]}                         | ${['', 0, a, 42, empty, c, 'hello', empty, c]}
        ${[a, b, n, ab, { a: { ...a }, b: { ...b } }, { kind: 'c', a: { ...a } }]} | ${[a, b, n, ab, ab, n]}
    `('ShallowObjectCollection $objects', ({ objects, expected }: { objects: object[]; expected: unknown[] }) => {
        const c = new ShallowObjectCollection();
        const r = objects.map((v) => c.get(v));
        expect(r).toEqual(expected);
    });
});

describe('Collection', () => {
    const { empty, a, b, bb, c, n, ab, arr, cir } = objects;
    const sym = Symbol('test');
    const f = Object.freeze({ ...a });
    const nestedCircular = { cir };

    test.each`
        objects                                                                    | expected                                       | comment
        ${[a, b, { ...a }, bb, c, n, empty, {}]}                                   | ${[a, b, a, bb, c, n, empty, empty]}           | ${''}
        ${['', 0, a, 42, empty, c, 'hello', {}, { ...c }]}                         | ${['', 0, a, 42, empty, c, 'hello', empty, c]} | ${''}
        ${[a, b, n, ab, { a: { ...a }, b: { ...b } }, { kind: 'c', a: { ...a } }]} | ${[a, b, n, ab, ab, n]}                        | ${'Nested objects match objects in collection'}
        ${[a, { ...a, b: undefined }]}                                             | ${[a, a]}                                      | ${'Undefined values are removed.'}
        ${[describe, undefined, null, 0, sym, sym]}                                | ${[describe, undefined, null, 0, sym, sym]}    | ${'random things'}
        ${[arr, ['hello', a, b, c]]}                                               | ${[arr, arr]}                                  | ${'arrays'}
        ${[cir, { values: [cir] }]}                                                | ${[cir, cir]}                                  | ${'circular'}
        ${[nestedCircular, { cir }]}                                               | ${[nestedCircular, nestedCircular]}            | ${'nested circular'}
        ${[a, f]}                                                                  | ${[a, a]}                                      | ${'first object wins'}
        ${[f, a]}                                                                  | ${[f, f]}                                      | ${'reverse frozen objects'}
    `('Collection $comment $objects', ({ objects, expected }: { objects: object[]; expected: unknown[] }) => {
        const c = new Collection();
        const r = objects.map((v) => c.add(v));
        expect(r).toEqual(expected);
        for (let i = 0; i < r.length; ++i) {
            expect(r[i]).toBe(expected[i]);
        }
    });
});
