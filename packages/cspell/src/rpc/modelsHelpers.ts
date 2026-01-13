import type {
    RequestID,
    RPCBaseMessage,
    RPCCancelRequestMessage,
    RPCError,
    RPCErrorMessage,
    RPCRequestMessage,
    RPCResponseMessage,
    RPCStopRequestMessage,
} from './models.js';

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
