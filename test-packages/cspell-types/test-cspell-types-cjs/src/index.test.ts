import { gatherIssues } from './index';

describe('index', () => {
    test('gatherIssues', () => {
        const text = 'Have a nice day.';
        expect(gatherIssues(text)).toHaveLength(1);
    });
});
