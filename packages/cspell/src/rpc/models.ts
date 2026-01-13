/**
 * A Unique identifier for the request/response.
 */
export type RequestID = number | string;

export type ResponseCode = 0 | 200 | 400 | 500 | 503;

/**
 * A base RPC Message.
 */
export interface RPCBaseMessage {
    sig: 'RPC0';
    /**
     * A Unique identifier for the request/response.
     */
    id: RequestID;
    /**
     * The type of message being sent.
     */
    type: 'request' | 'response' | 'error' | 'cancel' | 'ok';
}

/**
 * A message to check if the server is running.
 */
export interface RPCOkRequestMessage extends RPCBaseMessage {
    type: 'ok';
}

export interface RPCResponseBase extends RPCBaseMessage {
    code: ResponseCode;
}

/**
 * A message to check if the server is running.
 */
export interface RPCOkResponseMessage extends RPCResponseBase {
    type: 'ok';
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
 * The response message for a request from the server.
 */
export interface RPCResponseMessage<TResult = unknown> extends RPCResponseBase {
    type: 'response';
    result: TResult;
}

/**
 * The error information for a failed request.
 */
export interface RequestError {
    message: string;
    cause?: unknown;
}

export type RPCError = RequestError | Error;

export interface RPCErrorMessage extends RPCResponseBase {
    id: RequestID;
    type: 'error';
    error: RPCError;
    data?: unknown;
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

export type RPCResponseOrError<TResult = unknown> = RPCResponseMessage<TResult> | RPCErrorMessage;
