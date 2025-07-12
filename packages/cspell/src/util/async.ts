import { operators } from '@cspell/cspell-pipe';

export {
    helpers as asyncHelpers,
    toArray as asyncIterableToArray,
    operators as asyncOperators,
    pipeAsync as asyncPipe,
    toAsyncIterable as mergeAsyncIterables,
} from '@cspell/cspell-pipe';

export const asyncMap: typeof operators.opMapAsync = operators.opMapAsync;
export const asyncFilter: typeof operators.opFilterAsync = operators.opFilterAsync;
export const asyncAwait: typeof operators.opAwaitAsync = operators.opAwaitAsync;
export const asyncFlatten: typeof operators.opFlattenAsync = operators.opFlattenAsync;
