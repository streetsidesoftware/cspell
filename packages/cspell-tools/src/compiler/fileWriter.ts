import * as fs from 'fs-extra';
import { Sequence, genSequence } from 'gensequence';
import { iterableToStream } from 'hunspell-reader/dist/iterableToStream';
import { batch } from 'hunspell-reader/dist/util';

export { writeToFile, writeToFileRx, writeToFileRxP } from 'cspell-lib';

export function writeSeqToFile(seq: Sequence<string>, outFile: string | undefined): Promise<void> {
    return new Promise((resolve, reject)  => {
        let resolved = false;
        const out = outFile ? fs.createWriteStream(outFile) : process.stdout;
        const bufferedSeq = genSequence(batch(seq, 500)).map(batch => batch.join(''));
        const dataStream = iterableToStream(bufferedSeq);
        const fileStream = dataStream.pipe(out);
        const endEvents = ['finish', 'close', 'end'];

        function resolvePromise() {
            if (!resolved) {
                resolved = true;
                resolve();
            }
        }
        const endHandler = () => {
            cleanupStreams();
            setTimeout(resolvePromise, 10);
        };
        const errorHandler = (e: Error) => {
            cleanupStreams();
            reject(e);
        };

        listenToStreams();

        function listenToStreams() {
            endEvents.forEach(event => fileStream.addListener(event, endHandler));
            fileStream.addListener('error', errorHandler);
            dataStream.addListener('end', endHandler);
        }

        function cleanupStreams() {
            endEvents.forEach(event => fileStream.removeListener(event, endHandler));
            fileStream.removeListener('error', errorHandler);
            dataStream.removeListener('end', endHandler);
        }
    });
}

