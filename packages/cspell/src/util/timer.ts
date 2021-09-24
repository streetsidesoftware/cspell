export interface MeasurePromiseResult {
    elapsedTimeMs: number;
    success: boolean;
}

export function getTimeMeasurer(): () => number {
    const start = process.hrtime();
    return () => hrTimeToMs(process.hrtime(start));
}

export function elapsedTimeMsFrom(relativeTo: [number, number]): number {
    return hrTimeToMs(process.hrtime(relativeTo));
}

export function hrTimeToMs(hrTime: [number, number]): number {
    return hrTime[0] * 1.0e3 + hrTime[1] * 1.0e-6;
}
