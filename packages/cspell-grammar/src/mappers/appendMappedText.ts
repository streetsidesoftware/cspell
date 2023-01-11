import assert from 'assert';
import type { MappedText } from './types';

export function appendMappedText(a: MappedText, b: MappedText): MappedText {
    if (!a.map && !b.map) {
        return { text: a.text + b.text };
    }
    const aLen = a.text.length;
    const bLen = b.text.length;
    const aMap = [0, 0].concat(a.map || [0, 0, aLen, aLen]);
    const bMap = [0, 0].concat(b.map || [0, 0, bLen, bLen]);

    assert(aMap[aMap.length - 1] === aLen);
    assert(bMap[bMap.length - 1] === bLen);
    assert((aMap.length & 1) === 0);
    assert((bMap.length & 1) === 0);
    return {
        text: a.text + b.text,
        map: joinMaps(aMap, bMap),
    };
}

function joinMaps(aMap: number[], bMap: number[]): number[] {
    const n = aMap.length - 1;
    const offsets = [aMap[n - 1], aMap[n]];
    const ab = aMap.concat(bMap.map((v, i) => v + offsets[i & 1]));
    // Normalize the map by removing duplicate entries
    const r = [0, 0];
    let last0 = 0,
        last1 = 0;
    for (let i = 0; i < ab.length; i += 2) {
        const v0 = ab[i];
        const v1 = ab[i + 1];
        if (v0 === last0 && v1 === last1) {
            continue;
        }
        r.push(v0, v1);
        last0 = v0;
        last1 = v1;
    }
    return r;
}
