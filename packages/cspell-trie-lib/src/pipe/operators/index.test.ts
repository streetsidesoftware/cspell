import * as operators from '.';

describe('Operators', () => {
    test('operators', () => {
        expect(Object.keys(operators).sort()).toMatchSnapshot();

        expect(operators.opAwaitAsync).toBeInstanceOf(Function);
        expect(operators.opFilter).toBeInstanceOf(Function);
        expect(operators.opFilterAsync).toBeInstanceOf(Function);
        expect(operators.opFilterSync).toBeInstanceOf(Function);
        expect(operators.opFlatten).toBeInstanceOf(Function);
        expect(operators.opFlattenAsync).toBeInstanceOf(Function);
        expect(operators.opFlattenSync).toBeInstanceOf(Function);
        expect(operators.opJoinStrings).toBeInstanceOf(Function);
        expect(operators.opJoinStringsAsync).toBeInstanceOf(Function);
        expect(operators.opJoinStringsSync).toBeInstanceOf(Function);
        expect(operators.opMap).toBeInstanceOf(Function);
        expect(operators.opMapAsync).toBeInstanceOf(Function);
        expect(operators.opMapSync).toBeInstanceOf(Function);
        expect(operators.opUnique).toBeInstanceOf(Function);
        expect(operators.opUniqueAsync).toBeInstanceOf(Function);
        expect(operators.opUniqueSync).toBeInstanceOf(Function);
    });
});
