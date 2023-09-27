// cspell:ignore TSESTree
import type { TSESTree } from '@typescript-eslint/types';
import assert from 'assert';
import type { CSpellSettings, TextDocument, ValidationIssue } from 'cspell-lib';
import {
    DocumentValidator,
    createTextDocument,
    refreshDictionaryCache,
    extractImportErrors,
    getDictionary,
} from 'cspell-lib';
import type { Comment, Identifier, ImportSpecifier, Literal, Node, TemplateElement } from 'estree';
import * as path from 'path';
import { format } from 'util';

import { getDefaultLogger } from '../common/logger.cjs';
import type { CustomWordListFile, WorkerOptions } from '../common/options.cjs';
import type { ASTNode, JSXText, NodeType } from './ASTNode.cjs';
import type { Issue, SpellCheckResults, Suggestions } from './types.cjs';
import { walkTree } from './walkTree.mjs';

const defaultSettings: CSpellSettings = {
    patterns: [
        // @todo: be able to use cooked / transformed strings.
        // {
        //     // Do not block unicode escape sequences.
        //     name: 'js-unicode-escape',
        //     pattern: /$^/g,
        // },
    ],
};

const isDebugModeExtended = false;

const knownConfigErrors = new Set<string>();

export async function spellCheck(
    filename: string,
    text: string,
    root: Node,
    options: WorkerOptions,
): Promise<SpellCheckResults> {
    const logger = getDefaultLogger();
    const debugMode = options.debugMode || false;
    logger.enabled = options.debugMode ?? (logger.enabled || isDebugModeExtended);
    const log = logger.log;

    log('options: %o', options);

    const toIgnore = new Set<string>();
    const importedIdentifiers = new Set<string>();
    const validator = getDocValidator(filename, text, options);
    await validator.prepare();

    log('Settings: %o', validator.settings);

    const errors = [...validator.errors];
    const issues: Issue[] = [];

    errors.push(...(await checkSettings()));

    async function checkSettings() {
        const finalSettings = validator.getFinalizedDocSettings();
        const found = await reportConfigurationErrors(finalSettings, knownConfigErrors);
        found.forEach((err) => (debugMode ? log(err) : log('Error: %s', err.message)));
        return found;
    }

    function checkLiteral(node: Literal | ASTNode) {
        if (node.type !== 'Literal') return;
        if (!options.checkStrings) return;
        if (typeof node.value === 'string') {
            debugNode(node, node.value);
            if (options.ignoreImports && isImportOrRequired(node)) return;
            if (options.ignoreImportProperties && isImportedProperty(node)) return;
            checkNodeText(node, node.value);
        }
    }

    function checkJSXText(node: JSXText | ASTNode) {
        if (node.type !== 'JSXText') return;
        if (!options.checkJSXText) return;
        if (typeof node.value === 'string') {
            debugNode(node, node.value);
            checkNodeText(node, node.value);
        }
    }

    function checkTemplateElement(node: TemplateElement | ASTNode) {
        if (node.type !== 'TemplateElement') return;
        if (!options.checkStringTemplates) return;
        debugNode(node, node.value);
        checkNodeText(node, node.value.cooked || node.value.raw);
    }

    function checkIdentifier(node: Identifier | ASTNode) {
        if (node.type !== 'Identifier') return;
        debugNode(node, node.name);
        if (options.ignoreImports) {
            if (isRawImportIdentifier(node)) {
                toIgnore.add(node.name);
                return;
            }
            if (isImportIdentifier(node)) {
                importedIdentifiers.add(node.name);
                if (isLocalImportIdentifierUnique(node)) {
                    checkNodeText(node, node.name);
                }
                return;
            } else if (options.ignoreImportProperties && isImportedProperty(node)) {
                return;
            }
        }
        if (!options.checkIdentifiers) return;
        if (toIgnore.has(node.name) && !isObjectProperty(node)) return;
        if (skipCheckForRawImportIdentifiers(node)) return;
        checkNodeText(node, node.name);
    }

    function checkComment(node: Comment | ASTNode) {
        if (node.type !== 'Line' && node.type !== 'Block') return;
        if (!options.checkComments) return;
        debugNode(node, node.value);
        checkNodeText(node, node.value);
    }

    function checkNodeText(node: ASTNode, text: string) {
        if (!node.range) return;

        const adj = node.type === 'Literal' ? 1 : 0;
        const range = [node.range[0] + adj, node.range[1] - adj] as const;

        const scope: string[] = calcScope(node);
        const result = validator.checkText(range, text, scope);
        result.forEach((issue) => reportIssue(issue, node.type));
    }

    function calcScope(_node: ASTNode): string[] {
        // inheritance(node);
        return [];
    }

    function isImportIdentifier(node: ASTNode): boolean {
        const parent = node.parent;
        if (node.type !== 'Identifier' || !parent) return false;
        return (
            (parent.type === 'ImportSpecifier' ||
                parent.type === 'ImportNamespaceSpecifier' ||
                parent.type === 'ImportDefaultSpecifier') &&
            parent.local === node
        );
    }

    function isRawImportIdentifier(node: ASTNode): boolean {
        const parent = node.parent;
        if (node.type !== 'Identifier' || !parent) return false;
        return (
            (parent.type === 'ImportSpecifier' && parent.imported === node) ||
            (parent.type === 'ExportSpecifier' && parent.local === node)
        );
    }

    function isLocalImportIdentifierUnique(node: ASTNode): boolean {
        const parent = getImportParent(node);
        if (!parent) return true;
        const { imported, local } = parent;
        if (imported.name !== local.name) return true;
        return imported.range?.[0] !== local.range?.[0] && imported.range?.[1] !== local.range?.[1];
    }

    function getImportParent(node: ASTNode): ImportSpecifier | undefined {
        const parent = node.parent;
        return parent?.type === 'ImportSpecifier' ? parent : undefined;
    }

    function skipCheckForRawImportIdentifiers(node: ASTNode): boolean {
        if (options.ignoreImports) return false;
        const parent = getImportParent(node);
        return !!parent && parent.imported === node && !isLocalImportIdentifierUnique(node);
    }

    function isImportedProperty(node: ASTNode): boolean {
        const obj = findOriginObject(node);
        return !!obj && obj.type === 'Identifier' && importedIdentifiers.has(obj.name);
    }

    function isObjectProperty(node: ASTNode): boolean {
        return node.parent?.type === 'MemberExpression';
    }

    function reportIssue(issue: ValidationIssue, nodeType: NodeType): void {
        const word = issue.text;
        const start = issue.offset;
        const end = issue.offset + (issue.length || issue.text.length);
        const suggestions = normalizeSuggestions(issue.suggestionsEx, nodeType);
        const severity = issue.isFlagged ? 'Forbidden' : 'Unknown';
        issues.push({ word, start, end, nodeType, suggestions, severity });
    }

    type NodeTypes = Node['type'] | Comment['type'] | 'JSXText';

    type Handlers = {
        [K in NodeTypes]?: (n: ASTNode) => void;
    };

    const processors: Handlers = {
        Line: checkComment,
        Block: checkComment,
        Literal: checkLiteral,
        TemplateElement: checkTemplateElement,
        Identifier: checkIdentifier,
        JSXText: checkJSXText,
    };

    function checkNode(node: ASTNode) {
        processors[node.type]?.(node);
    }

    function mapNode(node: ASTNode | TSESTree.Node, index: number, nodes: ASTNode[]): string {
        const child = nodes[index + 1];
        if (node.type === 'ImportSpecifier') {
            const extra = node.imported === child ? '.imported' : node.local === child ? '.local' : '';
            return node.type + extra;
        }
        if (node.type === 'ImportDeclaration') {
            const extra = node.source === child ? '.source' : '';
            return node.type + extra;
        }
        if (node.type === 'ExportSpecifier') {
            const extra = node.exported === child ? '.exported' : node.local === child ? '.local' : '';
            return node.type + extra;
        }
        if (node.type === 'ExportNamedDeclaration') {
            const extra = node.source === child ? '.source' : '';
            return node.type + extra;
        }
        if (node.type === 'Property') {
            const extra = node.key === child ? 'key' : node.value === child ? 'value' : '';
            return [node.type, node.kind, extra].join('.');
        }
        if (node.type === 'MemberExpression') {
            const extra = node.property === child ? 'property' : node.object === child ? 'object' : '';
            return node.type + '.' + extra;
        }
        if (node.type === 'ArrowFunctionExpression') {
            const extra = node.body === child ? 'body' : 'param';
            return node.type + '.' + extra;
        }
        if (node.type === 'FunctionDeclaration') {
            const extra = node.id === child ? 'id' : node.body === child ? 'body' : 'params';
            return node.type + '.' + extra;
        }
        if (node.type === 'ClassDeclaration' || node.type === 'ClassExpression') {
            const extra = node.id === child ? 'id' : node.body === child ? 'body' : 'superClass';
            return node.type + '.' + extra;
        }
        if (node.type === 'CallExpression') {
            const extra = node.callee === child ? 'callee' : 'arguments';
            return node.type + '.' + extra;
        }
        if (node.type === 'Literal') {
            return tagLiteral(node);
        }
        if (node.type === 'Block') {
            return node.value[0] === '*' ? 'Comment.docBlock' : 'Comment.block';
        }
        if (node.type === 'Line') {
            return 'Comment.line';
        }
        return node.type;
    }

    function inheritance(node: ASTNode) {
        const a = [...parents(node), node];
        return a.map(mapNode);
    }

    function* parents(node: ASTNode | undefined): Iterable<ASTNode> {
        while (node && node.parent) {
            yield node.parent;
            node = node.parent;
        }
    }

    function inheritanceSummary(node: ASTNode) {
        return inheritance(node).join(' ');
    }

    /**
     * find the origin of a member expression
     */
    function findOriginObject(node: ASTNode): ASTNode | undefined {
        const parent = node.parent;
        if (parent?.type !== 'MemberExpression' || parent.property !== node) return undefined;
        let obj = parent.object;
        while (obj.type === 'MemberExpression') {
            obj = obj.object;
        }
        return obj;
    }

    function isFunctionCall(node: ASTNode | undefined, name: string): boolean {
        return node?.type === 'CallExpression' && node.callee.type === 'Identifier' && node.callee.name === name;
    }

    function isRequireCall(node: ASTNode | undefined) {
        return isFunctionCall(node, 'require');
    }

    function isImportOrRequired(node: ASTNode) {
        return isRequireCall(node.parent) || (node.parent?.type === 'ImportDeclaration' && node.parent.source === node);
    }

    function debugNode(node: ASTNode, value: unknown) {
        if (!isDebugModeExtended) return;
        const val = format('%o', value);
        log(`${inheritanceSummary(node)}: ${val}`);
    }

    walkTree(root, checkNode);

    return { issues, errors };
}

