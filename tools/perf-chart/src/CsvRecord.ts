export interface CsvRecord {
    timestamp: number;
    elapsedMs: number;
    repo: string;
    files: number;
    filesWithIssues: number;
    issues: number;
    errors: number;
    platform: string;
    usageUser: number;
    usageSystem: number;
    kilobytes: number | undefined | null;
    /** Missing in older rows, empty if it was not known. */
    cpuModel?: string | undefined;
    /** Missing in older rows. */
    cpuCores?: number | undefined;
    runId?: number | undefined;
}

export type CsvRecordRO = Readonly<CsvRecord>;
export type CsvRecordsRO = Readonly<CsvRecordRO[]>;
