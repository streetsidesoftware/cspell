export const DEFAULT_COMPOUNDED_WORD_SEPARATOR = '∙';

export const opCosts = {
    baseCost: 100,
    swapCost: 75,
    duplicateLetterCost: 25,
    visuallySimilar: 1,
    firstLetterBias: 25,
    wordBreak: 99,
    wordLengthCostFactor: 0.5,
} as const;
