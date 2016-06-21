/**
 * Created by jasondent on 24/02/2016.
 */

declare module "rx-node" {
    import { Observable, Disposable } from 'rx';
    import { EventEmitter } from 'events';
    import { Stream } from 'stream';

    /**
     * Converts the given observable sequence to an event emitter with the given event name.
     * The errors are handled on the 'error' event and completion on the 'end' event.
     * @param {Observable} observable The observable sequence to convert to an EventEmitter.
     * @param {String} eventName The event name to emit onNext calls.
     * @returns {EventEmitter} An EventEmitter which emits the given eventName for each onNext call in addition to 'error' and 'end' events.
     *   You must call publish in order to invoke the subscription on the Observable sequuence.
     */
    export function toEventEmitter<T>(observable: Observable<T>, eventName: string, selector: (a: any)=>any): EventEmitter;

    /**
     * Converts a flowing stream to an Observable sequence.
     * @param {Stream} stream A stream to convert to a observable sequence.
     * @param {String} [finishEventName] Event that notifies about closed stream. ("end" by default)
     * @param {String} [dataEventName] Event that notifies about incoming data. ("data" by default)
     * @returns {Observable} An observable sequence which fires on each 'data' event as well as handling 'error' and finish events like `end` or `finish`.
     */
    export function fromStream<T>(stream: Stream, finishEventName?: string, dataEventName?: string): Observable<T>;

    /**
     * Converts a flowing readable stream to an Observable sequence.
     * @param {Stream} stream A stream to convert to a observable sequence.
     * @param {String} [dataEventName] Event that notifies about incoming data. ("data" by default)
     * @returns {Observable} An observable sequence which fires on each 'data' event as well as handling 'error' and 'end' events.
     */
    export function fromReadableStream<T>(stream: Stream, dataEventName?: string): Observable<T>;

    /**
     * Converts a flowing readline stream to an Observable sequence.
     * @param {Stream} stream A stream to convert to a observable sequence.
     * @returns {Observable} An observable sequence which fires on each 'data' event as well as handling 'error' and 'end' events.
     */
    export function fromReadLineStream<T>(stream: Stream): Observable<T>;

    /**
     * Converts a flowing writeable stream to an Observable sequence.
     * @param {Stream} stream A stream to convert to a observable sequence.
     * @returns {Observable} An observable sequence which fires on each 'data' event as well as handling 'error' and 'finish' events.
     */
    export function fromWritableStream<T>(stream: Stream): Observable<T>;

    /**
     * Converts a flowing transform stream to an Observable sequence.
     * @param {Stream} stream A stream to convert to a observable sequence.
     * @param {String} [dataEventName] Event that notifies about incoming data. ("data" by default)
     * @returns {Observable} An observable sequence which fires on each 'data' event as well as handling 'error' and 'finish' events.
     */
    export function fromTransformStream<T>(stream: Stream, dataEventName?: string): Observable<T>;

    /**
     * Writes an observable sequence to a stream
     * @param {Observable} observable Observable sequence to write to a stream.
     * @param {Stream} stream The stream to write to.
     * @param {String} [encoding] The encoding of the item to write.
     * @returns {Disposable} The subscription handle.
     */
    export function writeToStream<T>(observable: Observable<T>, stream: Stream, encoding: string): Disposable;
}
