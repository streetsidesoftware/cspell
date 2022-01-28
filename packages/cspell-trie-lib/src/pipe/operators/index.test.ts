import * as operators from '.';

describe('Operators', () => {
    test('operators', () => {
        expect(Object.keys(operators).sort()).toMatchSnapshot();
        expect(operators.asyncAwait).toBeInstanceOf(Function);
        expect(operators.asyncFilter).toBeInstanceOf(Function);
        expect(operators.asyncFlatten).toBeInstanceOf(Function);
        expect(operators.asyncMap).toBeInstanceOf(Function);
        expect(operators.asyncUnique).toBeInstanceOf(Function);
        expect(operators.syncFilter).toBeInstanceOf(Function);
        expect(operators.syncFlatten).toBeInstanceOf(Function);
        expect(operators.syncMap).toBeInstanceOf(Function);
        expect(operators.syncUnique).toBeInstanceOf(Function);
        expect(operators.filter).toBeInstanceOf(Function);
        expect(operators.flatten).toBeInstanceOf(Function);
        expect(operators.map).toBeInstanceOf(Function);
        expect(operators.unique).toBeInstanceOf(Function);
    });
});
