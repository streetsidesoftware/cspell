import { describe, expect, test } from 'vitest';

import { NodeHeaderNumChildrenBits, NodeHeaderNumChildrenMask } from './TrieBlobFormat.ts';

describe('TrieBlobFormat', () => {
    test('expected constants', () => {
        expect(NodeHeaderNumChildrenMask).toBe((1 << NodeHeaderNumChildrenBits) - 1);
    });
});
