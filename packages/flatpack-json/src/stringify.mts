import type { Flatpacked } from './types.mjs';

export function stringifyFlatpacked(input: Flatpacked): string {
    let result = '[\n' + JSON.stringify(input[0]);

    let prev = '';

    for (let i = 1; i < input.length; i++) {
        const next = JSON.stringify(input[i]);
        result += prev === next ? ',' : ',\n';
        result += next;
        prev = next;
    }

    result += '\n]\n';

    return result;
}
