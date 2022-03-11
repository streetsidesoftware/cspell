import { reader as myreader, reeder } from './reader';

/**
 * This is some sample code to test cspell's eslint-plugin.
 */

const header = `
****************
Let's test the eslint pluginn to seee if it is workng.
****************
`;

function main() {
    console.log(header);

    console.log(myreader === reeder ? 'Match' : 'miss');

    console.log(myreader(__filename));
}

main();
