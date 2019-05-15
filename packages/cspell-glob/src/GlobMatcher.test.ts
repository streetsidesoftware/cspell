import { GlobMatcher, GlobMatch } from './GlobMatcher';
import { expect } from 'chai';

describe('Validate GlobMatcher', () => {
    tests().forEach(([patterns, root, filename, expected, description], index) => {
        it(`test ${index} ${description}, pattern: [${patterns}] filename: "${filename}", root: "${root}"`, () => {
            const matcher = new GlobMatcher(patterns, root);
            expect(matcher.match(filename)).to.be.eq(expected);
        });
    });
});

describe('Tests .gitignore file contents', () => {
    const pattern = `
        # This is a comment

        # ignore spec and test files.
        src/*.{test|spec}.ts
        node_modules/**
        dist
        *.js
        !**/settings.js
        !!*.txt
    `;
    const root = '/Users/code/project/cspell/';
    const matcher = new GlobMatcher(pattern, root);

    function t(filename: string, expected: boolean, comment: string) {
        it(`Test: "${comment}" File: "${filename}" (${expected ? 'Block' : 'Allow'}) `, () => {
            expect(matcher.match(filename)).to.be.eq(expected);
        });
    }

    function tt(filename: string, expected: GlobMatch, comment: string) {
        it(`Test: "${comment}" File: "${filename}" (${expected ? 'Block' : 'Allow'}) `, () => {
            expect(matcher.matchEx(filename)).to.be.deep.eq(expected);
        });
    }

    t(root + 'src/code.ts', false, 'Ensure that .ts files are allowed');
    t(root + 'dist/code.ts', true, 'Ensure that `dest` .ts files are not allowed');
    t(root + 'src/code.js', true, 'Ensure that no .js files are allowed');
    t(root + 'src/code.test.ts', true, 'Ensure that test.ts files are not allowed');
    t(root + 'src/code.spec.ts', true, 'Ensure that spec.ts files are not allowed');
    t('/Users/guest/code/' + 'src/code.test.ts', false, 'Ensure that test files in a different root are allowed');
    t('/Users/guest/code/' + 'src/code.js', true, 'Ensure *.js files are never allowed even in a different root.');
    t(root + 'node_modules/cspell/code.ts', true, 'Ensure that node modules are not allowed in the current root.');
    t(root + 'nested/node_modules/cspell/code.ts', false, 'Ensure that nested node modules are allowed in the current root.');
    t('/Users/guest/code/' + 'node_modules/cspell/code.ts', false, 'Ensure that node modules in a different root are allowed');
    t(root + 'settings.js', false, 'Ensure that settings.js is kept');
    t(root + 'dist/settings.js', false, 'Ensure that settings.js is kept');
    t(root + 'node_modules/settings.js', false, 'Ensure that settings.js is kept');
    t(root + 'src.txt', true, 'Ensure that double negative means block');

    tt(root + 'src/code.ts', { matched: false }, 'Ensure that .ts files are allowed');
    tt(root + 'dist/code.ts', { matched: true, glob: 'dist', index: 6, isNeg: false }, 'Ensure that `dest` .ts files are not allowed');
    tt(root + 'src/code.js', { matched: true, glob: '*.js', index: 7, isNeg: false }, 'Ensure that no .js files are allowed');
    tt(root + 'dist/settings.js', { matched: false, glob: '!**/settings.js', index: 8, isNeg: true }, 'Ensure that settings.js is kept');

});

