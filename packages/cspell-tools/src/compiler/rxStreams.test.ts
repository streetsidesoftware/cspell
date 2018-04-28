import { expect } from 'chai';
import * as rxStream from './rxStreams';
import * as stream from 'stream';
import { from } from 'rxjs';
import { reduce } from 'rxjs/operators';

describe('Validate the rxStreams', () => {

    it('tests stream to Rx', () => {
        const data: string = 'This is a bit of text to have some fun with';
        const bufferStream = new stream.PassThrough();
        bufferStream.end(data);
        return rxStream.streamToStringRx(bufferStream)
            .pipe(reduce((a, b) => a + b))
            .toPromise()
            .then(result => {
                expect(result).to.equal(data);
            });
    });

    it('tests Rx to stream', () => {
        const data: string = 'This is a bit of text to have some fun with';
        const rxObs = from(data.split(' '));
        const stream = rxStream.observableToStream(rxObs);

        return rxStream.streamToStringRx(stream)
            .pipe(reduce((a, b) => a + ' ' + b))
            .toPromise()
            .then(result => {
                expect(result).to.equal(data);
            });
    });
});