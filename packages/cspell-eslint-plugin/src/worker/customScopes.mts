import type { RequiredOptions } from '../common/options.cjs';

export const defaultCheckedScopes: RequiredOptions['checkScope'] = [
    ['YAMLPair[key] YAMLScalar', true],
    ['YAMLPair[value] YAMLScalar', true],
    ['YAMLSequence[entries] YAMLScalar', true],
    ['JSONProperty[key] JSONLiteral', true],
    ['JSONProperty[value] JSONLiteral', true],
    ['JSONArrayExpression[elements] JSONLiteral', true],
];
