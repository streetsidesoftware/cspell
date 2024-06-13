// cspell:ignore TSESTree
import assert from 'node:assert';
import * as path from 'node:path';

import type { TSESTree } from '@typescript-eslint/types';
import type { CSpellSettings, TextDocument, ValidationIssue } from 'cspell-lib';
import {
    createTextDocument,
    DocumentValidator,
    extractImportErrors,
    getDictionary,
    refreshDictionaryCache,
} from 'cspell-lib';
import type { Comment, Identifier, ImportSpecifier, Literal, Node, TemplateElement } from 'estree';

import { getDefaultLogger } from '../common/logger.cjs';
import type { CustomWordListFile, ScopeSelectorList, WorkerOptions } from '../common/options.cjs';
import type { ASTNode, JSXText, NodeType } from './ASTNode.cjs';
import type { ASTPath, Key } from './ASTPath.mjs';
import { defaultCheckedScopes } from './customScopes.mjs';
import type { ScopeItem } from './scope.mjs';
import { AstPathScope, AstScopeMatcher, astScopeToString, mapNodeToScope, scopeItem } from './scope.mjs';
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
const forceLogging = false;

const knownConfigErrors = new Set<string>();

export async function spellCheck(
    filename: string,
    text: string,
    root: Node,
    options: WorkerOptions,
): Promise<SpellCheckResults> {
    const logger = getDefaultLogger();
    const debugMode = forceLogging || options.debugMode || false;
    logger.enabled = forceLogging || (options.debugMode ?? (logger.enabled || isDebugModeExtended));
    const log = logger.log;

    const mapScopes = groupScopes([...defaultCheckedScopes, ...(options.checkScope || [])]);

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

    function checkLiteral(path: ASTPath) {
        const node: Literal | ASTNode = path.node;
        if (node.type !== 'Literal') return;
        if (!options.checkStrings) return;
        if (typeof node.value === 'string') {
            debugNode(path, node.value);
            if (options.ignoreImports && isImportOrRequired(node)) return;
            if (options.ignoreImportProperties && isImportedProperty(node)) return;
            checkNodeText(path, node.value);
        }
    }

    function checkJSXText(path: ASTPath) {
        const node: JSXText | ASTNode = path.node;
        if (node.type !== 'JSXText') return;
        if (!options.checkJSXText) return;
        if (typeof node.value === 'string') {
            debugNode(path, node.value);
            checkNodeText(path, node.value);
        }
    }

    function checkTemplateElement(path: ASTPath) {
        const node: TemplateElement | ASTNode = path.node;
        if (node.type !== 'TemplateElement') return;
        if (!options.checkStringTemplates) return;
        debugNode(path, node.value);
        checkNodeText(path, node.value.cooked || node.value.raw);
    }

    function checkIdentifier(path: ASTPath) {
        const node: Identifier | ASTNode = path.node;
        if (node.type !== 'Identifier') return;
        debugNode(path, node.name);
        if (options.ignoreImports) {
            if (isRawImportIdentifier(node)) {
                toIgnore.add(node.name);
                return;
            }
            if (isImportIdentifier(node)) {
                importedIdentifiers.add(node.name);
                if (isLocalImportIdentifierUnique(node)) {
                    checkNodeText(path, node.name);
                }
                return;
            } else if (options.ignoreImportProperties && isImportedProperty(node)) {
                return;
            }
        }
        if (!options.checkIdentifiers) return;
        if (toIgnore.has(node.name) && !isObjectProperty(node)) return;
        if (skipCheckForRawImportIdentifiers(node)) return;
        checkNodeText(path, node.name);
    }

    function checkComment(path: ASTPath) {
        const node: Comment | ASTNode = path.node;
        if (node.type !== 'Line' && node.type !== 'Block') return;
        if (!options.checkComments) return;
        debugNode(path, node.value);
        checkNodeText(path, node.value);
    }

    function checkNodeText(path: ASTPath, text: string) {
        const node: ASTNode = path.node;
        if (!node.range) return;

        const adj = node.type === 'Literal' ? 1 : 0;
        const range = [node.range[0] + adj, node.range[1] - adj] as const;

        const scope: string[] = calcScope(path);
        const result = validator.checkText(range, text, scope);
        result.forEach((issue) => reportIssue(issue, node.type));
    }

    function calcScope(_path: ASTPath): string[] {
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
        [K in NodeTypes]?: (p: ASTPath) => void;
    };

    const processors: Handlers = {
        Line: checkComment,
        Block: checkComment,
        Literal: checkLiteral,
        TemplateElement: checkTemplateElement,
        Identifier: checkIdentifier,
        JSXText: checkJSXText,
    };

    function needToCheckFields(path: ASTPath): Record<string, boolean> | undefined {
        const possibleScopes = mapScopes.get(path.node.type);
        if (!possibleScopes) {
            _dumpNode(path);
            return undefined;
        }

        const scopePath = new AstPathScope(path);

        const scores = possibleScopes
            .map(({ scope, check }) => ({ score: scopePath.score(scope), check, scope }))
            .filter((s) => s.score > 0);
        const maxScore = Math.max(0, ...scores.map((s) => s.score));
        const topScopes = scores.filter((s) => s.score === maxScore);
        if (!topScopes.length) return undefined;
        return Object.fromEntries(topScopes.map((s) => [s.scope.scopeField(), s.check]));
    }

    function defaultHandler(path: ASTPath) {
        const fields = needToCheckFields(path);
        if (!fields) return;
        for (const [field, check] of Object.entries(fields)) {
            if (!check) continue;
            const node = path.node as object as Record<string, unknown>;
            const value = node[field];
            if (typeof value !== 'string') continue;
            debugNode(path, value);
            checkNodeText(path, value);
        }
    }

    function checkNode(path: ASTPath) {
        // _dumpNode(path);
        const handler = processors[path.node.type] ?? defaultHandler;
        handler(path);
    }

    function _dumpNode(path: ASTPath) {
        function value(v: unknown) {
            if (['string', 'number', 'boolean'].includes(typeof v)) return v;
            if (v && typeof v === 'object' && 'type' in v) return `{ type: ${v.type} }`;
            return `<${v}>`;
        }

        function dotValue(v: { [key: string]: unknown } | unknown) {
            if (typeof v === 'object' && v) {
                return Object.fromEntries(Object.entries(v).map(([k, v]) => [k, value(v)]));
            }
            return `<${typeof v}>`;
        }

        const { parent: _, ...n } = path.node;
        const warn = log;
        warn('Node: %o', {
            key: path.key,
            type: n.type,
            path: inheritanceSummary(path),
            node: dotValue(n),
        });
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
        if (!node) return false;
        return node.type === 'CallExpression' && node.callee.type === 'Identifier' && node.callee.name === name;
    }

    function isRequireCall(node: ASTNode | undefined) {
        return isFunctionCall(node, 'require');
    }

    function isImportOrRequired(node: ASTNode) {
        return isRequireCall(node.parent) || (node.parent?.type === 'ImportDeclaration' && node.parent.source === node);
    }

    function debugNode(path: ASTPath, value: unknown) {
        log(`${inheritanceSummary(path)}: %o`, value);
        debugMode && _dumpNode(path);
    }

    // console.warn('root: %o', root);

    walkTree(root, checkNode);

    return { issues, errors };
}

