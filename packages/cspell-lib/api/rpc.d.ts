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
  /**
  * A signature to identify the message as an RPC message.
  */
  sig: "RPC0";
  /**
  * The server Identifier used to identify the server instance.
  * This allows multiple servers with different protocols to share the same communication channel.
  */
  sid?: string;
  /**
  * A Unique identifier for the request/response.
  */
  id: RequestID;
  /**
  * The type of message being sent.
  */
  type: "request" | "response" | "cancel" | "canceled" | "ok" | "ready";
}
interface RCPBaseRequest extends RPCMessage {
  /**
  * The type of message being sent.
  */
  type: "request" | "cancel" | "ok" | "ready";
}
interface RPCResponse extends RPCMessage {
  /**
  * The type of message being sent.
  */
  type: "response" | "canceled" | "ok" | "ready";
  code: ResponseCode;
  result?: unknown;
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
  * @default false
  */
  closePortOnDispose?: boolean;
  /**
  * Set the default timeout in milliseconds for requests.
  */
  timeoutMs?: number;
}
interface RPCClientConfiguration extends RPCClientOptions {
  /**
  * The message port to use for communication.
  */
  port: MessagePortLike;
}
interface RequestOptions {
  /**
  * An AbortSignal to abort the request.
  */
  signal?: AbortSignal | undefined;
  /**
  * Timeout in milliseconds to wait before aborting the request.
  */
  timeoutMs?: number | undefined;
}
/**
* The RPC Client.
*/
declare class RPCClientImpl<T, P extends RPCProtocol<T> = RPCProtocol<T>, MethodNames extends RPCProtocolMethodNames<P> = RPCProtocolMethodNames<P>> {
  #private;
  /**
  * Create an RPC Client.
  * @param config - The client configuration.
  */
  constructor(config: RPCClientConfiguration);
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
  request<M extends MethodNames>(method: M, params: Parameters<P[M]>, options?: RequestOptions): RPCPendingClientRequest<M, ReturnType<P[M]>>;
  /**
  * Check the health of the RPC server.
  * @param options - used to set timeout and abort signal.
  * @returns resolves to true if the server is OK, false on timeout.
  */
  isOK(options?: RequestOptions): Promise<boolean>;
  /**
  * The current known ready state of the RPC server.
  * - `true` - The server is ready.
  * - `false` - The server is not ready.
  */
  get isReady(): boolean;
  /**
  * Check if the RPC server is ready. If already ready, returns true immediately.
  * If not ready, sends a 'ready' request to the server.
  * @param options - used to set timeout and abort signal.
  * @returns resolves to true when the server is ready, rejects if the request times out or fails.
  */
  ready(options?: RequestOptions): Promise<boolean>;
  /**
  * Call a method on the RPC server.
  * @param method - The method name.
  * @param params - The method parameters.
  * @param options - Call options including abort signal.
  * @returns A Promise with the method result.
  */
  call<M extends MethodNames>(method: M, params: Parameters<P[M]>, options?: RequestOptions): ReturnType<P[M]>;
  /**
  * Get the API for the given method names.
  *
  * This is useful passing the API to other parts of the code that do not need to know about the RPCClient.
  *
  * @param methods - The method names to include in the API.
  * @returns A partial API with the requested methods.
  */
  getApi<M extends MethodNames>(methods: M[]): Pick<P, M>;
  /**
  * Get info about a pending request by its RequestID.
  * @param id - The RequestID of the pending request.
  * @returns The found pending request or undefined if not found.
  */
  getPendingRequestById(id: RequestID): PendingRequest | undefined;
  /**
  * Get info about a pending request by the promise returned using `call` or an api method.
  * @param id - The RequestID of the pending request.
  * @returns The found pending request or undefined if not found.
  */
  getPendingRequestByPromise(promise: Promise<unknown>): PendingRequest | undefined;
  /**
  * Get the number of pending requests.
  */
  get length(): number;
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
  /**
  * Abort all pending requests.
  *
  * Note: each request promise will be rejected with an AbortRequestError.
  *
  * @param reason - The reason for aborting the request.
  */
  abortAllRequests(reason?: unknown): void;
  /**
  * Cancel a pending request by its RequestID.
  *
  * Tries to cancel the request by sending a cancel request to the server and waiting for the response.
  * @param id - The RequestID of the request to cancel.
  * @returns resolves to true if the request was found and canceled, false otherwise.
  */
  cancelRequest(id: RequestID): Promise<boolean>;
  /**
  * Cancel a pending request by its Promise.
  *
  * Tries to cancel the request by sending a cancel request to the server and waiting for the response.
  * @param id - The RequestID of the request to cancel.
  * @returns resolves to true if the request was found and canceled, false otherwise.
  */
  cancelPromise(promise: Promise<unknown>): Promise<boolean>;
  /**
  * Set the default timeout for requests. Requests can override this value.
  * @param timeoutMs - the timeout in milliseconds
  */
  setTimeout(timeoutMs: number | undefined): void;
  /**
  * Dispose of the RPC client, aborting all pending requests and closing the port if specified in options.
  */
  [Symbol.dispose](): void;
}
/**
* The RPC Client.
*/
declare class RPCClient<T> extends RPCClientImpl<T> {
  /**
  * Create an RPC Client.
  * @param config - The client configuration.
  */
  constructor(config: RPCClientConfiguration);
}
//#endregion
//#region src/rpc/errors.d.ts
declare class RPCRequestError extends Error {
  constructor(message: string);
}
declare class AbortRPCRequestError extends RPCRequestError {
  constructor(message: string);
}
declare class TimeoutRPCRequestError extends RPCRequestError {
  constructor(message: string);
}
declare class UnknownMethodRPCRequestError extends RPCRequestError {
  method: string;
  constructor(method: string, message?: string);
}
declare class CanceledRPCRequestError extends RPCRequestError {
  constructor(message?: string);
}
//#endregion
//#region src/rpc/notify.d.ts
type NotifyHandler<T> = (event: T) => void;
type NotifyEvent<T> = (handler: NotifyHandler<T>) => Disposable;
/**
* Used to have a type distinction between NotifyOnceEvents and NotifyEvents.
* It is not used at runtime.
*/
declare const SymbolNotifyOnceEvent: symbol;
type NotifyOnceEvent<T> = NotifyEvent<T> & {
  [SymbolNotifyOnceEvent]?: true;
};
/**
* A Class used to emit notifications to registered handlers.
*/
declare class NotifyEmitter<T> {
  #private;
  /**
  * Adds a handler for the event. Multiple handlers can be added. The same handler will
  * not be added more than once. To add the same handler multiple times, use a wrapper function.
  *
  * Note: This function can be used without needing to bind 'this'.
  * @param handler - the handler to add.
  * @returns a Disposable to remove the handler.
  */
  readonly event: NotifyEvent<T>;
  /**
  * Notify all handlers of the event.
  *
  * Note: This function can be used without needing to bind 'this'.
  * @param value - The event value.
  */
  readonly notify: (value: T) => void;
  /**
  * A NotifyEvent that only fires once for each handler added.
  *
  * Multiple handlers can be added. The same handler can be added multiple times
  * and will be called once for each time it is added.
  *
  * Note: This property can be used without needing to bind 'this'.
  */
  readonly once: NotifyOnceEvent<T>;
  /**
  * The number of registered handlers.
  */
  get size(): number;
  [Symbol.dispose](): void;
}
/**
* Convert a NotifyEvent to a Promise.
* @param event - The event to convert.
* @returns A Promise that resolves with the first value emitted by the event.
*/
declare function notifyEventToPromise<T>(event: NotifyEvent<T>): Promise<T>;
/**
* Create a NotifyEvent that only fires once.
*
* The same handler can be added multiple times and will be called once for each time it is added.
* This is different from a normal NotifyEvent where the same handler is only added once.
*
* @param event - The event to wrap.
* @returns A NotifyOnceEvent that only fires once for the handlers added.
*/
declare function notifyEventOnce<T>(event: NotifyEvent<T>): NotifyOnceEvent<T>;
//#endregion
//#region src/rpc/server.d.ts
interface RPCServerOptions {
  /**
  * If true, the server will close the message port when disposed.
  * @default false
  */
  closePortOnDispose?: boolean;
  /**
  * If true, the server will respond with an error message for unknown or malformed requests.
  * @default false
  */
  returnMalformedRPCRequestError?: boolean;
}
interface RPCServerConfiguration extends RPCServerOptions {
  /**
  * The message port to use for communication.
  */
  port: MessagePortLike;
}
declare class RPCServerImpl<ServerApi, PApi extends RPCProtocol<ServerApi> = RPCProtocol<ServerApi>, MethodsNames extends RPCProtocolMethodNames<PApi> = RPCProtocolMethodNames<PApi>> {
  #private;
  constructor(config: RPCServerConfiguration, methods: ServerApi);
  [Symbol.dispose](): void;
}
/**
* RPC Server implementation.
* @param ServerApi - The API methods of the server.
*/
declare class RPCServer<ServerApi> extends RPCServerImpl<ServerApi> {
  /**
  *
  * @param config - The server configuration, including the message port and options.
  * @param methods - The methods to implement the API.
  */
  constructor(config: RPCServerConfiguration, methods: ServerApi);
}
//#endregion
export { AbortRPCRequestError, CanceledRPCRequestError, MessagePortLike, NotifyEmitter, NotifyEvent, NotifyHandler, NotifyOnceEvent, RPCClient, RPCClientConfiguration, RPCClientOptions, RPCProtocol, RPCProtocolMethods, RPCRequestError, RPCServer, RPCServerConfiguration, RPCServerOptions, TimeoutRPCRequestError, UnknownMethodRPCRequestError, notifyEventOnce, notifyEventToPromise, protocolDefinition, protocolMethods };