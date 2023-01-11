import type { Plugin } from 'rollup';
import MagicString from './magic-string.mjs';

const codeSnippet = `\
import {fileURLToPath as $$inject_fileURLToPath} from 'url';
import {dirname as $$inject_dirname} from 'path';
const __filename = $$inject_fileURLToPath(import.meta.url);
const __dirname = $$inject_dirname(__filename);
`;

export default function injectDirname(): Plugin {
    return {
        name: 'inject-dirname',
        renderChunk: {
            // sequential: true,
            order: 'pre',
            handler(code, chunk, _meta) {
                if (chunk.fileName.endsWith('.cjs')) return;

                const ms = inject(code);
                if (!ms) return;
                const sm = ms.generateMap();
                return { code: ms.toString(), map: sm };
            },
        },
        writeBundle: {
            sequential: true,
            order: 'post',
            async handler(param) {
                if (param.format !== 'es') return;
                // console.log('%o', param);
            },
        },
    };
}

function inject(code: string): MagicString | undefined {
    const pos = calcPosition(code);
    if (pos === undefined) return undefined;

    const ms = new MagicString(code);

    return ms.appendLeft(pos, codeSnippet);
}

function calcPosition(code: string): number | undefined {
    if (!code.includes('__dirname')) return undefined;

    const beforePos = code.indexOf('commonjsGlobal');
    if (beforePos < 0) return logError('`commonjsGlobal` Not found, cannot inject.');
    const lastImportPos = code.lastIndexOf('import', beforePos);
    if (lastImportPos < 0) return logError('`import` not found, cannot inject.');

    const betweenCode = code.slice(lastImportPos, beforePos);
    const after = Math.max(betweenCode.indexOf(';'), betweenCode.indexOf('\n')) + 1;
    return lastImportPos + after;
}

function logError(msg: string): undefined {
    console.error(msg);
    return undefined;
}
