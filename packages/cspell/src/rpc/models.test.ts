import { describe, expect, test } from 'vitest';

import type { Protocol, ProtocolMethods } from './models.js';
import { protocolDefinition, protocolMethods } from './models.js';

describe('Models', () => {
    test('Protocol types', () => {
        interface RPC {
            sum(a: number, b: number): number;
            concat(a: string, b: string): string;
            count: number;
        }

        type RPCProtocol = Protocol<RPC>;
        type RPCProtocolMethods = ProtocolMethods<RPC>;

        const methodsSync = {
            sum: (a: number, b: number): number => {
                return a + b;
            },
            concat: (a: string, b: string): string => {
                return a + b;
            },
            p: () => true,
            0: () => 42,
            [Symbol.dispose]: () => {},
        };

        const methodsAsync = {
            sum: async (a: number, b: number): Promise<number> => {
                return a + b;
            },
            concat: async (a: string, b: string): Promise<string> => {
                return a + b;
            },
        };

        const pAsync: RPCProtocol = protocolDefinition(methodsAsync);
        const pSync: RPCProtocolMethods = protocolMethods(methodsSync);

        expect(pAsync).toBeDefined();
        expect(pSync).toBeDefined();
        expect(pAsync).toBe(methodsAsync);
        expect(pSync).toBe(methodsSync);

        type ProtocolMethodsSync = ProtocolMethods<typeof methodsSync>;
        type ProtocolSync = Protocol<typeof methodsSync>;

        const protocolMethodsSync: ProtocolMethodsSync = protocolMethods(methodsSync);
        const protocolAsync: ProtocolSync = protocolDefinition({
            ...methodsAsync,
            p: () => Promise.resolve(true as const),
        });

        expect(protocolMethodsSync).toBeDefined();
        expect(protocolAsync).toBeDefined();
        // expect(protocolAsync[0]) // Property '0' does not exist on type 'Protocol<...>'
    });
});
