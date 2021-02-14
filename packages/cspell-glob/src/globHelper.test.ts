import { fileOrGlobToGlob } from './globHelper';
import { win32, posix } from 'path';
import { PathInterface } from './GlobMatcherTypes';

describe('Validate fileOrGlobToGlob', () => {
    function g(glob: string, root: string) {
        return { glob, root };
    }

    function p(root: string, path: PathInterface): string {
        const cwd = path === win32 ? 'E:\\user\\projects' : '/User/projects';
        return path.resolve(cwd, root);
    }

    function pp(root: string): string {
        return p(root, posix);
    }

    function pw(root: string): string {
        return p(root, win32);
    }

    test.each`
        file                                        | root   | path     | expected                                           | comment
        ${'*.json'}                                 | ${'.'} | ${posix} | ${g('*.json', pp('.'))}                            | ${'posix'}
        ${'*.json'}                                 | ${'.'} | ${win32} | ${g('*.json', pw('.'))}                            | ${'win32'}
        ${pp('./*.json')}                           | ${'.'} | ${posix} | ${g('*.json', pp('.'))}                            | ${''}
        ${pw('./*.json')}                           | ${'.'} | ${win32} | ${g('*.json', pw('.'))}                            | ${''}
        ${pp('./package.json')}                     | ${'.'} | ${posix} | ${g('package.json', pp('.'))}                      | ${''}
        ${pw('.\\package.json')}                    | ${'.'} | ${win32} | ${g('package.json', pw('.'))}                      | ${''}
        ${pp('./a/package.json')}                   | ${'.'} | ${posix} | ${g('a/package.json', pp('.'))}                    | ${''}
        ${pw('.\\a\\package.json')}                 | ${'.'} | ${win32} | ${g('a/package.json', pw('.'))}                    | ${''}
        ${'/user/tester/projects'}                  | ${'.'} | ${posix} | ${g('/user/tester/projects', pp('.'))}             | ${'Directory not matching root.'}
        ${'C:\\user\\tester\\projects'}             | ${'.'} | ${win32} | ${g('C:/user/tester/projects', pw('.'))}           | ${'Directory not matching root.'}
        ${'/user/tester/projects/**/*.json'}        | ${'.'} | ${posix} | ${g('/user/tester/projects/**/*.json', pp('.'))}   | ${'A glob like path not matching the root.'}
        ${'C:\\user\\tester\\projects\\**\\*.json'} | ${'.'} | ${win32} | ${g('C:/user/tester/projects/**/*.json', pw('.'))} | ${'A glob like path not matching the root.'}
    `('fileOrGlobToGlob file: "$file" root: "$root" $comment', ({ file, root, path, expected }) => {
        root = p(root, path);
        const r = fileOrGlobToGlob(file, root, path);
        expect(r).toEqual(expected);
    });
});
