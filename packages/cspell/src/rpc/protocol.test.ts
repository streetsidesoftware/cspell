import { describe, expect, test } from 'vitest';

import type { RPCProtocol, RPCProtocolMethods } from './protocol.js';
import { protocolDefinition, protocolMethods } from './protocol.js';

describe('Models', () => {
    test('Protocol types', () => {
        interface RPC {
            sum(a: number, b: number): number;
            concat(a: string, b: string): string;
            count: number;
        }

        type RPCApiProtocol = RPCProtocol<RPC>;
        type RPCApiProtocolMethods = RPCProtocolMethods<RPC>;

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

        const pAsync: RPCApiProtocol = protocolDefinition(methodsAsync);
        const pSync: RPCApiProtocolMethods = protocolMethods(methodsSync);

        expect(pAsync).toBeDefined();
        expect(pSync).toBeDefined();
        expect(pAsync).toBe(methodsAsync);
        expect(pSync).toBe(methodsSync);

        type ProtocolMethodsSync = RPCProtocolMethods<typeof methodsSync>;
        type ProtocolSync = RPCProtocol<typeof methodsSync>;

        const protocolMethodsSync: ProtocolMethodsSync = protocolMethods(methodsSync);
        const protocolAsync: ProtocolSync = protocolDefinition({
            ...methodsAsync,
            p: () => Promise.resolve(true as const),
        });

        expect(protocolMethodsSync).toBeDefined();
        expect(protocolAsync).toBeDefined();
    });
});
