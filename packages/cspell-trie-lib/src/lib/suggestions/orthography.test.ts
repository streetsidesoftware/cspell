import { visualLetterGroups, visualLetterMaskMap } from './orthography';

describe('Validate orthography', () => {
    test('visualLetterMap', () => {
        const gId = 2;
        const m = 1 << gId;
        for (const c of visualLetterGroups[gId]) {
            expect((visualLetterMaskMap[c] || 0) & m).toBe(m);
        }
    });
});
