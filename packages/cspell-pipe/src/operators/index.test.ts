import * as operators from '.';

describe('Operators', () => {
    test('operators', () => {
        expect(Object.keys(operators).sort()).toMatchSnapshot();

        expect(operators.opAppend).toBeInstanceOf(Function);
        expect(operators.opAppendAsync).toBeInstanceOf(Function);
        expect(operators.opAppendSync).toBeInstanceOf(Function);
        expect(operators.opAwaitAsync).toBeInstanceOf(Function);
        expect(operators.opConcatMap).toBeInstanceOf(Function);
        expect(operators.opConcatMapAsync).toBeInstanceOf(Function);
        expect(operators.opConcatMapSync).toBeInstanceOf(Function);
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
        expect(operators.opSkip).toBeInstanceOf(Function);
        expect(operators.opSkipAsync).toBeInstanceOf(Function);
        expect(operators.opSkipSync).toBeInstanceOf(Function);
        expect(operators.opTake).toBeInstanceOf(Function);
        expect(operators.opTakeAsync).toBeInstanceOf(Function);
        expect(operators.opTakeSync).toBeInstanceOf(Function);
        expect(operators.opUnique).toBeInstanceOf(Function);
        expect(operators.opUniqueAsync).toBeInstanceOf(Function);
        expect(operators.opUniqueSync).toBeInstanceOf(Function);
    });
});
