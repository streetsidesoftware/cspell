export interface CSpellGlobalSettings {
    enablePerformanceMeasurements?: boolean;
    counters?: Map<string, Counter>;
}

export interface Counter {
    readonly name: string;
    count: number;

    inc(): number;
    dec(): number;
}
