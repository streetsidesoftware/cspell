import { beforeEach, describe, expect, it } from 'vitest';

import { RefCounter } from './RefCounter.mjs';

describe('RefCounter', () => {
    let counter: RefCounter<string>;

    beforeEach(() => {
        counter = new RefCounter<string>();
    });

    it('should initialize with no refs', () => {
        expect(counter.get('a')).toBe(0);
        expect(counter.isReferenced('a')).toBe(false);
    });

    it('should add refs and increment count', () => {
        counter.add('a');
        expect(counter.get('a')).toBe(1);
        counter.add('a');
        expect(counter.get('a')).toBe(2);
        expect(counter.isReferenced('a')).toBe(true);
    });

    it('should set ref count directly', () => {
        counter.set('b', 5);
        expect(counter.get('b')).toBe(5);
        counter.set('b', 0);
        expect(counter.get('b')).toBe(0);
        expect(counter.isReferenced('b')).toBe(false);
    });

    it('should clear all refs', () => {
        counter.add('a');
        counter.add('b');
        counter.clear();
        expect(counter.get('a')).toBe(0);
        expect(counter.get('b')).toBe(0);
        expect(counter.isReferenced('a')).toBe(false);
        expect(counter.isReferenced('b')).toBe(false);
    });

    it('should be iterable', () => {
        counter.set('x', 2);
        counter.set('y', 3);
        const entries = [...counter];
        expect(entries).toContainEqual(['x', 2]);
        expect(entries).toContainEqual(['y', 3]);
        expect(entries.length).toBe(2);
    });

    it('should initialize from iterable', () => {
        const c = new RefCounter(['a', 'b', 'a']);
        expect(c.get('a')).toBe(2);
        expect(c.get('b')).toBe(1);
        expect(c.get('c')).toBe(0);
    });

    it('should handle different types', () => {
        const numCounter = new RefCounter<number>();
        numCounter.add(1);
        numCounter.add(2);
        numCounter.add(1);
        expect(numCounter.get(1)).toBe(2);
        expect(numCounter.get(2)).toBe(1);
    });

    it('should delete entries', () => {
        counter.set('a', 3);
        counter.set('b', 2);
        expect(counter.delete('a')).toBe(true);
        expect(counter.get('a')).toBe(0);
        expect(counter.isReferenced('a')).toBe(false);
        expect(counter.isReferenced('b')).toBe(true);
        expect(counter.delete('c')).toBe(false);
    });

    it('should have a value', () => {
        counter.set('a', 3);
        counter.set('b', 2);
        expect(counter.has('a')).toBe(true);
        expect(counter.has('b')).toBe(true);
        expect(counter.has('c')).toBe(false);
    });
});
