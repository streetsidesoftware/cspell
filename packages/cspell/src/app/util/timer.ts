import type { PerfTimer } from 'cspell-lib';
import { createPerfTimer } from 'cspell-lib';

export function getTimeMeasurer(): () => number {
    const timer = createPerfTimer('timer');
    return () => timer.elapsed;
}

export function getTimer(name: string, onEnd?: (elapsed: number, name: string) => void): PerfTimer {
    return createPerfTimer(name, onEnd);
}
