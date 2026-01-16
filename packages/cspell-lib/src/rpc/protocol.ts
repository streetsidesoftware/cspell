import type { OnlyFunctionsOrNever, StringKeyOf, ToReturnPromise } from './types.js';

export type RPCProtocolMethods<T> = {
    [K in StringKeyOf<T> as T[K] extends OnlyFunctionsOrNever<T[K]> ? K : never]: OnlyFunctionsOrNever<T[K]>;
};

export type RPCProtocol<T> = {
    [K in StringKeyOf<T> as T[K] extends OnlyFunctionsOrNever<T[K]> ? K : never]: ToReturnPromise<
        OnlyFunctionsOrNever<T[K]>
    >;
};

export type RPCProtocolMethodNames<P> = StringKeyOf<RPCProtocol<P>>;

/**
 * Cast the API methods to RPCProtocol.
 * @param methods - The API methods.
 * @returns the API methods as RPCProtocol.
 */
export function protocolDefinition<API extends RPCProtocol<API>>(methods: API): RPCProtocol<API> {
    return methods;
}

/**
 * Cast the API methods to RPCProtocolMethods.
 * @param apiMethods - The API methods.
 * @returns the API methods as RPCProtocolMethods.
 */
export function protocolMethods<API extends RPCProtocolMethods<API>>(apiMethods: API): RPCProtocolMethods<API> {
    return apiMethods;
}
