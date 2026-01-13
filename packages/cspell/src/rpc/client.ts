import { AbortRPCRequestError, CanceledRPCRequestError } from './errors.js';
import type { MessagePortLike } from './messagePort.js';
import type { RequestID, RPCClientRequest } from './models.js';
import {
    createRPCCancelRequest,
    createRPCRequest,
    isRPCBaseMessage,
    isRPCErrorResponse,
    isRPCResponse,
} from './modelsHelpers.js';
import type { RPCProtocol, RPCProtocolMethodNames } from './protocol.js';
import { Resolver } from './Resolver.js';
import type { ANY } from './types.js';

interface PendingRequest<TMethod extends string> {
    clientRequest: RPCClientRequest<TMethod, Promise<undefined>>;
    resolver: Resolver<ANY>;
}

export interface RPCClientOptions {
    randomUUID?: () => string;
    closePortOnDispose?: boolean;
}

/**
 * The RPC Client.
 */
export class RPCClient<
    T,
    P extends RPCProtocol<T> = RPCProtocol<T>,
    MethodNames extends RPCProtocolMethodNames<P> = RPCProtocolMethodNames<P>,
> {
    #port: MessagePortLike;
    #count: number = 0;
    #options: RPCClientOptions;

    #pendingRequests = new Map<RequestID, PendingRequest<MethodNames>>();
    #pendingRequestsByPromise = new WeakMap<Promise<unknown>, PendingRequest<MethodNames>>();

    #onMessage: (msg: unknown) => void;

    /**
     * Create an RPC Client.
     * @param port - The port used to send and receive RPC messages.
     */
    constructor(port: MessagePortLike, options: RPCClientOptions = {}) {
        this.#port = port;
        this.#options = options;

        this.#onMessage = (msg: unknown) => this.#processMessageFromServer(msg);

        port.addListener('message', this.#onMessage);
        port.start();
    }

    request<M extends MethodNames>(
        method: M,
        params: Parameters<P[M]>,
        options: { signal?: AbortSignal } = {},
    ): RPCClientRequest<M, ReturnType<P[M]>> {
        // Register the request.

        const id = this.#calcId(method);
        let isResolved: boolean = false;
        let isCanceled: boolean = false;

        const resolver = new Resolver<Awaited<ReturnType<P[M]>>>();

        options.signal?.addEventListener('abort', abort);

        const response = resolver.promise.then((v) => {
            isResolved = true;
            options.signal?.removeEventListener('abort', abort);
            return v;
        }) as ReturnType<P[M]>;

        const clientRequest: RPCClientRequest<M, ReturnType<P[M]>> = {
            id,
            method,
            response,
            abort,
            get isResolved() {
                return isResolved;
            },
            get isCanceled() {
                return isCanceled;
            },
        };

        const pendingRequest: PendingRequest<M> = { clientRequest, resolver };

        this.#pendingRequests.set(id, pendingRequest);
        this.#pendingRequestsByPromise.set(response, pendingRequest);

        this.#port.postMessage(createRPCRequest(id, method, params));

        const cancelRequest = () => this.#port.postMessage(createRPCCancelRequest(id));

        return clientRequest;

        function abort(reason?: unknown): void {
            if (isResolved || isCanceled) return;
            isCanceled = true;
            cancelRequest();
            reason = typeof reason === 'string' ? new AbortRPCRequestError(reason) : reason;
            reason ??= new AbortRPCRequestError(`Request ${id} aborted`);
            resolver.reject(reason);
        }
    }

    /**
     * Call a method on the RPC server.
     * @param method - The method name.
     * @param params - The method parameters.
     * @param options - Call options including abort signal.
     * @returns A Promise with the method result.
     */
    call<M extends MethodNames>(
        method: M,
        params: Parameters<P[M]>,
        options?: { signal?: AbortSignal },
    ): ReturnType<P[M]> {
        const req = this.request(method, params, options);
        return req.response;
    }

    getApi<M extends MethodNames>(methods: M[]): Pick<P, M> {
        const apiEntries: [M, P[M]][] = methods.map(
            (method) => [method, ((...params: Parameters<P[M]>) => this.call(method, params)) as P[M]] as const,
        );
        return Object.fromEntries(apiEntries) as Pick<P, M>;
    }

    /**
     * Abort a pending request by its promise.
     *
     * Note: the request promise will be rejected with an AbortRequestError.
     * @param promise - The promise returned by the request.
     * @param reason - The reason for aborting the request.
     * @returns True if the request was found and aborted, false otherwise.
     */
    abortPromise(promise: Promise<unknown>, reason: unknown): boolean {
        const pendingRequest = this.#pendingRequestsByPromise.get(promise);
        if (!pendingRequest) return false;
        pendingRequest.clientRequest.abort(reason);
        return true;
    }

    #calcId(method: string): RequestID {
        const suffix = this.#options.randomUUID ? this.#options.randomUUID() : `${performance.now()}`;

        return `${method}-${++this.#count}-${suffix}`;
    }

    #sendCancelRequest(id: RequestID): boolean {
        try {
            this.#port.postMessage(createRPCCancelRequest(id));
            return true;
        } catch {
            return false;
        }
    }

    #processMessageFromServer(msg: unknown): void {
        // Ignore messages that are not RPC messages
        if (!isRPCBaseMessage(msg)) return;
        const id = msg.id;
        const pendingRequest = this.#pendingRequests.get(msg.id);
        if (!pendingRequest) return;

        if (isRPCErrorResponse(msg)) {
            this.#pendingRequests.delete(id);
            this.#pendingRequestsByPromise.delete(pendingRequest.clientRequest.response);
            pendingRequest.resolver.reject(msg.error);
            return;
        }

        if (isRPCResponse(msg)) {
            pendingRequest.resolver.resolve(msg.result);
            this.#pendingRequests.delete(id);
            this.#pendingRequestsByPromise.delete(pendingRequest.clientRequest.response);
        }
    }

    cancelRequest(id: RequestID): boolean {
        const pendingRequest = this.#pendingRequests.get(id);
        if (!pendingRequest) return false;
        this.#sendCancelRequest(id);
        pendingRequest.clientRequest.abort(new CanceledRPCRequestError(`Request ${id} canceled`));
        return true;
    }

    cancelAllRequests(reason: unknown): void {
        for (const [id, pendingRequest] of this.#pendingRequests) {
            try {
                this.#sendCancelRequest(id);
                pendingRequest.clientRequest.abort(reason);
            } catch {
                // ignore
            }
        }
    }

    [Symbol.dispose](): void {
        this.cancelAllRequests(new Error('RPC Client disposed'));

        this.#port.removeListener('message', this.#onMessage);

        if (this.#options.closePortOnDispose ?? true) {
            this.#port.close();
        }
    }
}
