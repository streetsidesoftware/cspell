import { defaultDeserializers } from './index';

describe('index', () => {
    test('defaultDeserializers', () => {
        expect(defaultDeserializers.length).toBeGreaterThan(0);
    });
});
