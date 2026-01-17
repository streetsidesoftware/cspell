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
    type: 'request' | 'response' | 'cancel' | 'canceled' | 'ok' | 'ready';
}

export interface RCPBaseRequest extends RPCMessage {
    /**
     * The type of message being sent.
     */
    type: 'request' | 'cancel' | 'ok' | 'ready';
}

export interface RPCResponse extends RPCMessage {
    /**
     * The type of message being sent.
     */
    type: 'response' | 'canceled' | 'ok' | 'ready';
    code: ResponseCode;
    error?: RPCError | undefined;
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

/**
 * A message to check if the server is running.
 */
export interface RPCOkResponseMessage extends RPCResponse {
    type: 'ok';
}

/**
 * A message send from a client to request if the server is ready.
 * This can be sent once or multiple times. It allows for multiple clients
 * to wait for the server to be ready. When the server is ready it will respond
 * with a `RPCReadyResponseMessage`.
 *
 * This is useful when the server takes some time to initialize and clients
 * need to wait for it to be ready before sending other requests.
 *
 */
export interface RPCReadyRequestMessage extends RCPBaseRequest {
    /**
     * The type of message being sent.
     */
    type: 'ready';
}

/**
 * A response message send to the client when the server is ready.
 * This is sent once when the server is initialized or upon request.
 *
 * This allows clients to know when the server is ready to accept requests.
 */
export interface RPCReadyResponseMessage extends RPCResponse {
    type: 'ready';
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
    cancel: () => Promise<boolean>;
    readonly method: Method;
}
