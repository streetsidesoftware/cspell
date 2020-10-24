import { check } from './check';
import { addRepository, updateRepository } from './repositoryHelper';

function run() {
    const command = process.argv[2];

    switch( command ) {
        case 'check': {
            check(process.argv[3] || '');
            break;
        }
        case 'add': {
            const url = process.argv[3];
            if (!addRepository(url)) {
                showUsage(usageAdd);
            }
            break;
        }
        case 'update': {
            const path = process.argv[3];
            if (!updateRepository(path)) {
                showUsage(usageUpdate);
            }
            break;
        }
        default: {
            showUsage();
        }
    }

    process.exit(0);
}

const usageAdd = `
Add repository:
    add <url-to-repository>
    example: add https://github.com/bitjson/typescript-starter.git
`

const usageUpdate = `
Update repository:
    update <path-to-repository>
    example: update bitjson/typescript-starter
`

const usage = `
Integration test runner:

Commands:
    check - run all integration tests.
    add <url> - adds a repository as a submodule
    update <path> - update an integration test submodule
`;

function showUsage(msg = usage, exitWithCode = 1) {
    console.log(msg);
    if (exitWithCode) {
        process.exit(exitWithCode);
    }
}

run();
