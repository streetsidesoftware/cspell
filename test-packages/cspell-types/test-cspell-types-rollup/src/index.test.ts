import { describe, expect, test } from 'vitest';

import { gatherIssues } from './index.js';

describe('index', () => {
    test('gatherIssues', () => {
        const text = 'Have a nice day.';
        expect(gatherIssues(text)).toHaveLength(1);
    });
});
