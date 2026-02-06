import { createUnplugin, type UnpluginInstance } from 'unplugin';

import { type Options, resolveOptions } from './core/options.ts';

export const Starter: UnpluginInstance<Options | undefined, false> = createUnplugin((rawOptions = {}) => {
    const options = resolveOptions(rawOptions);

    const name = '@cspell/dictionary-bundler-plugin';
    return {
        name,
        enforce: options.enforce,

        transform: {
            filter: {
                id: { include: options.include, exclude: options.exclude },
            },
            handler(code, _id) {
                return `// @cspell/dictionary-bundler-plugin injected\n${code}`;
            },
        },
    };
});
