import { defaultDeserializers } from '.';

describe('index', () => {
    test('defaultDeserializers', () => {
        expect(defaultDeserializers.length).toBeGreaterThan(0);
    });
});
