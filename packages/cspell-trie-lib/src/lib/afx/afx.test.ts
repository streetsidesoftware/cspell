import { describe, expect, test } from 'vitest';

import { readFixtureFile } from '../../test/samples.ts';
import { assert } from '../utils/assert.ts';
import { unindent } from '../utils/unindent.ts';
import { parseAff, parseAffRule } from './affParser.ts';
import {
    Afx,
    createAfxRule,
    createExtractRulesFromWordFn,
    isPfxRule,
    isSfxRule,
    makeMatchFunction,
    PfxMutationImpl,
    SfxMutationImpl,
} from './afx.js';

describe('afx', async () => {
    const affDanish = await readFixtureFile('hunspell/da_DK/index.aff');
    const affDefDA = parseAff(affDanish);

    const affFR = await readFixtureFile('hunspell/fr/fr-reforme1990.aff'); // cspell:ignore reforme
    const affDefFR = parseAff(affFR);

    test('Afx Danish', () => {
        const afx = new Afx(affDefDA);
        // cspell:disable

        expect([...afx.words('adfærdsmønster')]).toEqual(['adfærdsmønster']);

        const words = [...afx.words('adfærdsmønster/10,15,13,39,31')].sort();
        expect(words).toEqual([
            'adfærdsmønster',
            'adfærdsmønsteret',
            'adfærdsmønsterets',
            'adfærdsmønsters',
            'adfærdsmønstre',
            'adfærdsmønstrene',
            'adfærdsmønstrenes',
            'adfærdsmønstres',
            'adfærdsmønstret',
            'adfærdsmønstrets',
        ]);
        // cspell:enable
    });

    test('Afx French Reforme', () => {
        const afx = new Afx(affDefFR);
        // cspell:disable

        const words = [...afx.words('redire/yC() po:v3__tn___a')].sort();
        expect(words).toEqual(
            expect.arrayContaining([
                "Qu'redits",
                "d'redire",
                "d'redisant",
                "d'redit",
                "d'redite",
                "d'redites",
                "d'redits",
                "j'redirai",
                "j'redirais",
                "j'redis",
            ]),
        );
        // cspell:enable
    });
});

describe('makeMatchFunction', () => {
    test('match string suffix', () => {
        const matchFn = makeMatchFunction('ing', 'test', 'S');
        expect(matchFn('testing')).toBe(true);
        expect(matchFn('test')).toBe(false);
        expect(matchFn('ingTest')).toBe(false);
        expect(matchFn('booking')).toBe(true);
        expect(matchFn('bookings')).toBe(false);
    });

    test.each`
        match           | T              | F
        ${'ing'}        | ${'testing'}   | ${'testings'}
        ${'[kn]ing'}    | ${'booking'}   | ${'testing'}
        ${'[kn]ing'}    | ${'remaining'} | ${'testing'}
        ${'[.]ing'}     | ${'x.ing'}     | ${'testing'}
        ${'.ing'}       | ${'bing'}      | ${'ing'}
        ${'[oa][k]ing'} | ${'making'}    | ${'basking'}
    `('match string suffix $match, true: $T, false: $F', ({ match, T, F }) => {
        const matchFn = makeMatchFunction(match, 'test', 'S');
        expect(matchFn(T)).toBe(true);
        expect(matchFn(F)).toBe(false);
    });

    test('match string prefix', () => {
        const matchFn = makeMatchFunction('pre', 'test', 'P');
        expect(matchFn('prefix')).toBe(true);
        expect(matchFn('test')).toBe(false);
    });
});

describe('createExtractRulesFromWordFn', () => {
    test('comma separator', () => {
        const extractFn = createExtractRulesFromWordFn(',');
        const result1 = extractFn('running/ing,ed');
        expect(result1).toEqual({ word: 'running', apply: ['ing', 'ed'] });
        const result2 = extractFn('test');
        expect(result2).toEqual({ word: 'test' });
    });

    test('char separator', () => {
        const extractFn = createExtractRulesFromWordFn('');
        const result1 = extractFn('running/ied');
        expect(result1).toEqual({ word: 'running', apply: ['i', 'e', 'd'] });
        const result2 = extractFn('test');
        expect(result2).toEqual({ word: 'test' });
    });
});

describe('PfxMutationImpl', () => {
    test('when method', () => {
        const mutation = new PfxMutationImpl('re to un', { remove: 'un', attach: 're', when: 'un', apply: ['S'] });
        expect(mutation.when('unhappy')).toBe(true);
        expect(mutation.when('happy')).toBe(false);
        expect(mutation.when('running')).toBe(false);
        expect(mutation.apply).toEqual(['S']);
    });
});

describe('SfxMutationImpl', () => {
    test('when method', () => {
        const mutation = new SfxMutationImpl('ing to ed', { remove: 'ing', attach: 'ed', when: 'ing', apply: ['S'] });
        expect(mutation.when('running')).toBe(true);
        expect(mutation.when('run')).toBe(false);
        expect(mutation.when('hiking')).toBe(true);
        expect(mutation.apply).toEqual(['S']);
    });
});

describe('createAfxRule', () => {
    test('create suffix rule', () => {
        const rule = parseAffRule(unindent`
            SFX S Y 4
            SFX S   y     ies        [^aeiou]y
            SFX S   0     s          [aeiou]y
            SFX S   0     es         [sxzh]
            SFX S   0     s          [^sxzhy]
        `);
        expect(isSfxRule(rule)).toBe(true);
        assert(isSfxRule(rule));
        const afxRule = createAfxRule(rule.id || 's', rule);
        expect(afxRule.type).toBe('S');
        expect(afxRule.id).toBe('S');
        expect(afxRule.canCombineWith).toBe('P');
        const result = afxRule.applyTo({ word: 'play' });
        expect(result).toEqual([{ word: 'plays' }]);
    });

    test('create prefix rule', () => {
        const rule = parseAffRule(unindent`
            PFX A Y 1
            PFX A   0     re         .
        `);
        expect(isPfxRule(rule)).toBe(true);
        assert(isPfxRule(rule));
        const afxRule = createAfxRule(rule.id || 're to un', rule);
        expect(afxRule.type).toBe('P');
        expect(afxRule.id).toBe('A');
        expect(afxRule.canCombineWith).toBe('S');
        const result = afxRule.applyTo({ word: 'moving' });
        expect(result).toEqual([{ word: 'removing' }]);
    });
});

// cspell:ignore aeiou sxzh sxzhy
