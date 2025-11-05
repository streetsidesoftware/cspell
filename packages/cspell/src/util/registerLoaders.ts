/* eslint-disable n/no-unsupported-features/node-builtins */
import { register } from 'node:module';

export function registerLoaders(loaders: string[] | undefined, cwdUrl: URL): void {
    if (!loaders?.length) return;

    function registerLoader(loader: string) {
        register(loader, cwdUrl);
    }

    loaders.forEach(registerLoader);
}
