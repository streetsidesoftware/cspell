import { assert } from './assert.js';
import { MalformedRPCRequestError, UnknownMethodRPCRequestError } from './errors.js';
import type { MessagePortLike } from './messagePort.js';
import type { RPCBaseMessage, RPCRequestMessage } from './models.js';
import {
    createRPCError,
    createRPCOkResponse,
    createRPCResponse,
    isRPCBaseMessage,
    isRPCCancelRequest,
    isRPCOkRequest,
    isRPCRequest,
} from './modelsHelpers.js';
import type { RPCProtocol, RPCProtocolMethodNames } from './protocol.js';

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
        port.removeListener('close', this.#onClose);
        port.addListener('message', this.#onMessage);
        port.start?.();
    }

    #sendResponse(response: RPCBaseMessage): void {
        if (this.#isClosed) return;
        this.#port.postMessage(response);
    }

    #handleMessage(msg: unknown): void {
        if (!isRPCBaseMessage(msg)) {
            if (this.#options.returnMalformedRPCRequestError) {
                this.#sendResponse(createRPCError(0, new MalformedRPCRequestError('Malformed RPC request', msg)));
            }
            // Not a valid RPC message; ignore.
            return;
        }
        if (isRPCCancelRequest(msg)) {
            // For now just remove it from pending requests.
            this.#pendingRequests.delete(msg.id);
            // later, implement aborting the request if possible.
            return;
        }
        if (isRPCOkRequest(msg)) {
            this.#sendResponse(createRPCOkResponse(msg.id));
            return;
        }

        if (!isRPCRequest(msg)) {
            if (this.#options.returnMalformedRPCRequestError) {
                this.#sendResponse(createRPCError(msg.id, new MalformedRPCRequestError('Malformed RPC request', msg)));
            }
            // Not a request; ignore.
            return;
        }
        this.#handleRequest(msg);
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
                const response = createRPCResponse(msg.id, result);
                this.#sendResponse(response);
            }
        };

        this.#pendingRequests.set(msg.id, {
            requestMessage: msg,
            promise: handleAsync().catch((err) => this.#sendErrorResponse(msg.id, err)),
        });

        return;
    }

    #sendErrorResponse(id: RPCBaseMessage['id'], error: unknown): void {
        try {
            const err = error instanceof Error ? error : new Error(String(error));
            this.#sendResponse(createRPCError(id, err));
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
