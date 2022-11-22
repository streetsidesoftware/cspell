export { toArraySync as toArray } from '../helpers/toArray';
export {
    opAppendSync as opAppend,
    opCombineSync as opCombine,
    opConcatMapSync as opConcatMap,
    opFilterSync as opFilter,
    opFirstSync as opFirst,
    opFlattenSync as opFlatten,
    opJoinStringsSync as opJoinStrings,
    opLastSync as opLast,
    opMapSync as opMap,
    opReduceSync as opReduce,
    opSkipSync as opSkip,
    opTakeSync as opTake,
    opTapSync as opTap,
    opUniqueSync as opUnique,
} from '../operators';
export type { OperatorSync as Operator } from '../operators';
export { pipeSync as pipe, pipeSync } from '../pipe';
export { reduceSync as reduce } from '../reduce';
