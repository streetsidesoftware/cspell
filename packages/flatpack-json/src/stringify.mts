import type { Flatpacked } from './types.mjs';

export function stringifyFlatpacked(input: Flatpacked): string {
    let result = '[\n' + JSON.stringify(input[0]);

    for (let i = 1; i < input.length; i++) {
        result += ',\n';
        result += JSON.stringify(input[i]);
    }

    result += '\n]\n';

    return result;
}
