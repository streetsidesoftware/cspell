export class RPCRequestError extends Error {
    data: unknown;
    constructor(message: string) {
        super(message);
        this.name = 'RPCRequestError';
    }
}
export class CanceledRPCRequestError extends RPCRequestError {
    constructor(message: string) {
        super(message);
        this.name = 'CanceledRequestError';
    }
}

export class AbortRPCRequestError extends RPCRequestError {
    constructor(message: string) {
        super(message);
        this.name = 'AbortRequestError';
    }
}

export class UnknownMethodRPCRequestError extends RPCRequestError {
    method: string;

    constructor(method: string, message?: string) {
        super(message || `Unknown method: ${method}`);
        this.name = 'UnknownMethodRPCRequestError';
        this.method = method;
    }
}

export class MalformedRPCRequestError extends RPCRequestError {
    request?: unknown;

    constructor(message: string, request?: unknown) {
        super(message);
        this.name = 'MalformedRPCRequestError';
        this.request = request;
    }
}
