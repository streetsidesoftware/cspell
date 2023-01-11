import { describe, expect, test } from 'vitest';

import * as operators from './index.js';

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
        expect(operators.opFirst).toBeInstanceOf(Function);
        expect(operators.opFirstAsync).toBeInstanceOf(Function);
        expect(operators.opFirstSync).toBeInstanceOf(Function);
        expect(operators.opFlatten).toBeInstanceOf(Function);
        expect(operators.opFlattenAsync).toBeInstanceOf(Function);
        expect(operators.opFlattenSync).toBeInstanceOf(Function);
        expect(operators.opJoinStrings).toBeInstanceOf(Function);
        expect(operators.opJoinStringsAsync).toBeInstanceOf(Function);
        expect(operators.opJoinStringsSync).toBeInstanceOf(Function);
        expect(operators.opLast).toBeInstanceOf(Function);
        expect(operators.opLastAsync).toBeInstanceOf(Function);
        expect(operators.opLastSync).toBeInstanceOf(Function);
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
