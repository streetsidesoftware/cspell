import { assert } from './assert';
import { createServiceBus, ServiceBus } from './bus';
import { createRequestHandler } from './createRequestHandler';
import type { Dispatcher } from './Dispatcher';
import { ErrorDuplicateSubsystem } from './errors';
import type { Handler, HandleRequest, HandleRequestFn, HandlerNext } from './handlers';
import type { RequestResponseType, ServiceRequest } from './request';
import { createResponse } from './request';
import { requestFactory } from './requestFactory';
import type { ServiceRequestFactory, ServiceRequestFactoryRequestType } from './ServiceRequestFactory';

export interface SystemServiceBus extends Dispatcher {
    registerHandler(requestPrefix: string, handler: Handler): this;
    registerRequestHandler<T extends ServiceRequest>(
        requestDef: ServiceRequestFactory<T>,
        fn: HandleRequestFn<T>,
        name?: string | undefined,
        description?: string | undefined
    ): this;
    createSubsystem(name: string, requestPattern: string | RegExp): SubsystemServiceBus;
    readonly subsystems: Map<string, SubsystemServiceBus>;
}

class SystemServiceBusImpl implements SystemServiceBus {
    private serviceBus: ServiceBus;
    private _subsystems: Map<string, SubsystemServiceBus>;
    constructor() {
        this.serviceBus = createServiceBus();
        this._subsystems = new Map();
        this.bindDefaultHandlers();
        this.createSubsystem('Default Subsystem', '' /* match everything */);
    }

    private bindDefaultHandlers() {
        this.serviceBus.addHandler(
            createRequestHandler(RequestCreateSubsystemFactory, (req) => {
                const { name, requestPattern } = req.params;
                if (this._subsystems.has(name)) {
                    throw new ErrorDuplicateSubsystem(name);
                }
                const sub = createSubsystemServiceBus(name, requestPattern);
                this._subsystems.set(name, sub);
                this.serviceBus.addHandler(sub.handler);
                return createResponse(sub);
            })
        );
    }

    dispatch<R extends ServiceRequest<string, unknown>>(request: R): RequestResponseType<R> {
        return this.serviceBus.dispatch(request);
    }

    createSubsystem(name: string, requestPattern: string | RegExp): SubsystemServiceBus {
        const res = this.dispatch(RequestCreateSubsystemFactory.create({ name, requestPattern }));
        assert(res?.value);
        return res.value;
    }

    registerHandler(requestPrefix: string, handler: Handler): this {
        const request = RequestRegisterHandlerFactory.create({ requestPrefix, handler });
        this.serviceBus.dispatch(request);
        return this;
    }

    registerRequestHandler<T extends ServiceRequest>(
        requestDef: ServiceRequestFactory<T>,
        fn: HandleRequestFn<T>,
        name?: string | undefined,
        description?: string | undefined
    ): this {
        this.registerHandler(requestDef.type, createRequestHandler(requestDef, fn, name, description));
        return this;
    }

    get subsystems() {
        return new Map(this._subsystems);
    }
}

export function createSystemServiceBus(): SystemServiceBus {
    return new SystemServiceBusImpl();
}

const TypeRequestRegisterHandler = 'System:RegisterHandler' as const;
export const RequestRegisterHandlerFactory = requestFactory<
    typeof TypeRequestRegisterHandler,
    { readonly requestPrefix: string; readonly handler: Handler },
    SubsystemServiceBus
>(TypeRequestRegisterHandler);

const TypeRequestCreateSubsystem = 'System:CreateSubsystem' as const;
export const RequestCreateSubsystemFactory = requestFactory<
    typeof TypeRequestCreateSubsystem,
    { readonly name: string; readonly requestPattern: string | RegExp },
    SubsystemServiceBus
>(TypeRequestCreateSubsystem);

interface SubsystemServiceBus extends Dispatcher {
    readonly name: string;
    readonly requestPattern: string | RegExp;
    readonly handler: Handler;
}

class SubsystemServiceBusImpl extends ServiceBus implements SubsystemServiceBus {
    readonly handler: Handler;
    private canHandleType: (requestType: string) => boolean;
    constructor(readonly name: string, readonly requestPattern: string | RegExp) {
        super();

        this.canHandleType =
            typeof requestPattern === 'string'
                ? (reqType) => reqType.startsWith(requestPattern)
                : (reqType) => requestPattern.test(reqType);

        const handleRegistration = createRequestHandler(
            RequestRegisterHandlerFactory,
            (req, next) => this.handleRegistrationReq(req, next),
            'Subsystem Register Handlers for ' + name,
            `Matches against: <${requestPattern.toString()}>`
        );

        this.addHandler(handleRegistration);
        this.handler = {
            name: 'Subsystem: ' + name,
            description: `Process Requests Matching: <${requestPattern.toString()}>`,
            fn: (dispatcher) => this._handler(dispatcher),
        };
    }

    handleRegistrationReq(
        request: ServiceRequestFactoryRequestType<typeof RequestRegisterHandlerFactory>,
        next: HandleRequest
    ) {
        // console.log(`${this.name}.handleRegistrationReq %o`, request);
        if (!this.canHandleType(request.params.requestPrefix)) {
            // console.log(`${this.name}.handleRegistrationReq skip`);
            return next(request);
        }
        // console.log(`${this.name}.handleRegistrationReq add ***`);
        this.addHandler(request.params.handler);
        return createResponse(this);
    }

    _handler(dispatcher: Dispatcher): HandlerNext {
        return (next) => (req) => {
            if (!this.canHandleType(req.type) && !RequestRegisterHandlerFactory.is(req)) return next(req);
            const dispatch = this.reduceHandlers(this.handlers, req, dispatcher, next);
            return dispatch(req);
        };
    }
}

export function createSubsystemServiceBus(name: string, requestPattern: string | RegExp): SubsystemServiceBus {
    return new SubsystemServiceBusImpl(name, requestPattern);
}
