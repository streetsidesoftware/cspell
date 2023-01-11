import { format } from 'util';
import { cyan, green, red } from 'chalk';

export interface ExecOutput {
    code: number;
    stdout: string;
    stderr: string;
    elapsedTime?: number;
}

export function formatExecOutput(output: ExecOutput): string {
    const { code, stdout, stderr, elapsedTime } = output;

    const pfxStderr = red`stderr: `;
    const pfxStdout = cyan`stdout: `;

    const pStdout = splitAndPrefix(pfxStdout, stdout.trim());
    const pStderr = splitAndPrefix(pfxStderr, stderr.trim());
    const color = code ? red : green;
    const pCode = split(color`exit code: ${code}`);
    const pTime = elapsedTime ? [`time: ${(elapsedTime / 1000).toFixed(3)}s`] : [];

    return pStdout.concat(pStderr).concat(pCode).concat(pTime).join('\n');
}

function split(text: string | undefined): string[] {
    if (!text) {
        return [];
    }
    return text.split('\n');
}

function splitAndPrefix(prefix: string, text: string): string[] {
    return split(text).map((line) => prefix + line);
}

export function prefix(pfx: string, text: string): string {
    return text
        .split('\n')
        .map((line) => pfx + line)
        .join('\n');
}

export function logWithPrefix(pfx: string, text: string, ...params: unknown[]): void {
    const s = text ? format(text, ...params) : '';
    console.log(prefix(pfx, s));
}

export function errorWithPrefix(pfx: string, text: string, ...params: unknown[]): void {
    const s = text ? format(text, ...params) : '';
    console.error(prefix(pfx, red(s)));
}
