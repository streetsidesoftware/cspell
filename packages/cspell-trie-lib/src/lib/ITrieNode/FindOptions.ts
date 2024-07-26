import type { PartialWithUndefined } from '../types.js';
import type { CompoundModes } from './CompoundModes.js';

export interface FindOptions {
    matchCase: boolean;
    compoundMode: CompoundModes;
    legacyMinCompoundLength?: number;
}

export type PartialFindOptions = PartialWithUndefined<FindOptions> | undefined;