function tagLiteral(node: ASTNode | TSESTree.Node): string {
    assert(node.type === 'Literal');
    const kind = typeof node.value;
    const extra =
        kind === 'string'
            ? node.raw?.[0] === '"'
                ? 'string.double'
                : 'string.single'
            : node.value === null
            ? 'null'
            : kind;
    return node.type + '.' + extra;
}

interface CachedDoc {
    filename: string;
    doc: TextDocument;
}

const cache: { lastDoc: CachedDoc | undefined } = { lastDoc: undefined };

const docValCache = new WeakMap<TextDocument, DocumentValidator>();

function getDocValidator(filename: string, text: string, options: WorkerOptions): DocumentValidator {
    const doc = getTextDocument(filename, text);
    const settings = calcInitialSettings(options);
    const cachedValidator = docValCache.get(doc);
    if (cachedValidator && deepEqual(cachedValidator.settings, settings)) {
        refreshDictionaryCache(0);
        cachedValidator.updateDocumentText(text);
        return cachedValidator;
    }

    const validator = new DocumentValidator(doc, options, settings);
    docValCache.set(doc, validator);
    return validator;
}

function calcInitialSettings(options: WorkerOptions): CSpellSettings {
    const { customWordListFile, cspell, cwd } = options;

    const settings: CSpellSettings = {
        ...defaultSettings,
        ...cspell,
        words: cspell?.words || [],
        ignoreWords: cspell?.ignoreWords || [],
        flagWords: cspell?.flagWords || [],
    };

    if (customWordListFile) {
        const filePath = isCustomWordListFile(customWordListFile) ? customWordListFile.path : customWordListFile;
        const { dictionaries = [], dictionaryDefinitions = [] } = settings;

        dictionaries.push('eslint-plugin-custom-words');
        dictionaryDefinitions.push({ name: 'eslint-plugin-custom-words', path: filePath });

        settings.dictionaries = dictionaries;
        settings.dictionaryDefinitions = dictionaryDefinitions;
    }

    resolveDictionaryPaths(settings.dictionaryDefinitions, cwd);

    return settings;
}

