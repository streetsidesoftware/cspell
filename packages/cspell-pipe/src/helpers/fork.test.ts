import { describe, expect, test } from 'vitest';

import { opTakeSync } from '../operators/take.js';
import { generatorTestWrapper, makeIterableTestWrapperOptions } from '../test/iterableTestWrapper.js';
import { throwAfter } from '../test/throwAfter.js';
import { fork } from './fork.js';
import { interleave } from './interleave.js';
import { toArray } from './toArray.js';

describe('fork', () => {
    test('simple', () => {
        const f = fork([1, 2, 3, 4, 5]);
        expect([...f[0]]).toEqual([1, 2, 3, 4, 5]);
        expect([...f[1]]).toEqual([1, 2, 3, 4, 5]);
    });

    test('test sync', () => {
        const f = fork([1, 2, 3, 4, 5]);
        expect([...interleave(f[0], f[1])]).toEqual([1, 1, 2, 2, 3, 3, 4, 4, 5, 5]);
    });

    test('from generator', () => {
        const options = makeIterableTestWrapperOptions();
        const f = fork(generatorTestWrapper([1, 2, 3, 4, 5], options));
        expect([...f[0]]).toEqual([1, 2, 3, 4, 5]);
        expect([...f[1]]).toEqual([1, 2, 3, 4, 5]);
        expect(options.nextCalled).toHaveBeenCalledTimes(6);
        expect(options.returnCalled).toHaveBeenCalledTimes(1);
        expect(options.throwCalled).toHaveBeenCalledTimes(0);
    });

    test('from generator', () => {
        const options = makeIterableTestWrapperOptions();
        const f = fork(generatorTestWrapper(genNumbers(), options));
        expect([...take(f[0], 3)]).toEqual([1, 2, 3]);
        expect(options.nextCalled).toHaveBeenCalledTimes(4);
        expect(options.nextReturned).toHaveBeenCalledTimes(4);
        expect(options.returnCalled).toHaveBeenCalledTimes(0);
        expect(options.throwCalled).toHaveBeenCalledTimes(0);
        expect([...take(f[1], 6)]).toEqual([1, 2, 3, 4, 5, 6]);
        expect(options.nextCalled).toHaveBeenCalledTimes(7);
        expect(options.returnCalled).toHaveBeenCalledTimes(1);
        expect(options.throwCalled).toHaveBeenCalledTimes(0);
    });

    test('with errors, no .throw', () => {
        const f = fork([1, 2, 3, 4, 5]);
        expect(() => toArray(whenThrow(f[0], 3, 'my error'))).toThrow('my error');
    });

    test('with errors late', () => {
        const options = makeIterableTestWrapperOptions();
        const f = fork(generatorTestWrapper([1, 2, 3, 4, 5, 6, 7], options));
        expect([...f[0]]).toEqual([1, 2, 3, 4, 5, 6, 7]);
        expect(options.nextCalled).toHaveBeenCalledTimes(8);
        expect(options.nextReturned).toHaveBeenCalledTimes(8);
        expect(() => [...throwAfter(f[1], 3, 'my error')]).toThrow('my error');
        expect(options.returnCalled).toHaveBeenCalledTimes(1);
        expect(options.throwCalled).toHaveBeenCalledTimes(0);
    });

    test('with errors early', () => {
        const options = makeIterableTestWrapperOptions();
        const f = fork(generatorTestWrapper([1, 2, 3, 4, 5, 6, 7], options));
        expect(() => [...generatorTestWrapper(throwAfter(f[1], 3, 'my error'))]).toThrow('my error');
        expect(options.nextCalled).toHaveBeenCalledTimes(3);
        expect(options.nextReturned).toHaveBeenCalledTimes(3);
        expect(options.returnCalled).toHaveBeenCalledTimes(1);
        expect(options.throwCalled).toHaveBeenCalledTimes(1);
    });

    test('asymmetric', () => {
        const f = fork([1, 2, 3, 4, 5]);
        expect(toArray(opTakeSync(2)(f[0]))).toEqual([1, 2]);
        expect([...f[1]]).toEqual([1, 2, 3, 4, 5]);
    });
});

describe('Generator Throw Assumptions', () => {
    test('No Throw - Empty', () => {
        const options = makeIterableTestWrapperOptions();
        const g = generatorTestWrapper([], options);
        expect([...g]).toEqual([]);
        expect(options.nextCalled).toHaveBeenCalledTimes(1);
        expect(options.returnCalled).toHaveBeenCalledTimes(1);
        expect(options.throwCalled).toHaveBeenCalledTimes(0);
    });

    test('No Throw', () => {
        const options = makeIterableTestWrapperOptions();
        const g = generatorTestWrapper([1, 2, 3], options);
        expect([...g]).toEqual([1, 2, 3]);
        expect(options.nextCalled).toHaveBeenCalledTimes(4);
        expect(options.returnCalled).toHaveBeenCalledTimes(1);
        expect(options.throwCalled).toHaveBeenCalledTimes(0);
    });

    test('Throw after', () => {
        const options = makeIterableTestWrapperOptions();
        const g = throwAfter(generatorTestWrapper([1, 2, 3, 4, 5], options), 2, 'my error');
        expect(() => [...take(g, 20)]).toThrow('my error');
        expect(options.nextCalled).toHaveBeenCalledTimes(2);
        expect(options.returnCalled).toHaveBeenCalledTimes(1);
        expect(options.throwCalled).toHaveBeenCalledTimes(1);
    });
});

function* take<T>(iterable: Iterable<T>, count: number) {
    for (const v of iterable) {
        if (count-- <= 0) {
            break;
        }
        yield v;
    }
}

function* genNumbers() {
    let i = 0;
    while (true) {
        yield ++i;
    }
}

function* whenThrow<T>(i: Iterable<T>, when: T, error: unknown) {
    for (const v of i) {
        if (v === when) {
            throw error;
        }
        yield v;
    }
}
