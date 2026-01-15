/**
 * A Unique identifier for the request/response.
 */
export type RequestID = number | string;

export type ResponseCode = 0 | 200 | 400 | 408 | 500 | 503;

/**
 * A base RPC Message.
 */
export interface RPCMessage {
    sig: 'RPC0';
    /**
     * A Unique identifier for the request/response.
     */
    id: RequestID;
    /**
     * The type of message being sent.
     */
    type: 'request' | 'response' | 'cancel' | 'canceled' | 'ok';
}

export interface RCPBaseRequest extends RPCMessage {
    /**
     * The type of message being sent.
     */
    type: 'request' | 'cancel' | 'ok';
}

/**
 * A message to check if the server is running.
 */
export interface RPCOkRequestMessage extends RCPBaseRequest {
    /**
     * The type of message being sent.
     */
    type: 'ok';
}

export interface RPCResponse extends RPCMessage {
    /**
     * The type of message being sent.
     */
    type: 'response' | 'canceled' | 'ok';
    code: ResponseCode;
    error?: RPCError | undefined;
}

/**
 * A message to check if the server is running.
 */
export interface RPCOkResponseMessage extends RPCResponse {
    type: 'ok';
}

/**
 * A message to request a method call.
 */
export interface RPCRequestMessage<TParams = unknown> extends RCPBaseRequest {
    type: 'request';
    method: string;
    params: TParams;
}

/**
 * A message to cancel a request.
 */
export interface RPCCancelRequestMessage extends RCPBaseRequest {
    type: 'cancel';
}

/**
 * The response to a cancel request.
 */
export interface RPCCanceledResponseMessage extends RPCResponse {
    type: 'canceled';
}

/**
 * The response message for a request from the server.
 */
export interface RPCResponseMessage<TResult = unknown> extends RPCResponse {
    type: 'response';
    result: TResult;
    error?: undefined;
}

/**
 * The error information for a failed request.
 */
export interface RequestError {
    message: string;
    cause?: unknown;
}

export type RPCError = RequestError | Error;

export interface RPCErrorResponseMessage extends RPCResponse {
    id: RequestID;
    type: 'response';
    error: RPCError;
}

export interface RPCPendingClientRequest<Method extends string, TResult extends Promise<unknown>> {
    readonly id: RequestID;
    readonly response: TResult;
    readonly isResolved: boolean;
    readonly isCanceled: boolean;
    /** calling abort will cancel the request if it has not already been resolved. */
    abort: AbortController['abort'];
    cancel: () => Promise<void>;
    readonly method: Method;
}
