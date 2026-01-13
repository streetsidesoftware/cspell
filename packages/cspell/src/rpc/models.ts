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

export type RPCResponseOrError<TResult = unknown> = RPCResponseMessage<TResult> | RPCErrorMessage;
