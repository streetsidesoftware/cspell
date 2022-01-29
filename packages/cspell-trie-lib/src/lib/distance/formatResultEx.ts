import { WeightMap } from '.';
import { distanceAStarWeightedEx, ExResult } from './distanceAStarWeighted';

function pL(s: string, w: number) {
    const strWidth = vizWidth(s);
    const w0 = Math.max(0, w - strWidth);
    return ' '.repeat(w0) + s;
}

function pR(s: string, w: number) {
    const strWidth = vizWidth(s);
    const w0 = Math.max(0, w - strWidth);
    return s + ' '.repeat(w0);
}

function vizWidth(s: string) {
    const r = s.replace(/[\u0300-\u036F\u007f-\u009f]/gu, '');
    let i = 0;
    for (const c of r) {
        i += c.length;
    }
    return i;
}

export function formatExResult(ex: ExResult | undefined): string {
    if (!ex) return '<undefined>';

    const { cost, segments } = ex;
    const asString = segments.map(({ a, b, c, p }) => ({
        a: `<${a}>`,
        b: `<${b}>`,
        c: c.toString(10),
        p: p.toString(10),
    }));
    asString.push({
        a: '',
        b: '',
        c: ' = ' + segments.reduce((sum, { c }) => sum + c, 0).toString(10),
        p: ' = ' + segments.reduce((sum, { p }) => sum + p, 0).toString(10),
    });
    const parts = asString.map(({ a, b, c, p }) => ({
        a,
        b,
        c,
        p,
        w: Math.max(vizWidth(a), vizWidth(b), vizWidth(c), vizWidth(p)),
    }));
    const a = 'a: |' + parts.map(({ a, w }) => pR(a, w)).join('|') + '|';
    const b = 'b: |' + parts.map(({ b, w }) => pR(b, w)).join('|') + '|';
    const c = 'c: |' + parts.map(({ c, w }) => pL(c, w)).join('|') + '|';
    const p = 'p: |' + parts.map(({ p, w }) => pL(p, w)).join('|') + '|';
    return `<${ex.a.slice(1, -1)}> -> <${ex.b.slice(1, -1)}> (${cost})\n${[a, b, c, p].join('\n')}\n`;
}

export function formattedDistance(wordA: string, wordB: string, weightMap: WeightMap, cost?: number) {
    const x = distanceAStarWeightedEx(wordA, wordB, weightMap, cost);
    return formatExResult(x);
}
