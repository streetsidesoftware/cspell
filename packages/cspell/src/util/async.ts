import { operators } from '@cspell/cspell-pipe';

export {
    helpers as asyncHelpers,
    operators as asyncOperators,
    pipeAsync as asyncPipe,
    toArray as asyncIterableToArray,
    toAsyncIterable as mergeAsyncIterables,
} from '@cspell/cspell-pipe';

export const {
    opMapAsync: asyncMap,
    opFilterAsync: asyncFilter,
    opAwaitAsync: asyncAwait,
    opFlattenAsync: asyncFlatten,
} = operators;
