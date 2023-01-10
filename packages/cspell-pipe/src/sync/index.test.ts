import { describe, expect, test } from 'vitest';
import * as pipe from './index.js';

describe('Pipe Sync API', () => {
    test('pipe api', () => {
        expect(Object.keys(pipe).sort()).toMatchSnapshot();
    });
});
