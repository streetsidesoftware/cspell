//#region src/rpc/messagePort.d.ts
interface MessagePortLike {
  /**
  * Sends a message to the port.
  * @param message - anything supported by postMessage
  */
  postMessage(message: unknown): void;
  /**
  * Sets a function to handle the 'close' event.
  */
  addListener(event: "close", listener: (ev: Event) => void): this;
  /**
  * Sets a function to handle messages received on the port.
  * Set to undefined to remove the handler.
  */
  addListener(event: "message", listener: (value: unknown) => void): this;
  /**
  * Sets a function to handle message errors received on the port.
  * Set to undefined to remove the handler.
  */
  addListener(event: "messageerror", listener: (error: Error) => void): this;
  removeListener(event: "close", listener: (ev: Event) => void, options?: EventListenerOptions): this;
  removeListener(event: "message", listener: (value: unknown) => void, options?: EventListenerOptions): this;
  removeListener(event: "messageerror", listener: (error: Error) => void, options?: EventListenerOptions): this;
  /**
  * Closes the port and stops it from receiving messages.
  */
  close?: () => void;
  /**
  * Start receiving messages on the port.
  * Note: Some MessagePort implementations may start automatically.
  */
  start?: () => void;
}
//#endregion
//#region src/rpc/models.d.ts
/**
* A Unique identifier for the request/response.
*/
type RequestID = number | string;
type ResponseCode = 0 | 200 | 400 | 408 | 500 | 503;
/**
* A base RPC Message.
*/
interface RPCMessage {
  sig: "RPC0";
  /**
  * A Unique identifier for the request/response.
  */
  id: RequestID;
  /**
  * The type of message being sent.
  */
  type: "request" | "response" | "cancel" | "canceled" | "ok";
}
interface RCPBaseRequest extends RPCMessage {
  /**
  * The type of message being sent.
  */
  type: "request" | "cancel" | "ok";
}
interface RPCResponse extends RPCMessage {
  /**
  * The type of message being sent.
  */
  type: "response" | "canceled" | "ok";
  code: ResponseCode;
  error?: RPCError | undefined;
}
/**
* The error information for a failed request.
*/
interface RequestError {
  message: string;
  cause?: unknown;
}
type RPCError = RequestError | Error;
interface RPCPendingClientRequest<Method extends string, TResult extends Promise<unknown>> {
  readonly id: RequestID;
  readonly response: TResult;
  readonly isResolved: boolean;
  readonly isCanceled: boolean;
  /** calling abort will cancel the request if it has not already been resolved. */
  abort: AbortController["abort"];
  cancel: () => Promise<boolean>;
  readonly method: Method;
}
//#endregion
//#region src/rpc/types.d.ts
type ANY = any;
type OnlyFunctionsOrNever<T> = T extends ((...args: ANY[]) => ANY) ? T : never;
type ToReturnPromise<T extends (...args: ANY) => ANY> = T extends ((...args: infer A) => infer R) ? R extends Promise<ANY> ? (...args: A) => R : (...args: A) => Promise<R> : ANY;
type StringKeyOf<T> = Exclude<Extract<keyof T, string>, number | symbol>;
//#endregion
//#region src/rpc/protocol.d.ts
type RPCProtocolMethods<T> = { [K in StringKeyOf<T> as T[K] extends OnlyFunctionsOrNever<T[K]> ? K : never]: OnlyFunctionsOrNever<T[K]> };
type RPCProtocol<T> = { [K in StringKeyOf<T> as T[K] extends OnlyFunctionsOrNever<T[K]> ? K : never]: ToReturnPromise<OnlyFunctionsOrNever<T[K]>> };
type RPCProtocolMethodNames<P> = StringKeyOf<RPCProtocol<P>>;
/**
* Cast the API methods to RPCProtocol.
* @param methods - The API methods.
* @returns the API methods as RPCProtocol.
*/
declare function protocolDefinition<API extends RPCProtocol<API>>(methods: API): RPCProtocol<API>;
/**
* Cast the API methods to RPCProtocolMethods.
* @param apiMethods - The API methods.
* @returns the API methods as RPCProtocolMethods.
*/
declare function protocolMethods<API extends RPCProtocolMethods<API>>(apiMethods: API): RPCProtocolMethods<API>;
//#endregion
//#region src/rpc/client.d.ts
interface PendingRequest {
  readonly id: RequestID;
  readonly request: RCPBaseRequest;
  readonly response: Promise<RPCResponse>;
  readonly isResolved: boolean;
  readonly isCanceled: boolean;
  /** calling abort will cancel the request if it has not already been resolved. */
  abort: AbortController["abort"];
  handleResponse: (res: RPCResponse) => void;
  /**
  * Cancels the request by telling the server to cancel the request and waiting on the response.
  */
  cancel: () => Promise<boolean>;
}
interface RPCClientOptions {
  /**
  * A function to generate random UUIDs.
  * @default undefined
  */
  randomUUID?: () => string;
  /**
  * If true, the client will close the port when disposed.
  * @default true
  */
  closePortOnDispose?: boolean;
  /**
  * Set the default timeout in milliseconds for requests.
  */
  timeoutMs?: number;
}
interface RequestOptions {
  /**
  * An AbortSignal to abort the request.
  */
  signal?: AbortSignal;
  /**
  * Timeout in milliseconds to wait before aborting the request.
  */
  timeoutMs?: number;
}
/**
* The RPC Client.
*/
declare class RPCClient<T, P extends RPCProtocol<T> = RPCProtocol<T>, MethodNames extends RPCProtocolMethodNames<P> = RPCProtocolMethodNames<P>> {
  #private;
  /**
  * Create an RPC Client.
  * @param port - The port used to send and receive RPC messages.
  */
  constructor(port: MessagePortLike, options?: RPCClientOptions);
  request<M extends MethodNames>(method: M, params: Parameters<P[M]>, options?: RequestOptions): RPCPendingClientRequest<M, ReturnType<P[M]>>;
  isOK(options?: RequestOptions): Promise<boolean>;
  /**
  * Call a method on the RPC server.
  * @param method - The method name.
  * @param params - The method parameters.
  * @param options - Call options including abort signal.
  * @returns A Promise with the method result.
  */
  call<M extends MethodNames>(method: M, params: Parameters<P[M]>, options?: RequestOptions): ReturnType<P[M]>;
  getApi<M extends MethodNames>(methods: M[]): Pick<P, M>;
  getPendingRequestById(id: RequestID): PendingRequest | undefined;
  getPendingRequestByPromise(promise: Promise<unknown>): PendingRequest | undefined;
  /**
  * Abort a pending request by its promise.
  *
  * Note: the request promise will be rejected with an AbortRequestError.
  * @param promise - The promise returned by the request.
  * @param reason - The reason for aborting the request.
  * @returns True if the request was found and aborted, false otherwise.
  */
  abortPromise(promise: Promise<unknown>, reason: unknown): boolean;
  /**
  * Abort a pending request by its RequestId.
  *
  * Note: the request promise will be rejected with an AbortRequestError.
  * @param requestId - The RequestID of the request to abort.
  * @param reason - The reason for aborting the request.
  * @returns True if the request was found and aborted, false otherwise.
  */
  abortRequest(requestId: RequestID, reason?: unknown): boolean;
  abortAllRequests(reason?: unknown): void;
  cancelRequest(id: RequestID): Promise<boolean>;
  cancelPromise(promise: Promise<unknown>): Promise<boolean>;
  /**
  * Set the default timeout for requests. Requests can override this value.
  * @param timeoutMs - the timeout in milliseconds
  */
  setTimeout(timeoutMs: number | undefined): void;
  [Symbol.dispose](): void;
}
//#endregion
//#region src/rpc/server.d.ts
interface RPCServerOptions {
  closePortOnDispose?: boolean;
  /**
  * If true, the server will respond with an error message for unknown or malformed requests.
  * @default false
  */
  returnMalformedRPCRequestError?: boolean;
}
declare class RPCServer<TApi, P extends RPCProtocol<TApi> = RPCProtocol<TApi>, MethodsNames extends RPCProtocolMethodNames<P> = RPCProtocolMethodNames<P>> {
  #private;
  constructor(port: MessagePortLike, methods: TApi, options?: RPCServerOptions);
  [Symbol.dispose](): void;
}
//#endregion
export { MessagePortLike, RPCClient, RPCClientOptions, RPCProtocol, RPCProtocolMethods, RPCServer, RPCServerOptions, protocolDefinition, protocolMethods };