
declare module 'mock-stdin' {
    export interface MockSTDIN {
        /**
         * Queue up data to be read by the stream. Results in data (and possibly end) events being dispatched.
         * @param data the data to send
         * @param encoding optional encoding
         */
        send(data: string | Buffer | string[] | null, encoding?: string): MockSTDIN;

        /**
         * Alias for MockSTDIN#send(null). Results in dispatching an end event.
         */
        end(): MockSTDIN;

        /**
         * Restore the target of the mocked stream.
         * If only a single mock stream is created, will restore the original stdin TTY stream.
         * If multiple mock streams are created, it will restore the stream which was active at the time the mock was created.
         */
        restore(): MockSTDIN;

        /**
         * Ordinarily, a Readable stream will throw when attempting to push after an EOF.
         * This routine will reset the ended state of a Readable stream, preventing it from throwing post-EOF.
         * This prevents being required to re-create a mock STDIN instance during certain tests where a fresh stdin is required.
         *
         * If the removeListeners flag is set to true, all event listeners will also be reset.
         * This is useful in cases where you need to emulate restarting an entire application, without fully re-creating the mock object.
         */
        reset(): MockSTDIN;
    }

    /**
     * Mocks process.stdin to a stream
     */
    export function stdin(): MockSTDIN;
}
