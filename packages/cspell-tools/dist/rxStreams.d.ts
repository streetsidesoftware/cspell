/// <reference types="node" />
import * as Rx from 'rxjs/Rx';
import * as stream from 'stream';
/**
 * This is a simple implementation of converting an Observable into a stream.
 * It does NOT correctly handle situations where the stream buffer is full.
 */
export declare function observableToStream<T>(data: Rx.Observable<T>, options?: stream.TransformOptions): stream.PassThrough;
export declare function streamToRx(stream: NodeJS.ReadableStream): Rx.Subject<Buffer>;
export declare function streamToStringRx(stream: NodeJS.ReadableStream, encoding?: string): Rx.Observable<string>;
