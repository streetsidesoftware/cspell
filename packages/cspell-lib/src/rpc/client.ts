import { AbortRPCRequestError, CanceledRPCRequestError } from './errors.js';
import type { MessagePortLike } from './messagePort.js';
import type { RCPBaseRequest, RequestID, RPCPendingClientRequest, RPCResponse } from './models.js';
import {
    createRPCCancelRequest,
    createRPCOkRequest,
    createRPCRequest,
    isBaseResponse,
    isRPCCanceledResponse,
    isRPCErrorResponse,
    isRPCResponse,
} from './modelsHelpers.js';
import type { RPCProtocol, RPCProtocolMethodNames } from './protocol.js';
import { Resolver } from './Resolver.js';

interface PendingRequest {
    readonly id: RequestID;
    readonly request: RCPBaseRequest;
    readonly response: Promise<RPCResponse>;
    readonly isResolved: boolean;
    readonly isCanceled: boolean;
    /** calling abort will cancel the request if it has not already been resolved. */
    abort: AbortController['abort'];
    handleResponse: (res: RPCResponse) => void;
    /**
     * Cancels the request by telling the server to cancel the request and waiting on the response.
     */
    cancel: () => Promise<void>;
}

export interface RPCClientOptions {
    randomUUID?: () => string;
    closePortOnDispose?: boolean;
}

export interface RequestOptions {
    /**
     * An AbortSignal to abort the request.
     */
    signal?: AbortSignal;
    /**
     * Timeout in milliseconds to wait before aborting the request.
     */
    timeoutMs?: number;
}

const DefaultOkOptions: RequestOptions = {
    timeoutMs: 10,
};

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

    #pendingRequests = new Map<RequestID, PendingRequest>();
    #pendingRequestsByPromise = new WeakMap<Promise<unknown>, RequestID>();

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
        port.start?.();
    }

    request<M extends MethodNames>(
        method: M,
        params: Parameters<P[M]>,
        options: RequestOptions = {},
    ): RPCPendingClientRequest<M, ReturnType<P[M]>> {
        // Register the request.

        const id = this.#calcId(method);
        const request = createRPCRequest(id, method, params);

        const pendingRequest = this.#sendRequest(request, options);

        const response = pendingRequest.response.then(handleResponse) as ReturnType<P[M]>;

        // Record the promise to request ID mapping.
        this.#pendingRequestsByPromise.set(response, id);

        const clientRequest: RPCPendingClientRequest<M, ReturnType<P[M]>> = {
            id,
            method,
            response,
            abort: pendingRequest.abort,
            cancel: pendingRequest.cancel,
            get isResolved() {
                return pendingRequest.isResolved;
            },
            get isCanceled() {
                return pendingRequest.isCanceled;
            },
        };

        return clientRequest;

        function handleResponse(res: RPCResponse): ReturnType<P[M]> {
            if (isRPCErrorResponse(res)) {
                throw res.error;
            }
            if (isRPCCanceledResponse(res)) {
                throw new CanceledRPCRequestError(`Request ${id} was canceled`);
            }
            if (isRPCResponse(res)) {
                return res.result as ReturnType<P[M]>;
            }
            throw new Error(`Malformed response for request ${id}`); // Should not happen.
        }
    }

    #sendRequest(request: RCPBaseRequest, options: RequestOptions = {}): PendingRequest {
        // Register the request.

        const id = request.id;
        let isResolved: boolean = false;
        let isCanceled: boolean = false;

        const timeoutSignal = options.timeoutMs ? AbortSignal.timeout(options.timeoutMs) : undefined;

        const resolver = new Resolver<RPCResponse>();

        options.signal?.addEventListener('abort', abort);
        timeoutSignal?.addEventListener('abort', abort);

        const response = resolver.promise;

        const cancelRequest = () => this.#port.postMessage(createRPCCancelRequest(id));

        const cancel = async (): Promise<void> => {
            if (isResolved || isCanceled) return;
            cancelRequest();
            await response.catch(() => {});
        };

        const pendingRequest: PendingRequest = {
            id,
            request,
            response,
            handleResponse,
            abort,
            cancel,
            get isResolved() {
                return isResolved;
            },
            get isCanceled() {
                return isCanceled;
            },
        };

        this.#pendingRequests.set(id, pendingRequest);
        this.#pendingRequestsByPromise.set(response, id);

        const cleanup = () => {
            options.signal?.removeEventListener('abort', abort);
            timeoutSignal?.addEventListener('abort', abort);
            this.#cleanupPendingRequest(pendingRequest);
        };

        this.#port.postMessage(request);

        return pendingRequest;

        function abort(reason?: unknown): void {
            if (isResolved || isCanceled) return;
            isCanceled = true;
            cancelRequest();
            reason = typeof reason === 'string' ? new AbortRPCRequestError(reason) : reason;
            reason ??= new AbortRPCRequestError(`Request ${id} aborted`);
            cleanup();
            resolver.reject(reason);
        }

        function handleResponse(res: RPCResponse): void {
            // Do not process anything if already resolved or canceled.
            if (isResolved || isCanceled) return;

            isResolved = true;
            if (isRPCCanceledResponse(res)) {
                isCanceled = true;
            }
            cleanup();
            resolver.resolve(res);
        }
    }

    async isOK(options: RequestOptions = DefaultOkOptions): Promise<boolean> {
        const req = this.#sendRequest(createRPCOkRequest(this.#calcId('isOK')), options);
        const res = await req.response;
        return isBaseResponse(res) && res.type === 'ok' && res.code === 200;
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

    #calcId(method: string): RequestID {
        const suffix = this.#options.randomUUID ? this.#options.randomUUID() : `${performance.now()}`;

        return `${method}-${++this.#count}-${suffix}`;
    }

    #cleanupPendingRequest(request: PendingRequest): void {
        this.#pendingRequests.delete(request.id);
        this.#pendingRequestsByPromise.delete(request.response);
    }

    #processMessageFromServer(msg: unknown): void {
        // Ignore messages that are not RPC messages
        if (!isBaseResponse(msg)) return;
        const pendingRequest = this.#pendingRequests.get(msg.id);
        if (!pendingRequest) return;
        pendingRequest.handleResponse(msg);
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
        const pendingRequestId = this.#pendingRequestsByPromise.get(promise);
        if (!pendingRequestId) return false;
        return this.abortRequest(pendingRequestId, reason);
    }

    /**
     * Abort a pending request by its RequestId.
     *
     * Note: the request promise will be rejected with an AbortRequestError.
     * @param requestId - The RequestID of the request to abort.
     * @param reason - The reason for aborting the request.
     * @returns True if the request was found and aborted, false otherwise.
     */
    abortRequest(requestId: RequestID, reason: unknown): boolean {
        const pendingRequest = this.#pendingRequests.get(requestId);
        if (!pendingRequest) return false;
        pendingRequest.abort(reason);
        return true;
    }

    abortAllRequests(reason: unknown): void {
        for (const pendingRequest of this.#pendingRequests.values()) {
            try {
                pendingRequest.abort(reason);
            } catch {
                // ignore
            }
        }
    }

    async cancelRequest(id: RequestID): Promise<boolean> {
        const pendingRequest = this.#pendingRequests.get(id);
        if (!pendingRequest) return false;
        await pendingRequest.cancel();
        return true;
    }

    [Symbol.dispose](): void {
        this.abortAllRequests(new Error('RPC Client disposed'));
        this.#pendingRequests.clear();

        this.#port.removeListener('message', this.#onMessage);

        if (this.#options.closePortOnDispose ?? true) {
            this.#port.close?.();
        }
    }
}
