import { ansiWidth } from './ansi.js';

export function pad(s: string, w: number): string {
    const p = padWidth(s, w);
    if (!p) return s;
    return s.padEnd(p + s.length);
}

export function padWidth(s: string, target: number): number {
    const sWidth = ansiWidth(s);
    return Math.max(target - sWidth, 0);
}

export function padLeft(s: string, w: number): string {
    const p = padWidth(s, w);
    if (!p) return s;
    return s.padStart(p + s.length);
}