const regexIsUrl = /^(https?|file|ftp):/i;

/** Patches the path of dictionary definitions. */
function resolveDictionaryPaths(defs: CSpellSettings['dictionaryDefinitions'], cwd: string) {
    if (!defs) return;

    for (const def of defs) {
        if (!def.path) continue;
        if (regexIsUrl.test(def.path)) continue;
        def.path = path.resolve(cwd, def.path);
    }
}

function getTextDocument(filename: string, content: string): TextDocument {
    if (cache.lastDoc?.filename === filename) {
        return cache.lastDoc.doc;
    }

    const doc = createTextDocument({ uri: filename, content });
    cache.lastDoc = { filename, doc };
    return doc;
}

function isCustomWordListFile(value: string | CustomWordListFile | undefined): value is CustomWordListFile {
    return !!value && typeof value === 'object';
}

const needToAdjustSpace: Partial<Record<NodeType, true | undefined>> = {
    Identifier: true,
};

const isSpecial = /[^\p{L}_0-9]/u;
const allSpecial = /[^\p{L}_0-9]/gu;

function normalizeSuggestions(suggestions: Suggestions, nodeType: NodeType): Suggestions {
    if (!suggestions) return undefined;

    if (!(nodeType in needToAdjustSpace)) return suggestions;

    return suggestions.map((sug) => {
        if (!isSpecial.test(sug.word)) return sug;
        const s = { ...sug };
        s.word = s.word.replace(allSpecial, '_');
        if (s.wordAdjustedToMatchCase) {
            s.wordAdjustedToMatchCase = s.wordAdjustedToMatchCase.replace(allSpecial, '_');
        }
        return s;
    });
}

