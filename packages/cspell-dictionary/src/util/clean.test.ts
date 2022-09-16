import { clean } from './clean';

describe('Validate util', () => {
    test('tests clean up obj', () => {
        const obj = {
            a: undefined,
            b: 1,
            c: true,
            d: undefined,
            e: 'str',
        };
        const cleanObj = clean(obj);
        expect([...Object.keys(cleanObj)]).toEqual(['b', 'c', 'e']);
    });
});
