import type { CSpellReporter, Issue, ReporterConfiguration } from '@cspell/cspell-types';

export function getReporter(settings: unknown, config: ReporterConfiguration): CSpellReporter {
    const issues: Issue[] = [];

    console.log(`Settings: %o\nOptions: %o`, settings, config);

    return {
        issue: (issue) => issues.push(issue),
        result: (result) => {
            for (const issue of issues) {
                console.log(`Issue:\t"${issue.text}"\t${issue.row}\t${issue.col}`);
            }
            console.log('%o', result);
        },
    };
}
