import { AbortRPCRequestError, CanceledRPCRequestError, TimeoutRPCRequestError } from './errors.js';
import { Future } from './Future.js';
import type { MessagePortLike } from './messagePort.js';
import type { RCPBaseRequest, RequestID, RPCPendingClientRequest, RPCResponse } from './models.js';
import {
    createRPCCancelRequest,
    createRPCMethodRequest,
    createRPCOkRequest,
    createRPCReadyRequest,
    isBaseResponse,
    isRPCCanceledResponse,
    isRPCErrorResponse,
    isRPCReadyResponse,
    isRPCResponse,
} from './modelsHelpers.js';
import type { RPCProtocol, RPCProtocolMethodNames } from './protocol.js';

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
    cancel: () => Promise<boolean>;
}

export interface RPCClientOptions {
    /**
     * A function to generate random UUIDs.
     * @default undefined
     */
    randomUUID?: () => string;
    /**
     * If true, the client will close the port when disposed.
     * @default false
     */
    closePortOnDispose?: boolean;
    /**
     * Set the default timeout in milliseconds for requests.
     */
    timeoutMs?: number;
}

export interface RPCClientConfiguration extends RPCClientOptions {
    /**
     * The message port to use for communication.
     */
    port: MessagePortLike;
}

export interface RequestOptions {
    /**
     * An AbortSignal to abort the request.
     */
    signal?: AbortSignal | undefined;
    /**
     * Timeout in milliseconds to wait before aborting the request.
     */
    timeoutMs?: number | undefined;
}

const DefaultOkOptions: RequestOptions = {
    timeoutMs: 200,
};

/**
 * The RPC Client.
 */
class RPCClientImpl<
    T,
    P extends RPCProtocol<T> = RPCProtocol<T>,
    MethodNames extends RPCProtocolMethodNames<P> = RPCProtocolMethodNames<P>,
