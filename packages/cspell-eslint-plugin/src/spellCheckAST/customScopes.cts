import type { RequiredOptions } from '../common/options.cjs';

export const defaultCheckedScopes: RequiredOptions['checkScope'] = [
    ['YAMLPair YAMLScalar', true],
    ['YAMLSequence YAMLScalar', true],
    ['JSONProperty JSONLiteral', true],
    ['JSONArrayExpression JSONLiteral', true],

    // ['YAMLPair[key] YAMLScalar', true],
    // ['YAMLPair[value] YAMLScalar', true],
    // ['YAMLSequence[entries] YAMLScalar', true],
    // ['JSONProperty[key] JSONLiteral', true],
    // ['JSONProperty[value] JSONLiteral', true],
    // ['JSONArrayExpression[elements] JSONLiteral', true],
];
