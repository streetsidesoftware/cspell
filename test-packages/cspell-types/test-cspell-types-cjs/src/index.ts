import {
    IssueType,
    MessageTypes,
    type Issue,
    type MessageEmitter,
    type SpellingErrorEmitter,
} from '@cspell/cspell-types';

export function gatherIssues(text: string): Issue[] {
    const issues: Issue[] = [];

    const emitMsg: MessageEmitter = (msg, mt) => {
        if (mt === MessageTypes.Debug) {
            console.log(msg);
        }
    };

    const emitIssue: SpellingErrorEmitter = (issue) => issues.push(issue);

    // const issueDirective = IssueType.directive;
    const issueSpelling = IssueType.spelling;

    const info = MessageTypes.Info;

    const lines = text.split('\n');

    emitMsg('info', info);
    const issue: Issue = {
        context: { text, offset: 0 },
        row: 1,
        col: 4,
        line: { text: lines[0], offset: 0 },
        text: 'text',
        offset: 4,
        issueType: issueSpelling,
    };
    emitIssue(issue);

    return issues;
}
