/* eslint-disable n/no-unsupported-features/node-builtins */
/** alias of global.fetch, useful for mocking */
export const _fetch: typeof global.fetch = global.fetch;
