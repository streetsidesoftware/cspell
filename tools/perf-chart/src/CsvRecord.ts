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
}

export type CsvRecordRO = Readonly<CsvRecord>;
export type CsvRecordsRO = Readonly<CsvRecordRO[]>;
