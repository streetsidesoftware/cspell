export interface Timer {
    /**
     * Calculate the amount of time in ms since the
     * timer was created / started.
     */
    (): number;
}

export function startTimer(): Timer {
    const start = performance.now();

    return () => performance.now() - start;
}

export function measure<R>(name: string, fn: () => R, log = console.log): R {
    const calcElapsed = startTimer();
    const r = fn();
    const elapsed = (' '.repeat(16) + `${calcElapsed().toFixed(3)}ms.`).slice(-16);
    log(`${name} ${elapsed}`);
    return r;
}

export async function measureAsync<R>(name: string, fn: () => Promise<R>, log = console.log): Promise<R> {
    const calcElapsed = startTimer();
    const r = await fn();
    const elapsed = (' '.repeat(16) + `${calcElapsed().toFixed(3)}ms.`).slice(-16);
    log(`${name} ${elapsed}`);
    return r;
}

type StopTimer = Timer;

export interface PerfTimer {
    start(name?: string): StopTimer;
    stop(name?: string): number;
    mark(name: string): number;
    elapsed(): number;
    report(reporter?: (text: string) => void): void;
    formatReport(): string;
    measureFn<R>(name: string, fn: () => R): R;
    measureAsyncFn<R>(name: string, fn: () => Promise<R>): Promise<R>;
}

interface PerfTimerEvent {
    name: string | undefined;
    at: number;
    elapsed?: number | undefined;
}

export function createPerfTimer(): PerfTimer {
    const timer = startTimer();
    const active = new Map<string, PerfTimerEvent>();

    const events: PerfTimerEvent[] = [{ name: 'start', at: 0 }];

    function updateEvent(event: PerfTimerEvent, atTime = timer()) {
        const elapsed = atTime - event.at;
        event.elapsed = (event.elapsed || 0) + elapsed;
        return elapsed;
    }

    function start(name?: string): StopTimer {
        const event: PerfTimerEvent = createEvent(name || 'start');
        events.push(event);
        name && active.set(name, event);
        return () => updateEvent(event);
    }

    function stop(name?: string): number {
        const knownEvent = name && active.get(name);
        if (knownEvent) {
            return updateEvent(knownEvent);
        }
        return mark(name || 'stop');
    }

    function createEvent(name: string): PerfTimerEvent {
        return { name, at: timer() };
    }

    function mark(name: string): number {
        const event = createEvent(name);
        events.push(event);
        return event.at;
    }

    function formatReport(): string {
        const lineElements = [
            { name: 'Event Name', at: 'Time', elapsed: 'Elapsed' },
            { name: '----------', at: '----', elapsed: '-------' },
            ...events.map((e) => ({
                name: (e.name || '').replace(/\t/g, '  '),
                at: `${t(e.at)}`,
                elapsed: e.elapsed ? `${t(e.elapsed)}` : '--',
            })),
        ];
        function t(ms: number): string {
            return ms.toFixed(3) + 'ms';
        }
        function m(v: number, s: string): number {
            return Math.max(v, s.length);
        }
        const lengths = lineElements.reduce(
            (a, b) => ({ name: m(a.name, b.name), at: m(a.at, b.at), elapsed: m(a.elapsed, b.elapsed) }),
            { name: 0, at: 0, elapsed: 0 }
        );
        const lines = lineElements.map(
            (e) =>
                `${e.at.padStart(lengths.at)}  ${e.name.padEnd(lengths.name)}  ${e.elapsed.padStart(lengths.elapsed)}`
        );
        return lines.join('\n');
    }

    function measureFn<R>(name: string, fn: () => R): R {
        const s = start(name);
        const v = fn();
        s();
        return v;
    }

    async function measureAsyncFn<R>(name: string, fn: () => Promise<R>): Promise<R> {
        const s = start(name);
        const v = await fn();
        s();
        return v;
    }

    function report(reporter: (text: string) => void = console.log) {
        reporter(formatReport());
    }

    return {
        start,
        stop,
        mark,
        elapsed: timer,
        report,
        formatReport,
        measureFn,
        measureAsyncFn,
    };
}

let globalPerfTimer: PerfTimer | undefined = undefined;

export function getGlobalPerfTimer(): PerfTimer {
    const timer = globalPerfTimer || createPerfTimer();
    globalPerfTimer = timer;
    return timer;
}
