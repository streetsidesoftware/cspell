export type EventMethods = 'stat' | 'readFile' | 'writeFile' | 'readDir';
export type LogEvents = 'start' | 'end' | 'error' | 'other';
export interface LogEvent {
    /**
     * The request method
     */
    method: EventMethods;
    event: LogEvents;
    message?: string | undefined;
    /**
     * The trace id can be used to link request and response events.
     * The trace id is unique for a given request.
     */
    traceID: number;
    /**
     * The request url
     */
    url?: URL | undefined;
    /**
     * The time in milliseconds, see `performance.now()`
     */
    ts: number;
}
