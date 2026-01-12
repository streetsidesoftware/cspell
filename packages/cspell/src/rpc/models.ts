import type { OnlyFunctionsOrNever, StringKeyOf, ToReturnPromise } from './types.js';

/**
 * A Unique identifier for the request/response.
 */
export type RequestID = number | string;

/**
 * A base RPC Message.
 */
export interface RPCBaseMessage {
    /**
     * A Unique identifier for the request/response.
     */
    id: RequestID;
    /**
     * The type of message being sent.
     */
    type: 'request' | 'response' | 'error' | 'cancel' | 'stop';
}

/**
 * A message to request a method call.
 */
export interface RPCRequestMessage<TParams = unknown> extends RPCBaseMessage {
    type: 'request';
    method: string;
    params: TParams;
}

/**
 * A message to cancel a request.
 */
export interface RPCCancelRequestMessage extends RPCBaseMessage {
    type: 'cancel';
}

/**
 * A message to stop the server.
 */
export interface RPCStopRequestMessage extends Omit<RPCBaseMessage, 'id'> {
    id?: RequestID;
    type: 'stop';
}

export interface RPCResponseMessage<TResult = unknown> extends RPCBaseMessage {
    type: 'response';
    result: TResult;
}

export interface RequestError {
    message: string;
    data?: unknown;
    cause?: unknown;
}

export type RPCError = RequestError | Error;

export interface RPCErrorMessage extends RPCBaseMessage {
    id: RequestID;
    type: 'error';
    error: RPCError;
}

export interface RPCClientRequest<Method extends string, TResult extends Promise<unknown>> {
    readonly id: RequestID;
    readonly method: Method;
    readonly response: TResult;
    readonly isResolved: boolean;
    readonly isCanceled: boolean;
    //** calling abort will cancel the request if it has not already been resolved. */
    abort: AbortController['abort'];
}

export interface MessagePortLike {
    /**
     * Sends a message to the port.
     * @param message - anything supported by postMessage
     */
    postMessage(message: unknown): void;

    /**
     * Sets a function to handle messages received on the port.
     * Set to undefined to remove the handler.
     */
    onmessage: ((value: unknown) => void) | undefined;

    /**
     * Sets a function to handle message errors received on the port.
     * Set to undefined to remove the handler.
     */
    onmessageerror: ((error: Error) => void) | undefined;

    /**
     * Release resources held by the port.
     */
    [Symbol.dispose]: () => void;
}

export type ProtocolMethods<T> = {
    [K in StringKeyOf<T> as T[K] extends OnlyFunctionsOrNever<T[K]> ? K : never]: OnlyFunctionsOrNever<T[K]>;
};

export type Protocol<T> = {
    [K in StringKeyOf<T> as T[K] extends OnlyFunctionsOrNever<T[K]> ? K : never]: ToReturnPromise<
        OnlyFunctionsOrNever<T[K]>
    >;
};

export type RPCResponseOrError<TResult = unknown> = RPCResponseMessage<TResult> | RPCErrorMessage;

const knownRPCMessageTypes = new Set(['request', 'response', 'error', 'cancel', 'stop']);

export function isRPCBaseMessage(message: unknown): message is RPCBaseMessage {
    if (!message || typeof message !== 'object') return false;
    const m = message as RPCBaseMessage;
    return (typeof m.id === 'string' || typeof m.id === 'number') && knownRPCMessageTypes.has(m.type);
}

export function isRPCError(response: RPCBaseMessage): response is RPCErrorMessage {
    return response.type === 'error' && (response as RPCErrorMessage).error !== undefined;
}

export function isRPCCancel(response: RPCBaseMessage): response is RPCCancelRequestMessage {
    return response.type === 'cancel';
}

export function isRPCResponse<TResult>(response: RPCBaseMessage): response is RPCResponseMessage<TResult> {
    return response.type === 'response' && (response as RPCResponseMessage<TResult>).result !== undefined;
}

export function isRPCRequest<P>(message: RPCBaseMessage): message is RPCRequestMessage<P> {
    return message.type === 'request' && (message as RPCRequestMessage<P>).method !== undefined;
}

export function isRPCStopRequest(message: unknown): message is RPCStopRequestMessage {
    if (!message || typeof message !== 'object') return false;
    const m = message as RPCBaseMessage;
    return m.type === 'stop';
}

export function protocolDefinition<T extends Protocol<T>>(methods: T): Protocol<T> {
    return methods;
}

export function protocolMethods<T extends ProtocolMethods<T>>(methods: T): ProtocolMethods<T> {
    return methods;
}

/**
 * Creates a RPC Request Message.
 * @param id - The unique request identifier.
 * @param method - The method name.
 * @param params - The parameters for the request.
 * @returns A RPC Request Message.
 */
export function createRPCRequest<P>(id: RequestID, method: string, params: P): RPCRequestMessage<P> {
    return {
        id,
        type: 'request',
        method,
        params,
    };
}

/**
 * Creates a cancel request message.
 * @param id - The request ID to be canceled.
 * @returns A cancel request message.
 */
export function createRPCCancelRequest(id: RequestID): RPCCancelRequestMessage {
    return {
        id,
        type: 'cancel',
    };
}

/**
 * Creates a RPC Response Message.
 * @param id - The matching request ID.
 * @param result - the result of the request.
 * @returns A RPC Response Message.
 */
export function createRPCResponse<TResult>(id: RequestID, result: TResult): RPCResponseMessage<TResult> {
    return {
        id,
        type: 'response',
        result,
    };
}

/**
 * Creates a RPC Error Message.
 * @param id - The matching request ID for which the error occurred.
 * @param message
 * @param data
 * @returns
 */
export function createRPCError(id: RequestID, error: RPCError): RPCErrorMessage {
    return {
        id,
        type: 'error',
        error,
    };
}
