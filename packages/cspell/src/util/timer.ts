export interface MeasurePromiseResult {
    elapsedTimeMs: number;
    success: boolean;
}

export async function measurePromise<T>(p: Promise<T>): Promise<MeasurePromiseResult> {
    const start = process.hrtime();
    let success = true;
    try {
        await p;
    } catch (e) {
        success = false;
    }
    const elapsedTimeMs = hrTimeToMs(process.hrtime(start));
    return {
        elapsedTimeMs,
        success,
    };
}

export function elapsedTimeMsFrom(relativeTo: [number, number]): number {
    return hrTimeToMs(process.hrtime(relativeTo));
}

export function hrTimeToMs(hrTime: [number, number]): number {
    return hrTime[0] * 1.0e3 + hrTime[1] * 1.0e-6;
}
