import { describe, expect, test } from 'vitest';

import { IssueCode } from './cspell.cache';

describe('Cache', () => {
    test('IssueCode', () => {
        const codes = [IssueCode.UnknownWord, IssueCode.ForbiddenWord, IssueCode.KnownIssue];
        const sum = codes.reduce((a, b) => a + b, 0);
        expect(sum).toBe(IssueCode.ALL);
    });
});