/**
 * Deep Equal check.
 * Note: There are faster methods, but this is called once per file, so speed is not a concern.
 */
function deepEqual(a: unknown, b: unknown): boolean {
    try {
        assert.deepStrictEqual(a, b);
        return true;
    } catch (e) {
        return false;
    }
}

async function reportConfigurationErrors(config: CSpellSettings, knownConfigErrors: Set<string>): Promise<Error[]> {
    const errors: Error[] = [];

    const importErrors = extractImportErrors(config);
    let count = 0;
    importErrors.forEach((ref) => {
        const key = ref.error.toString();
        if (knownConfigErrors.has(key)) return;
        knownConfigErrors.add(key);
        count += 1;
        errors.push(Error('Configuration Error: \n  ' + ref.error.message));
    });

    const dictCollection = await getDictionary(config);
    dictCollection.dictionaries.forEach((dict) => {
        const dictErrors = dict.getErrors?.() || [];
        const msg = `Dictionary Error with (${dict.name})`;
        dictErrors.forEach((error) => {
            const key = msg + error.toString();
            if (knownConfigErrors.has(key)) return;
            knownConfigErrors.add(key);
            count += 1;
            const errMsg = `${msg}: ${error.message}\n  Source: ${dict.source}`;
            errors.push(Error(errMsg));
        });
    });

    return errors;
}
