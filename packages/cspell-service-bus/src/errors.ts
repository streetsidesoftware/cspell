import { ServiceRequest } from './request';

export class ErrorUnhandledRequest extends Error {
    constructor(readonly request: ServiceRequest) {
        super(`Unhandled Request: ${request.type}`);
    }
}

export class ErrorServiceRequestDepthExceeded extends Error {
    constructor(readonly request: ServiceRequest, readonly depth: number) {
        super(`Service Request Depth ${depth} Exceeded: ${request.type}`);
    }
}

export class UnhandledHandlerError extends Error {
    constructor(
        readonly handlerName: string,
        readonly handlerDescription: string | undefined,
        readonly cause: unknown
    ) {
        super(`Unhandled Error in Handler: ${handlerName}`);
    }
}

export class ErrorDuplicateSubsystem extends Error {
    constructor(readonly subsystemName: string) {
        super(`Duplicate subsystem: ${subsystemName}`);
    }
}