function mapNode(path: ASTPath, key: Key | undefined): ScopeItem {
    const node = path.node;
    if (node.type === 'Literal') {
        return scopeItem(tagLiteral(node));
    }
    if (node.type === 'Block') {
        const value = typeof node.value === 'string' ? node.value : '';
        return scopeItem(value[0] === '*' ? 'Comment.docBlock' : 'Comment.block');
    }
    if (node.type === 'Line') {
        return scopeItem('Comment.line');
    }
    return mapNodeToScope(path, key);
}

function inheritanceSummary(path: ASTPath) {
    return astScopeToString(path, ' ', mapNode);
}

function tagLiteral(node: ASTNode | TSESTree.Node): string {
    assert(node.type === 'Literal');
    const kind = typeof node.value;
    const extra =
        kind === 'string'
            ? asStr(node.raw)?.[0] === '"'
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
        cachedValidator.updateDocumentText(text).catch(() => undefined);
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

    if (options.configFile) {
        const optionCspellImport = options.cspell?.import;
        const importConfig =
            typeof optionCspellImport === 'string'
                ? [optionCspellImport]
                : Array.isArray(optionCspellImport)
                  ? optionCspellImport
                  : [];
        importConfig.push(options.configFile);
        settings.import = importConfig;
    }

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
        s.word = s.word.replaceAll(allSpecial, '_');
        if (s.wordAdjustedToMatchCase) {
            s.wordAdjustedToMatchCase = s.wordAdjustedToMatchCase.replaceAll(allSpecial, '_');
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
    } catch {
        return false;
    }
}

async function reportConfigurationErrors(config: CSpellSettings, knownConfigErrors: Set<string>): Promise<Error[]> {
    const errors: Error[] = [];

    const importErrors = extractImportErrors(config);
    importErrors.forEach((ref) => {
        const key = ref.error.toString();
        if (knownConfigErrors.has(key)) return;
        knownConfigErrors.add(key);
        errors.push(new Error('Configuration Error: \n  ' + ref.error.message));
    });

    const dictCollection = await getDictionary(config);
    dictCollection.dictionaries.forEach((dict) => {
        const dictErrors = dict.getErrors?.() || [];
        const msg = `Dictionary Error with (${dict.name})`;
        dictErrors.forEach((error) => {
            const key = msg + error.toString();
            if (knownConfigErrors.has(key)) return;
            knownConfigErrors.add(key);
            const errMsg = `${msg}: ${error.message}\n  Source: ${dict.source}`;
            errors.push(new Error(errMsg));
        });
    });

    return errors;
}

interface ScopeCheck {
    scope: AstScopeMatcher;
    check: boolean;
}

function groupScopes(scopes: ScopeSelectorList): Map<string, ScopeCheck[]> {
    const objScopes = Object.fromEntries(scopes);
    const map = new Map<string, ScopeCheck[]>();
    for (const [selector, check] of Object.entries(objScopes)) {
        const scope = AstScopeMatcher.fromScopeSelector(selector);
        const key = scope.scopeType();
        const list = map.get(key) || [];
        list.push({ scope, check });
        map.set(key, list);
    }
    return map;
}

function asStr(v: string | unknown): string | undefined {
    return typeof v === 'string' ? v : undefined;
}
