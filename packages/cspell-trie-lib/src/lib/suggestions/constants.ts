export const DEFAULT_COMPOUNDED_WORD_SEPARATOR = '∙';

export const opCosts = {
    baseCost: 100,
    swapCost: 75,
    duplicateLetterCost: 80,
    compound: 1,
    visuallySimilar: 1,
    firstLetterBias: 5,
    wordBreak: 99,
    wordLengthCostFactor: 0.5,
} as const;
