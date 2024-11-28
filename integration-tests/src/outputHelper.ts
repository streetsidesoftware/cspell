import { format } from 'node:util';

import chalk from 'chalk';

export interface ExecOutput {
    code: number;
    stdout: string;
    stderr: string;
    elapsedTime?: number;
}

const { red, green, cyan } = chalk;

export function formatExecOutput(output: ExecOutput): string {
    const { code, stdout, stderr, elapsedTime } = output;

    const pfxStderr = red(`stderr: `);
    const pfxStdout = cyan(`stdout: `);

    const pStdout = splitAndPrefix(pfxStdout, stdout.trim());
    const pStderr = splitAndPrefix(pfxStderr, stderr.trim());
    const color = code ? red : green;
    const pCode = split(color(`exit code: ${code}`));
    const pTime = elapsedTime ? [`time: ${(elapsedTime / 1000).toFixed(3)}s`] : [];

    return [...pStdout, ...pStderr, ...pCode, ...pTime].join('\n');
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
        .join('\n')
        .replaceAll('\r\n', '\n')
        .replaceAll('\r', '\r' + pfx);
}

let lastPrefix = '';
let pending = false;

function clearLastPrefix() {
    if (pending) {
        process.stdout.write('\r\n');
        pending = false;
    }
    lastPrefix = '';
}

function setLastPrefix(pfx: string) {
    if (pending && lastPrefix !== pfx) {
        process.stdout.write('\r\n');
    }
    pending = true;
    lastPrefix = pfx;
}

export function outputWithPrefix(pfx: string, text: string, ...params: unknown[]): void {
    setLastPrefix(pfx);
    const s = text ? format(text, ...params) : '';
    process.stdout.write(prefix(pfx, s).replaceAll('\n', '\r\n'));
}

export function logWithPrefix(pfx: string, text: string, ...params: unknown[]): void {
    clearLastPrefix();
    const s = text ? format(text, ...params) : '';
    console.log(prefix(pfx, s));
}

export function errorWithPrefix(pfx: string, text: string, ...params: unknown[]): void {
    clearLastPrefix();
    const s = text ? format(text, ...params) : '';
    console.error(prefix(pfx, red(s)));
}