> {
    #port: MessagePortLike;
    #count: number = 0;
    #options: RPCClientOptions;

    #pendingRequests = new Map<RequestID, PendingRequest>();
    #pendingRequestsByPromise = new WeakMap<Promise<unknown>, RequestID>();

    #defaultTimeoutMs: number | undefined;

    #isReady: boolean;
    #ready: Future<boolean>;

    #onMessage: (msg: unknown) => void;

    /**
     * Create an RPC Client.
     * @param config - The client configuration.
     */
    constructor(config: RPCClientConfiguration) {
        const port = config.port;
        this.#port = port;
        this.#options = config;
        this.#defaultTimeoutMs = config.timeoutMs;
        this.#isReady = false;
        this.#ready = new Future<boolean>();

        this.#onMessage = (msg: unknown) => this.#processMessageFromServer(msg);

        port.addListener('message', this.#onMessage);
        port.start?.();
    }

    /**
     * Make a request to the RPC server.
     *
     * It is unlikely you need to use this method directly. Consider using `call` or `getApi` instead.
     *
     * @param method - The method name.
     * @param params - The method parameters.
     * @param options - Request options including abort signal and timeout.
     * @returns The pending client request.
     */
    request<M extends MethodNames>(
        method: M,
        params: Parameters<P[M]>,
        options?: RequestOptions,
    ): RPCPendingClientRequest<M, ReturnType<P[M]>> {
        // Register the request.

        const id = this.#calcId(method);
        const request = createRPCMethodRequest(id, method, params);

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
        const requestType = request.type;
        let isResolved: boolean = false;
        let isCanceled: boolean = false;

        const timeoutMs = options.timeoutMs ?? this.#defaultTimeoutMs;

        const timeoutSignal = timeoutMs ? AbortSignal.timeout(timeoutMs) : undefined;

        const future = new Future<RPCResponse>();

        options.signal?.addEventListener('abort', abort);
        timeoutSignal?.addEventListener('abort', timeoutHandler);

        const response = future.promise;

        const cancelRequest = () => this.#port.postMessage(createRPCCancelRequest(id));

        const cancel = async (): Promise<boolean> => {
            if (isResolved || isCanceled) return isCanceled;
            cancelRequest();
            await response.catch(() => {});
            return isCanceled;
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
            timeoutSignal?.removeEventListener('abort', timeoutHandler);
            this.#cleanupPendingRequest(pendingRequest);
        };

        this.#port.postMessage(request);

        return pendingRequest;

        function timeoutHandler(): void {
            abort(new TimeoutRPCRequestError(`Request ${requestType} ${id} timed out after ${timeoutMs} ms`));
        }

        function abort(reason?: unknown): void {
            if (isResolved || isCanceled) return;
            isCanceled = true;
            cancelRequest();
            reason = reason instanceof Event ? undefined : reason;
            reason ??= `Request ${id} aborted`;
            reason = typeof reason === 'string' ? new AbortRPCRequestError(reason) : reason;
            cleanup();
            future.reject(reason);
        }

        function handleResponse(res: RPCResponse): void {
            // Do not process anything if already resolved or canceled.
            if (isResolved || isCanceled) return;
            isResolved = true;
            if (isRPCCanceledResponse(res)) {
                isCanceled = true;
            }
            cleanup();
            future.resolve(res);
        }
    }

    /**
     * Check the health of the RPC server.
     * @param options - used to set timeout and abort signal.
     * @returns resolves to true if the server is OK, false on timeout.
     */
    async isOK(options: RequestOptions = DefaultOkOptions): Promise<boolean> {
        try {
            const req = this.#sendRequest(createRPCOkRequest(this.#calcId('isOK')), options);
            const res = await req.response;
            return isBaseResponse(res) && res.type === 'ok' && res.code === 200;
        } catch {
            return false;
        }
    }

    /**
     * The current known ready state of the RPC server.
     * - `true` - The server is ready.
     * - `false` - The server is not ready.
     */
    get isReady(): boolean {
        return this.#isReady;
    }

    /**
     * Check if the RPC server is ready. If already ready, returns true immediately.
     * If not ready, sends a 'ready' request to the server.
     * @param options - used to set timeout and abort signal.
     * @returns resolves to true when the server is ready, rejects if the request times out or fails.
     */
    async ready(options?: RequestOptions): Promise<boolean> {
        if (this.#isReady) return true;
        // We send the request, but we do not care about the result other than it succeeded.
        await this.#sendRequest(createRPCReadyRequest(this.#calcId('ready')), options).response;
        return this.#isReady; // We are returning the current state.
    }

    /**
     * Call a method on the RPC server.
     * @param method - The method name.
     * @param params - The method parameters.
     * @param options - Call options including abort signal.
     * @returns A Promise with the method result.
     */
    call<M extends MethodNames>(method: M, params: Parameters<P[M]>, options?: RequestOptions): ReturnType<P[M]> {
        const req = this.request(method, params, options);
        return req.response;
    }

    /**
     * Get the API for the given method names.
     *
     * This is useful passing the API to other parts of the code that do not need to know about the RPCClient.
     *
     * @param methods - The method names to include in the API.
     * @returns A partial API with the requested methods.
     */
    getApi<M extends MethodNames>(methods: M[]): Pick<P, M> {
        const apiEntries: [M, P[M]][] = methods.map(
            (method) => [method, ((...params: Parameters<P[M]>) => this.call(method, params)) as P[M]] as const,
        );
        return Object.fromEntries(apiEntries) as Pick<P, M>;
    }

    /**
     * Get info about a pending request by its RequestID.
     * @param id - The RequestID of the pending request.
     * @returns The found pending request or undefined if not found.
     */
    getPendingRequestById(id: RequestID): PendingRequest | undefined {
        return this.#pendingRequests.get(id);
    }

    /**
     * Get info about a pending request by the promise returned using `call` or an api method.
     * @param id - The RequestID of the pending request.
     * @returns The found pending request or undefined if not found.
     */
    getPendingRequestByPromise(promise: Promise<unknown>): PendingRequest | undefined {
        const requestId = this.#pendingRequestsByPromise.get(promise);
        if (!requestId) return undefined;
        return this.getPendingRequestById(requestId);
    }

    /**
     * Get the number of pending requests.
     */
    get length(): number {
        return this.#pendingRequests.size;
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
        this.#handleReadyResponse(msg);
        const pendingRequest = this.#pendingRequests.get(msg.id);
        if (!pendingRequest) return;
        pendingRequest.handleResponse(msg);
    }

    /**
     * Handle possible ready response messages.
     * @param msg - The message to handle.
     */
    #handleReadyResponse(msg: RPCResponse): void {
        if (!isRPCReadyResponse(msg)) return;
        if (this.#ready.isResolved) return;
        this.#isReady = msg.code === 200;
        this.#ready.resolve(this.#isReady);
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
        const pendingRequest = this.getPendingRequestByPromise(promise);
        if (!pendingRequest) return false;
        return this.abortRequest(pendingRequest.id, reason);
    }

    /**
     * Abort a pending request by its RequestId.
     *
     * Note: the request promise will be rejected with an AbortRequestError.
     * @param requestId - The RequestID of the request to abort.
     * @param reason - The reason for aborting the request.
     * @returns True if the request was found and aborted, false otherwise.
     */
    abortRequest(requestId: RequestID, reason?: unknown): boolean {
        const pendingRequest = this.getPendingRequestById(requestId);
        if (!pendingRequest) return false;
        pendingRequest.abort(reason);
        return true;
    }

    /**
     * Abort all pending requests.
     *
     * Note: each request promise will be rejected with an AbortRequestError.
     *
     * @param reason - The reason for aborting the request.
     */
    abortAllRequests(reason?: unknown): void {
        for (const pendingRequest of this.#pendingRequests.values()) {
            try {
                pendingRequest.abort(reason);
            } catch {
                // ignore
            }
        }
    }

    /**
     * Cancel a pending request by its RequestID.
     *
     * Tries to cancel the request by sending a cancel request to the server and waiting for the response.
     * @param id - The RequestID of the request to cancel.
     * @returns resolves to true if the request was found and canceled, false otherwise.
     */
    async cancelRequest(id: RequestID): Promise<boolean> {
        const pendingRequest = this.getPendingRequestById(id);
        if (!pendingRequest) return false;
        return await pendingRequest.cancel();
    }

    /**
     * Cancel a pending request by its Promise.
     *
     * Tries to cancel the request by sending a cancel request to the server and waiting for the response.
     * @param id - The RequestID of the request to cancel.
     * @returns resolves to true if the request was found and canceled, false otherwise.
     */
    async cancelPromise(promise: Promise<unknown>): Promise<boolean> {
        const request = this.getPendingRequestByPromise(promise);
        if (!request) return false;
        return this.cancelRequest(request.id);
    }

    /**
     * Set the default timeout for requests. Requests can override this value.
     * @param timeoutMs - the timeout in milliseconds
     */
    setTimeout(timeoutMs: number | undefined): void {
        this.#defaultTimeoutMs = timeoutMs;
    }

    /**
     * Dispose of the RPC client, aborting all pending requests and closing the port if specified in options.
     */
    [Symbol.dispose](): void {
        this.abortAllRequests(new Error('RPC Client disposed'));
        this.#pendingRequests.clear();

        this.#port.removeListener('message', this.#onMessage);

        if (this.#options.closePortOnDispose ?? true) {
            this.#port.close?.();
        }
    }
}

/**
 * The RPC Client.
 */
export class RPCClient<T> extends RPCClientImpl<T> {
    /**
     * Create an RPC Client.
     * @param config - The client configuration.
     */
    constructor(config: RPCClientConfiguration) {
        super(config);
    }
}
