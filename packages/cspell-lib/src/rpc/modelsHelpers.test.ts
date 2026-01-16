import { describe, expect, test } from 'vitest';

import {
    isBaseRequest,
    isBaseResponse,
    isRPCBaseMessage,
    isRPCCancelRequest,
    isRPCOkRequest,
    isRPCOkResponse,
} from './modelsHelpers.js';

describe('Models Helpers', () => {
    test.each`
        req                                          | expected
        ${{ sig: 'RPC0', id: '', type: 'request' }}  | ${true}
        ${{ sig: 'RPC0', id: '', type: 'response' }} | ${true}
        ${{ sig: 'RPC0', id: '', type: 'cancel' }}   | ${true}
        ${{ sig: 'RPC0', id: '', type: 'canceled' }} | ${true}
        ${{ sig: 'RPC0', id: '', type: 'ok' }}       | ${true}
        ${{ sig: 'RPC0', id: '', type: 'error' }}    | ${false}
        ${{ type: 'request' }}                       | ${false}
        ${{ type: 'response' }}                      | ${false}
        ${{ type: 'cancel' }}                        | ${false}
        ${{ type: 'canceled' }}                      | ${false}
        ${{ type: 'ok' }}                            | ${false}
        ${{ type: 'error' }}                         | ${false}
        ${null}                                      | ${false}
        ${undefined}                                 | ${false}
        ${[]}                                        | ${false}
        ${42}                                        | ${false}
        ${'message'}                                 | ${false}
    `('isRPCBaseMessage $req', ({ req, expected }) => {
        expect(isRPCBaseMessage(req)).toBe(expected);
    });

    test.each`
        req                     | expected
        ${{ type: 'request' }}  | ${true}
        ${{ type: 'response' }} | ${false}
        ${{ type: 'cancel' }}   | ${true}
        ${{ type: 'canceled' }} | ${false}
        ${{ type: 'ok' }}       | ${true}
        ${{ type: 'error' }}    | ${false}
    `('isBaseRequest $req', ({ req, expected }) => {
        expect(isBaseRequest(req)).toBe(expected);
    });

    test.each`
        req                                          | expected
        ${{ sig: 'RPC0', id: '', type: 'request' }}  | ${false}
        ${{ sig: 'RPC0', id: '', type: 'response' }} | ${true}
        ${{ sig: 'RPC0', id: '', type: 'cancel' }}   | ${false}
        ${{ sig: 'RPC0', id: '', type: 'canceled' }} | ${true}
        ${{ sig: 'RPC0', id: '', type: 'ok' }}       | ${true}
        ${{ sig: 'RPC0', id: '', type: 'error' }}    | ${false}
    `('isBaseResponse $req', ({ req, expected }) => {
        expect(isBaseResponse(req)).toBe(expected);
    });

    test.each`
        req                     | expected
        ${{ type: 'request' }}  | ${false}
        ${{ type: 'response' }} | ${false}
        ${{ type: 'cancel' }}   | ${true}
        ${{ type: 'canceled' }} | ${false}
        ${{ type: 'ok' }}       | ${false}
        ${{ type: 'error' }}    | ${false}
    `('isRPCCancelRequest $req', ({ req, expected }) => {
        expect(isRPCCancelRequest(req)).toBe(expected);
    });

    test.each`
        req                     | expected
        ${{ type: 'request' }}  | ${false}
        ${{ type: 'response' }} | ${false}
        ${{ type: 'cancel' }}   | ${false}
        ${{ type: 'canceled' }} | ${false}
        ${{ type: 'ok' }}       | ${true}
        ${{ type: 'error' }}    | ${false}
    `('isRPCOkRequest $req', ({ req, expected }) => {
        expect(isRPCOkRequest(req)).toBe(expected);
    });

    test.each`
        req                          | expected
        ${{ type: 'request' }}       | ${false}
        ${{ type: 'response' }}      | ${false}
        ${{ type: 'cancel' }}        | ${false}
        ${{ type: 'canceled' }}      | ${false}
        ${{ type: 'ok' }}            | ${false}
        ${{ type: 'ok', code: 200 }} | ${true}
        ${{ type: 'error' }}         | ${false}
    `('isRPCOkResponse $req', ({ req, expected }) => {
        expect(isRPCOkResponse(req)).toBe(expected);
    });
});
