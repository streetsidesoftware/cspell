import { Target, CompileRequest, CompileTargetOptions } from './config';
import { getLogger } from './logger';

export async function compile(request: CompileRequest): Promise<void> {
    const { targets } = request;

    for (const target of targets) {
        await compileTarget(target, request);
    }
}

export async function compileTarget(target: Target, _options: CompileTargetOptions): Promise<void> {
    const log = getLogger();

    const { filename } = target;
    log(`Start compile: ${filename}`);

    // const useTrie = target.format.startsWith('trie');
    // const fileExt = useTrie ? '.trie' : '.txt';

    log(`Done compile: ${filename}`);
}