function tests(): [string[], string | undefined, string, boolean, string][] {
    return [

        [['*.json'],                undefined, '/settings.json', true, '*.json'],
        [['.vscode'],               undefined, '/.vscode/settings.json', true, '.vscode'],
        [['/*.json'],               undefined, '/settings.json', true, 'Matches only root level files, /*.json'],            // .
        [['/*.json'],               undefined, '/src/settings.json', false, 'Matches only root level files, /*.json'],            // .
        [['*.js'],                  undefined, '/src/settings.js', true, '// Matches nested files, *.js'],
        [['.vscode/'],              undefined, '/.vscode/settings.json', true, '.vscode/'],
        [['.vscode/'],              undefined, '/.vscode', true, '.vscode/'],  // This one shouldn't match, but micromatch says it should. :-(
        [['.vscode/'],              undefined, '/src/.vscode/settings.json', false, 'shouldn\'t match nested .vscode/'],
        [['**/.vscode/'],           undefined, '/src/.vscode/settings.json', true,  'should match nested .vscode/'],
        [['**/.vscode'],            undefined, '/src/.vscode/settings.json', false, 'should not match nested **/.vscode'],
        [['**/.vscode/**'],         undefined, '/src/.vscode/settings.json', true,  'should match nested **/.vscode'],
        [['/User/user/Library/**'], undefined, '/src/User/user/Library/settings.json', false, 'No match'],
        [['/User/user/Library/**'], undefined, '/User/user/Library/settings.json', true, 'Match system root'],

        [['*.json'],                undefined, 'settings.json', true, '*.json'],
        [['.vscode'],               undefined, '.vscode/settings.json', true, '.vscode'],
        [['/*.json'],               undefined, 'settings.json', true, 'Matches only root level files, /*.json'],            // .
        [['/*.json'],               undefined, 'src/settings.json', false, 'Matches only root level files, /*.json'],            // .
        [['*.js'],                  undefined, 'src/settings.js', true, '// Matches nested files, *.js'],
        [['.vscode/'],              undefined, '.vscode/settings.json', true, '.vscode/'],
        [['.vscode/'],              undefined, '.vscode', true, '.vscode/'],  // This one shouldn't match, but micromatch says it should. :-(
        [['.vscode/'],              undefined, 'src/.vscode/settings.json', false, 'shouldn\'t match nested .vscode/'],
        [['**/.vscode/'],           undefined, 'src/.vscode/settings.json', true,  'should match nested .vscode/'],
        [['**/.vscode'],            undefined, 'src/.vscode/settings.json', false, 'should not match nested **/.vscode'],
        [['**/.vscode/**'],         undefined, 'src/.vscode/settings.json', true,  'should match nested **/.vscode'],
        [['/User/user/Library/**'], undefined, 'src/User/user/Library/settings.json', false, 'No match'],
        [['/User/user/Library/**'], undefined, 'User/user/Library/settings.json', true, 'Match system root'],

        // With Root
        [['*.json'],                '/User/code/src', '/User/code/src/settings.json', true, 'With Root *.json'],
        [['.vscode'],               '/User/code/src', '/User/code/src/.vscode/settings.json', true, 'With Root .vscode'],
        [['/*.json'],               '/User/code/src', '/User/code/src/settings.json', true, 'With Root Matches only root level files, /*.json'],            // .
        [['*.js'],                  '/User/code/src', '/User/code/src/src/settings.js', true, 'With Root Matches nested files, *.js'],
        [['.vscode/'],              '/User/code/src', '/User/code/src/.vscode/settings.json', true, 'With Root .vscode/'],
        [['.vscode/'],              '/User/code/src', '/User/code/src/.vscode', true, 'With Root .vscode/'],  // This one shouldn't match, but micromatch says it should. :-(
        [['.vscode/'],              '/User/code/src', '/User/code/src/src/.vscode/settings.json', false, 'With Root shouldn\'t match nested .vscode/'],
        [['**/.vscode/'],           '/User/code/src', '/User/code/src/src/.vscode/settings.json', true, 'With Root should match nested .vscode/'],
        [['/User/user/Library/**'], '/User/code/src', '/src/User/user/Library/settings.json', false, 'With Root No match'],
        [['/User/user/Library/**'], '/User/code/src', '/User/user/Library/settings.json', true, 'With Root Match system root'],

        // With non matching Root
        [['*.json'],                '/User/lib/src', '/User/code/src/settings.json', true, 'With non matching Root *.json'],
        [['.vscode'],               '/User/lib/src', '/User/code/src/.vscode/settings.json', true, 'With non matching Root .vscode'],
        [['/*.json'],               '/User/lib/src', '/User/code/src/settings.json', false, 'With non matching Root Matches only root level files, /*.json'],            // .
        [['*.js'],                  '/User/lib/src', '/User/code/src/src/settings.js', true, 'With non matching Root Matches nested files, *.js'],
        [['.vscode/'],              '/User/lib/src', '/User/code/src/.vscode/settings.json', false, 'With non matching Root .vscode/'],
        [['.vscode/'],              '/User/lib/src', '/User/code/src/.vscode', false, 'With non matching Root .vscode/'],  // This one shouldn't match, but micromatch says it should. :-(
        [['.vscode/'],              '/User/lib/src', '/User/code/src/src/.vscode/settings.json', false, 'With non matching Root shouldn\'t match nested .vscode/'],
        [['**/.vscode/'],           '/User/lib/src', '/User/code/src/src/.vscode/settings.json', true, 'With non matching Root should match nested .vscode/'],
        [['/User/user/Library/**'], '/User/lib/src', '/src/User/user/Library/settings.json', false, 'With non matching Root No match'],
        [['/User/user/Library/**'], '/User/lib/src', '/User/user/Library/settings.json', true, 'With non matching Root Match system root'],

        // Root with trailing /
        [['*.json'],                '/User/code/src/', '/User/code/src/settings.json', true, '*.json'],
        [['.vscode'],               '/User/code/src/', '/User/code/src/.vscode/settings.json', true, '.vscode'],
        [['/*.json'],               '/User/code/src/', '/User/code/src/settings.json', true, 'Matches only root level files, /*.json'],            // .
        [['*.js'],                  '/User/code/src/', '/User/code/src/src/settings.js', true, '// Matches nested files, *.js'],
        [['.vscode/'],              '/User/code/src/', '/User/code/src/.vscode/settings.json', true, '.vscode/'],
        [['.vscode/'],              '/User/code/src/', '/User/code/src/.vscode', true, '.vscode/'],  // This one shouldn't match, but micromatch says it should. :-(
        [['.vscode/'],              '/User/code/src/', '/User/code/src/src/.vscode/settings.json', false, 'shouldn\'t match nested .vscode/'],
        [['**/.vscode/'],           '/User/code/src/', '/User/code/src/src/.vscode/settings.json', true, 'should match nested .vscode/'],
        [['/User/user/Library/**'], '/User/code/src/', '/src/User/user/Library/settings.json', false, 'No match'],
        [['/User/user/Library/**'], '/User/code/src/', '/User/user/Library/settings.json', true, 'Match system root'],

        // System Root /
        [['*.json'],                '/', '/User/code/src/settings.json', true, '*.json'],
        [['.vscode'],               '/', '/.vscode/settings.json', true, '.vscode'],
        [['/*.json'],               '/', '/settings.json', true, 'Matches only root level files, /*.json'],            // .
        [['*.js'],                  '/', '/src/settings.js', true, '// Matches nested files, *.js'],
        [['.vscode/'],              '/', '/.vscode/settings.json', true, '.vscode/'],
        [['.vscode/'],              '/', '/.vscode', true, '.vscode/'],  // This one shouldn't match, but micromatch says it should. :-(
        [['.vscode/'],              '/', '/src/.vscode/settings.json', false, 'shouldn\'t match nested .vscode/'],
        [['**/.vscode/'],           '/', '/src/.vscode/settings.json', true, 'should match nested .vscode/'],
        [['/User/user/Library/**'], '/', '/src/User/user/Library/settings.json', false, 'No match'],
        [['/User/user/Library/**'], '/', '/User/user/Library/settings.json', true, 'Match system root'],

        // Empty Root /
        [['*.json'],                '', '/User/code/src/settings.json', true, '*.json'],
        [['.vscode'],               '', '/.vscode/settings.json', true, '.vscode'],
        [['/*.json'],               '', '/settings.json', true, 'Matches only root level files, /*.json'],            // .
        [['*.js'],                  '', '/src/settings.js', true, '// Matches nested files, *.js'],
        [['.vscode/'],              '', '/.vscode/settings.json', true, '.vscode/'],
        [['.vscode/'],              '', '/.vscode', true, '.vscode/'],  // This one shouldn't match, but micromatch says it should. :-(
        [['.vscode/'],              '', '/src/.vscode/settings.json', false, 'shouldn\'t match nested .vscode/'],
        [['**/.vscode/'],           '', '/src/.vscode/settings.json', true, 'should match nested .vscode/'],
        [['/User/user/Library/**'], '', '/src/User/user/Library/settings.json', false, 'No match'],
        [['/User/user/Library/**'], '', '/User/user/Library/settings.json', true, 'Match system root'],

        // Special characters
        [['#'],                     '', '/User/code/src/settings.json', false, 'Only comments'],
        [[' #'],                    '', '/User/code/src/settings.json', false, 'Only comments'],
        [['#', '*.json', '#'],      '', '/User/code/src/settings.json', true, 'Comments'],
        [['#', '*.json', '*.js'],   '', '/User/code/src/settings.js',   true, 'Multiple patterns'],
        [['#', '**/src/', '*.js'],  '', '/User/code/src/settings.js',  true, 'Multiple patterns'],
        [['{*.js,*.json}'],         '', '/User/code/src/settings.js',  true, 'Braces'],
        [['{src,dist}'],            '', '/User/code/src/settings.json',  true, 'Braces'],
        [['{src,dist}'],            '', '/User/code/dist/settings.json',  true, 'Braces'],
        [['{src,dist}'],            '', '/User/code/distribution/settings.json',  false, 'Braces'],
        [['**/{src,dist}/**'],      '', '/User/code/src/settings.json',  true, 'Braces'],
        [['**/{src,dist}/**'],      '', '/User/code/dist/settings.json',  true, 'Braces'],
        [['**/{src,dist}/**'],      '', '/User/code/lib/settings.json',  false, 'Braces'],
        [['{*.js,*.json}'],         '', '/User/code/src/settings.js',  true, 'Braces'],
        [['#', '**/dist/', '*.js'], '', '/User/code/src/settings.js',  true, 'Multiple patterns'],
        [['#', '**/dist/', '*.js'], '', '/User/code/src/settings.json',  false, 'Multiple patterns'],
        [['#', '**/dist/', '*.js*'],'', '/User/code/src/settings.json',  true, 'Multiple patterns'],
        [['settings.js'],           '', '/User/code/src/settings.js',  true, 'settings.js'],
        [['!settings.js'],          '', '/User/code/src/settings.js',  false, 'Negations'],
        [['!!settings.js'],         '', '/User/code/src/settings.js',  true, 'Negations'],
        [['!!!settings.js'],        '', '/User/code/src/settings.js',  false, 'Negations'],
        [['!/**/settings.js'],      '', '/User/code/src/settings.js',  false, 'Negations'],
        [['!!/**/settings.js'],     '', '/User/code/src/settings.js',  true, 'Negations'],
        [['!**/settings.js'],       '', '/User/code/src/settings.js',  false, 'Negations'],
        [['#', '**/src/', '*.js', '!**/settings.js'], '', '/User/code/src/settings.js',  false, 'Negations'],
    ];
}
