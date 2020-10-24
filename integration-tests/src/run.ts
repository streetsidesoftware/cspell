import { check } from './check';

function run() {
    const command = process.argv[2];

    switch( command ) {
        case 'check': {
            check();
            break;
        }
        default: {
            console.log(usage);
        }
    }
}

const usage = `
Integration test runner:

Commands:
    check - run all integration tests.
    add - adds a repository
`;

run();
