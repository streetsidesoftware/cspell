import { operators } from '@cspell/cspell-pipe';

export {
    helpers as asyncHelpers,
    toArray as asyncIterableToArray,
    operators as asyncOperators,
    pipeAsync as asyncPipe,
    toAsyncIterable as mergeAsyncIterables,
} from '@cspell/cspell-pipe';

export const {
    opMapAsync: asyncMap,
    opFilterAsync: asyncFilter,
    opAwaitAsync: asyncAwait,
    opFlattenAsync: asyncFlatten,
} = operators;
