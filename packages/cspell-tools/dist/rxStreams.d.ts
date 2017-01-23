/// <reference types="node" />
import * as Rx from 'rxjs/Rx';
import * as stream from 'stream';
export declare function observableToStream<T>(data: Rx.Observable<T>): stream.PassThrough;
export declare function streamToRx(stream: NodeJS.ReadableStream): Rx.Subject<Buffer>;
export declare function streamToStringRx(stream: NodeJS.ReadableStream, encoding?: string): Rx.Observable<string>;
