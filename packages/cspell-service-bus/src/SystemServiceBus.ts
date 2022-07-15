import { assert } from './assert';
import {
    createRequestHandler,
    createServiceBus,
    Dispatcher,
    Handler,
    HandleRequestFn,
    HandleRequestKnown,
    HandlerNext,
    ServiceBus,
} from './bus';
import { createResponse, ServiceRequest, ServiceRequestFactory } from './request';

export interface SystemServiceBus extends Dispatcher {
    registerHandler(requestPrefix: string, handler: Handler): void;
    registerRequestHandler<T extends ServiceRequest>(
        requestDef: ServiceRequestFactory<T>,
        fn: HandleRequestFn<T>
    ): void;
    createSubsystem(name: string, requestPattern: string | RegExp): SubsystemServiceBus;
    readonly subsystems: SubsystemServiceBus[];
}

class SystemServiceBusImpl implements SystemServiceBus {
    private serviceBus: ServiceBus;
    private _subsystems: SubsystemServiceBus[];
    constructor() {
        this.serviceBus = createServiceBus();
        this._subsystems = [];
        this.bindDefaultHandlers();
        this.createSubsystem('Default Subsystem', '' /* match everything */);
    }

    private bindDefaultHandlers() {
        this.serviceBus.addHandler(
            createRequestHandler(RequestCreateSubsystemFactory, (req) => {
                const { name, requestPattern } = req;
                console.log(`%o`, req);
                const sub = createSubsystemServiceBus(name, requestPattern);
                this._subsystems.push(sub);
                this.serviceBus.addHandler(sub.handler);
                return createResponse(sub);
            })
        );
    }

    dispatch<R extends ServiceRequest<string, unknown>>(request: R): R['__r'] {
        return this.serviceBus.dispatch(request);
    }

    createSubsystem(name: string, requestPattern: string | RegExp): SubsystemServiceBus {
        const res = this.dispatch(RequestCreateSubsystemFactory.create(name, requestPattern));
        assert(res?.value);
        return res.value;
    }

    registerHandler(requestPrefix: string, handler: Handler): void {
        const request = RequestRegisterHandlerFactory.create(requestPrefix, handler);
        this.serviceBus.dispatch(request);
    }

    registerRequestHandler<T extends ServiceRequest>(
        requestDef: ServiceRequestFactory<T>,
        fn: HandleRequestFn<T>
    ): void {
        this.registerHandler(requestDef.type, createRequestHandler(requestDef, fn));
    }

    get subsystems() {
        return [...this._subsystems];
    }
}

export function createSystemServiceBus(): SystemServiceBus {
    return new SystemServiceBusImpl();
}

const TypeRequestRegisterHandler = 'System:RegisterHandler' as const;
export class RequestRegisterHandlerFactory extends ServiceRequest<
    typeof TypeRequestRegisterHandler,
    SubsystemServiceBus
> {
    static type = TypeRequestRegisterHandler;
    private constructor(readonly requestPrefix: string, readonly handler: Handler) {
        super(RequestRegisterHandlerFactory.type);
    }
    static is(req: ServiceRequest): req is RequestRegisterHandlerFactory {
        return req instanceof RequestRegisterHandlerFactory;
    }
    static create(requestPrefix: string, handler: Handler) {
        return new RequestRegisterHandlerFactory(requestPrefix, handler);
    }
}

const TypeRequestCreateSubsystem = 'System:CreateSubsystem' as const;
export class RequestCreateSubsystemFactory extends ServiceRequest<
    typeof TypeRequestCreateSubsystem,
    SubsystemServiceBus
> {
    static type = TypeRequestCreateSubsystem;
    private constructor(readonly name: string, readonly requestPattern: string | RegExp) {
        super(RequestCreateSubsystemFactory.type);
    }
    static is(req: ServiceRequest): req is RequestCreateSubsystemFactory {
        return req instanceof RequestCreateSubsystemFactory;
    }
    static create(name: string, requestPattern: string | RegExp) {
        return new RequestCreateSubsystemFactory(name, requestPattern);
    }
}

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
        request: RequestRegisterHandlerFactory,
        next: HandleRequestKnown<RequestRegisterHandlerFactory>
    ) {
        console.log(`${this.name}.handleRegistrationReq %o`, request);
        if (!this.canHandleType(request.requestPrefix)) {
            console.log(`${this.name}.handleRegistrationReq skip`);
            return next(request);
        }
        console.log(`${this.name}.handleRegistrationReq add ***`);
        this.addHandler(request.handler);
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
