import type { Flatpacked } from './types.mjs';

const maxLineLength = 120;
const maxBatchSize = 64;

export interface StringifyOptions {
    maxLineLength?: number;
    maxBatchSize?: number;
}

export const DEFAULT_STRINGIFY_OPTIONS: Required<StringifyOptions> = {
    maxLineLength,
    maxBatchSize,
};

export function stringifyFlatpacked(input: Flatpacked, options?: StringifyOptions): string {
    let result = '[\n' + JSON.stringify(input[0]);

    let prev = '';

    for (let i = 1; i < input.length; i++) {
        const next = formatLine(input[i], options);
        result += prev === next ? ',' : ',\n';
        result += next;
        prev = next;
    }

    result += '\n]\n';
    return result;
}

function formatLine(elem: unknown, options?: StringifyOptions): string {
    if (!options || !Array.isArray(elem)) {
        return JSON.stringify(elem);
    }
    const { maxLineLength, maxBatchSize } = { ...DEFAULT_STRINGIFY_OPTIONS, ...options };
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
