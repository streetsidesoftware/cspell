import type {
    RCPBaseRequest,
    RequestID,
    ResponseCode,
    RPCCanceledResponseMessage,
    RPCCancelRequestMessage,
    RPCError,
    RPCErrorResponseMessage,
    RPCMessage,
    RPCOkRequestMessage,
    RPCOkResponseMessage,
    RPCRequestMessage,
    RPCResponse,
    RPCResponseMessage,
} from './models.js';

type RPCRequestTypeNames = {
    [K in RCPBaseRequest['type']]: K;
};

const RequestTypeNames: RPCRequestTypeNames = {
    request: 'request',
    cancel: 'cancel',
    ok: 'ok',
} as const;

type RPCResponseTypeNames = {
    [K in RPCResponse['type']]: K;
};

const ResponseTypeNames: RPCResponseTypeNames = {
    response: 'response',
    canceled: 'canceled',
    ok: 'ok',
} as const;

const knownRPCMessageTypes = new Set([...Object.keys(RequestTypeNames), ...Object.keys(ResponseTypeNames)]);
const sig = 'RPC0' as const;

export function isRPCBaseMessage(message: unknown): message is RPCMessage {
    if (!message || typeof message !== 'object') return false;
    const m = message as RPCMessage;
    return m.sig === sig && (typeof m.id === 'string' || typeof m.id === 'number') && knownRPCMessageTypes.has(m.type);
}

export function isBaseRequest(message: RPCMessage): message is RCPBaseRequest {
    return message.type in RequestTypeNames;
}

export function isBaseResponse(message: unknown): message is RPCResponse {
    return isRPCBaseMessage(message) && message.type in ResponseTypeNames;
}

export function isRPCErrorResponse(response: unknown): response is RPCErrorResponseMessage {
    return (
        isBaseResponse(response) &&
        response.type === ResponseTypeNames.response &&
        (response as RPCErrorResponseMessage).error !== undefined
    );
}

export function isRPCCancelRequest(request: RPCMessage): request is RPCCancelRequestMessage {
    return request.type === RequestTypeNames.cancel;
}

export function isRPCCanceledResponse(response: RPCResponse): response is RPCCanceledResponseMessage {
    return response.type === ResponseTypeNames.canceled;
}

export function isRPCOkRequest(request: RPCMessage): request is RPCOkRequestMessage {
    return request.type === RequestTypeNames.ok;
}

export function isRPCOkResponse(response: RPCMessage): response is RPCOkResponseMessage {
    return response.type === ResponseTypeNames.ok && typeof (response as RPCOkResponseMessage).code === 'number';
}

export function isRPCResponse<TResult>(response: RPCMessage): response is RPCResponseMessage<TResult> {
    return response.type === ResponseTypeNames.response && 'result' in response;
}

export function isRPCRequest<P>(message: RPCMessage): message is RPCRequestMessage<P> {
    return message.type === RequestTypeNames.request && (message as RPCRequestMessage<P>).method !== undefined;
}

/**
 * Creates a RPC Request Message.
 * @param id - The unique request identifier.
 * @param method - The method name.
 * @param params - The parameters for the request.
 * @returns A RPC Request Message.
 */
export function createRPCRequest<P>(id: RequestID, method: string, params: P): RPCRequestMessage<P> {
    return { sig, id, type: RequestTypeNames.request, method, params };
}

/**
 * Creates a cancel request message.
 * @param id - The request ID to be canceled.
 * @returns A cancel request message.
 */
export function createRPCCancelRequest(id: RequestID): RPCCancelRequestMessage {
    return { sig, id, type: RequestTypeNames.cancel };
}

/**
 * Creates a cancel request message.
 * @param id - The request ID to be canceled.
 * @param code - The response code
 *   - 200 (ok) - if canceled successfully upon request.
 *   - 408 (timeout) - if the cancellation was initiated by the server.
 *   - 503 (unavailable) - if the server is shutting down.
 * @returns A cancel request message.
 */
export function createRPCCanceledResponse(id: RequestID, code: ResponseCode): RPCCanceledResponseMessage {
    return { sig, id, type: ResponseTypeNames.canceled, code };
}

/**
 * Creates a RPC Response Message.
 * @param id - The matching request ID.
 * @param result - the result of the request.
 * @returns A RPC Response Message.
 */
export function createRPCResponse<TResult>(
    id: RequestID,
    result: TResult,
    code: ResponseCode,
): RPCResponseMessage<TResult> {
    return { sig, id, type: ResponseTypeNames.response, code, result };
}

/**
 * Creates a RPC Error Message.
 * @param id - The matching request ID for which the error occurred.
 * @param error - The error information.
 * @returns A RPC Error Message.
 */
export function createRPCError(id: RequestID, error: RPCError, code: ResponseCode): RPCErrorResponseMessage {
    const msg: RPCErrorResponseMessage = { sig, id, type: ResponseTypeNames.response, code, error };
    return msg;
}

export function createRPCOkRequest(id: RequestID): RPCOkRequestMessage {
    return { sig, id, type: RequestTypeNames.ok };
}

export function createRPCOkResponse(id: RequestID, code: ResponseCode): RPCOkResponseMessage {
    return { sig, id, type: ResponseTypeNames.ok, code };
}
