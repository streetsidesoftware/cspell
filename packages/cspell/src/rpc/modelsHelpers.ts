import type {
    RequestID,
    ResponseCode,
    RPCBaseMessage,
    RPCCancelRequestMessage,
    RPCError,
    RPCErrorMessage,
    RPCOkRequestMessage,
    RPCOkResponseMessage,
    RPCRequestMessage,
    RPCResponseMessage,
} from './models.js';

type RPCRequestTypeNames = {
    [K in RPCBaseMessage['type']]: K;
};

const RequestTypeNames: RPCRequestTypeNames = {
    request: 'request',
    response: 'response',
    error: 'error',
    cancel: 'cancel',
    ok: 'ok',
};

const knownRPCMessageTypes = new Set(Object.keys(RequestTypeNames));

export function isRPCBaseMessage(message: unknown): message is RPCBaseMessage {
    if (!message || typeof message !== 'object') return false;
    const m = message as RPCBaseMessage;
    return (
        m.sig === 'RPC0' && (typeof m.id === 'string' || typeof m.id === 'number') && knownRPCMessageTypes.has(m.type)
    );
}

export function isRPCErrorResponse(response: RPCBaseMessage): response is RPCErrorMessage {
    return response.type === 'error' && (response as RPCErrorMessage).error !== undefined;
}

export function isRPCCancelRequest(request: RPCBaseMessage): request is RPCCancelRequestMessage {
    return request.type === 'cancel';
}

export function isRPCOkRequest(request: RPCBaseMessage): request is RPCOkRequestMessage {
    return request.type === 'ok';
}

export function isRPCOkResponse(response: RPCBaseMessage): response is RPCOkResponseMessage {
    return response.type === 'ok' && typeof (response as RPCOkResponseMessage).code === 'number';
}

export function isRPCResponse<TResult>(response: RPCBaseMessage): response is RPCResponseMessage<TResult> {
    return response.type === 'response' && (response as RPCResponseMessage<TResult>).result !== undefined;
}

export function isRPCRequest<P>(message: RPCBaseMessage): message is RPCRequestMessage<P> {
    return message.type === 'request' && (message as RPCRequestMessage<P>).method !== undefined;
}

/**
 * Creates a RPC Request Message.
 * @param id - The unique request identifier.
 * @param method - The method name.
 * @param params - The parameters for the request.
 * @returns A RPC Request Message.
 */
export function createRPCRequest<P>(id: RequestID, method: string, params: P): RPCRequestMessage<P> {
    return { sig: 'RPC0', id, type: 'request', method, params };
}

/**
 * Creates a cancel request message.
 * @param id - The request ID to be canceled.
 * @returns A cancel request message.
 */
export function createRPCCancelRequest(id: RequestID): RPCCancelRequestMessage {
    return { sig: 'RPC0', id, type: 'cancel' };
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
    code: ResponseCode = 200,
): RPCResponseMessage<TResult> {
    return { sig: 'RPC0', id, type: 'response', code, result };
}

/**
 * Creates a RPC Error Message.
 * @param id - The matching request ID for which the error occurred.
 * @param error - The error information.
 * @returns A RPC Error Message.
 */
export function createRPCError(
    id: RequestID,
    error: RPCError,
    data?: unknown,
    code: ResponseCode = 400,
): RPCErrorMessage {
    const msg: RPCErrorMessage = { sig: 'RPC0', id, type: 'error', code, error };
    if (data !== undefined) {
        msg.data = data;
    }
    return msg;
}

export function createRPCOkRequest(id: RequestID): RPCOkRequestMessage {
    return { sig: 'RPC0', id, type: 'ok' };
}

export function createRPCOkResponse(id: RequestID, code: ResponseCode = 200): RPCOkResponseMessage {
    return { sig: 'RPC0', id, type: 'ok', code };
}
