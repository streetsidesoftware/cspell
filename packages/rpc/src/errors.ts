export class RPCRequestError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'RPCRequestError';
    }
}

export class AbortRPCRequestError extends RPCRequestError {
    constructor(message: string) {
        super(message);
        this.name = 'AbortRPCRequestError';
    }
}

export class TimeoutRPCRequestError extends RPCRequestError {
    constructor(message: string) {
        super(message);
        this.name = 'TimeoutRPCRequestError';
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

export class CanceledRPCRequestError extends RPCRequestError {
    constructor(message?: string) {
        super(message ?? 'The RPC request was canceled');
        this.name = 'CanceledRPCRequestError';
    }
}

export class AlreadyDisposedError extends Error {
    constructor() {
        super('NotifyEmitter has been disposed.');
        this.name = 'AlreadyDisposedError';
    }
}
