import { assert } from './assert.js';
import { MalformedRPCRequestError, UnknownMethodRPCRequestError } from './errors.js';
import type { MessagePortLike } from './messagePort.js';
import type { RequestID, ResponseCode, RPCMessage, RPCRequestMessage } from './models.js';
import {
    createRPCCanceledResponse,
    createRPCError,
    createRPCOkResponse,
    createRPCResponse,
    isRPCBaseMessage,
    isRPCCancelRequest,
    isRPCOkRequest,
    isRPCRequest,
} from './modelsHelpers.js';
import type { RPCProtocol, RPCProtocolMethodNames } from './protocol.js';

const RESPONSE_CODES = {
    OK: 200 as const,
    BadRequest: 400 as const,
    RequestTimeout: 408 as const,
    InternalServerError: 500 as const,
    ServiceUnavailable: 503 as const,
} as const;

export interface RPCServerOptions {
    closePortOnDispose?: boolean;
    /**
     * If true, the server will respond with an error message for unknown or malformed requests.
     * @default false
     */
    returnMalformedRPCRequestError?: boolean;
}

interface PendingRequest {
    requestMessage: RPCRequestMessage;
    promise: Promise<void>;
}

export class RPCServer<
    TApi,
    P extends RPCProtocol<TApi> = RPCProtocol<TApi>,
    MethodsNames extends RPCProtocolMethodNames<P> = RPCProtocolMethodNames<P>,
> {
    #port: MessagePortLike;
    #options: RPCServerOptions;
    #onMessage: (msg: unknown) => void;
    #onClose: () => void;
    #isClosed: boolean;
    #allowedMethods: Set<MethodsNames>;
    #methods: P;
    #pendingRequests: Map<number | string, PendingRequest>;

    constructor(port: MessagePortLike, methods: TApi, options: RPCServerOptions = {}) {
        this.#port = port;
        this.#isClosed = false;
        this.#options = options;
        this.#methods = methods as unknown as P;

        this.#allowedMethods = new Set(
            Object.keys(this.#methods).filter(
                (k) => typeof this.#methods[k as MethodsNames] === 'function',
            ) as MethodsNames[],
        );

        this.#pendingRequests = new Map();
        this.#onMessage = (msg: unknown) => this.#handleMessage(msg);
        this.#onClose = () => this.#cancelAllRequests(new Error('RPC Server port closed'));
        port.addListener('close', this.#onClose);
        port.addListener('message', this.#onMessage);
        port.start?.();
    }

    #sendResponse(response: RPCMessage): void {
        if (this.#isClosed) return;
        this.#port.postMessage(response);
    }

    #handleMessage(msg: unknown): void {
        let id: RequestID = 0;
        try {
            if (!isRPCBaseMessage(msg)) {
                if (this.#options.returnMalformedRPCRequestError) {
                    throw new MalformedRPCRequestError('Malformed RPC request', msg);
                }
                // Not a valid RPC message; ignore.
                return;
            }
            id = msg.id;
            if (isRPCCancelRequest(msg)) {
                // For now just remove it from pending requests.
                // later, implement aborting the request if possible.
                this.#pendingRequests.delete(msg.id);
                this.#sendCancelResponse(msg.id, RESPONSE_CODES.OK);
                return;
            }
            if (isRPCOkRequest(msg)) {
                this.#sendResponse(createRPCOkResponse(msg.id, RESPONSE_CODES.OK));
                return;
            }
            if (!isRPCRequest(msg)) {
                if (this.#options.returnMalformedRPCRequestError) {
                    throw new MalformedRPCRequestError('Malformed RPC request', msg);
                }
                // Not a request; ignore.
                return;
            }
            this.#handleRequest(msg);
        } catch (err) {
            this.#sendErrorResponse(id, err);
        }
    }

    #isMethod(method: string): method is MethodsNames {
        return this.#allowedMethods.has(method as MethodsNames);
    }

    #handleRequest(msg: RPCRequestMessage): void {
        const handleAsync = async () => {
            if (!this.#isMethod(msg.method)) {
                this.#sendErrorResponse(msg.id, new UnknownMethodRPCRequestError(msg.method));
                return;
            }
            const method = msg.method;
            const params = msg.params as Parameters<P[typeof method]>;
            assert(Array.isArray(params), 'RPC method parameters must be an array');
            assert(typeof this.#methods[method] === 'function', `RPC method ${method} is not a function`);

            const result = await this.#methods[method](...params);

            if (this.#pendingRequests.has(msg.id)) {
                const response = createRPCResponse(msg.id, result, RESPONSE_CODES.OK);
                this.#sendResponse(response);
            }
        };

        this.#pendingRequests.set(msg.id, {
            requestMessage: msg,
            promise: handleAsync().catch((err) =>
                this.#sendErrorResponse(msg.id, err, RESPONSE_CODES.InternalServerError),
            ),
        });

        return;
    }

    #sendCancelResponse(id: RequestID, code: ResponseCode = RESPONSE_CODES.ServiceUnavailable): void {
        this.#sendResponse(createRPCCanceledResponse(id, code));
    }

    #sendErrorResponse(id: RequestID, error: unknown, code: ResponseCode = RESPONSE_CODES.BadRequest): void {
        try {
            const err = error instanceof Error ? error : new Error(String(error));
            this.#sendResponse(createRPCError(id, err, code));
        } catch {
            // Nothing to do if the port is closed.
        }
    }

    #cancelAllRequests(reason?: unknown): void {
        if (!this.#pendingRequests.size) return;
        reason ??= new Error('RPC Server is shutting down');
        for (const id of this.#pendingRequests.keys()) {
            this.#sendErrorResponse(id, reason);
        }
        this.#pendingRequests.clear();
    }

    [Symbol.dispose](): void {
        this.#cancelAllRequests();
        this.#port.removeListener('message', this.#onMessage);
        this.#port.removeListener('close', this.#onClose);

        if (this.#options.closePortOnDispose ?? true) {
            this.#port.close?.();
        }
    }
}
