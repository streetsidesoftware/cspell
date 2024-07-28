import type { PartialWithUndefined } from '../types.js';
import type { CompoundModes } from './CompoundModes.js';

export interface FindOptions {
    matchCase: boolean;
    compoundMode: CompoundModes;
    legacyMinCompoundLength?: number | undefined;
    checkForbidden?: boolean | undefined;
}

export type PartialFindOptions = PartialWithUndefined<FindOptions> | undefined;
