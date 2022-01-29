import { HunspellCosts, EditCosts } from '../models/DictionaryInformation';
import { cleanCopy } from '../utils/util';

export type EditCostsRequired = Required<EditCosts>;
export type HunspellCostsRequired = Required<HunspellCosts>;

const defaultEditCosts: EditCostsRequired = {
    accentCosts: 1,
    baseCost: 100,
    capsCosts: 1,
    firstLetterPenalty: 4,
    nonAlphabetCosts: 110,
};

const defaultHunspellCosts: HunspellCostsRequired = {
    ...defaultEditCosts,
    ioConvertCost: 30,
    keyboardCost: 99,
    mapCost: 25,
    replaceCosts: 75,
    tryCharCost: 100,
};

export function mapHunspellCosts(costs: HunspellCosts = {}): HunspellCostsRequired {
    return { ...defaultHunspellCosts, ...cleanCopy(costs) };
}

export function mapEditCosts(costs: EditCosts = {}): EditCostsRequired {
    return { ...defaultEditCosts, ...cleanCopy(costs) };
}
