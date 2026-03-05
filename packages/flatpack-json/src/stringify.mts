import type { Flatpacked } from './types.mjs';

const maxLineLength = 120;
const maxBatchSize = 64;

export function stringifyFlatpacked(input: Flatpacked): string {
    let result = '[\n' + JSON.stringify(input[0]);

    let prev = '';

    for (let i = 1; i < input.length; i++) {
        const next = formatLine(input[i]);
        result += prev === next ? ',' : ',\n';
        result += next;
        prev = next;
    }

    result += '\n]\n';
    return result;
}

function formatLine(elem: unknown): string {
    if (!Array.isArray(elem)) {
        return JSON.stringify(elem);
    }
    const input = elem;
    const result: string[] = [];

    let line = '';
    for (let i = 0; i < input.length; i++) {
        if (line) line += ',';
        const next = JSON.stringify(input[i]);
        if (line.length + next.length > maxLineLength || (i && i % maxBatchSize === 0)) {
            result.push(line);
            line = '';
        }
        line += next;
    }

    if (line) {
        result.push(line);
    }

    return '[' + result.join('\n') + ']';
}
