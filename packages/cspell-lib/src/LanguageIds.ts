/**
 * The data for this file was constructed from:
 * ```
 * cd ~/projects/clones/vscode/extensions
 * find . -type f -iname package.json -exec pcregrep -M '(?:"id":.*)|(?:"extensions":[^\]]+)' {} \; > ~/projects/cspell/src/languageIds.txt`
 * ```
 */

import { genSequence } from 'gensequence';

// cspell:ignore cljs cljx cson iname pcregrep fsscript gradle shtml xhtml mdoc aspx jshtm gitconfig bowerrc
// cspell:ignore jshintrc jscsrc eslintrc babelrc webmanifest mdown markdn psgi phtml pssc psrc gypi rhistory
// cspell:ignore rprofile cshtml gemspec cginc ebuild zshrc zprofile zlogin zlogout zshenv dsql ascx axml
// cspell:ignore bpmn csproj dita ditamap dtml fsproj fxml isml mxml adoc

export interface LanguageExtensionDefinition {
    id: string;
    extensions: string[];
}

export type LanguageExtensionDefinitions = LanguageExtensionDefinition[];
export type ExtensionToLanguageIdMap = Map<string, Set<string>>;

export const languageExtensionDefinitions: LanguageExtensionDefinitions = [
    { id: 'ada', extensions: ['.adb', '.ads'] },
    { id: 'apiblueprint', extensions: ['.apib', '.apiblueprint'] },
    { id: 'asciidoc', extensions: ['.adoc', '.asc', '.asciidoc'] },
    { id: 'bat', extensions: ['.bat', '.cmd'] },
    { id: 'clojure', extensions: ['.clj', '.cljs', '.cljx', '.clojure', '.edn'] },
    { id: 'coffeescript', extensions: ['.coffee', '.cson'] },
    { id: 'c', extensions: ['.c'] },
    {
        id: 'cpp',
        extensions: ['.cpp', '.cc', '.cxx', '.hpp', '.hh', '.hxx', '.h', '.mm', '.ino', '.inl'],
    },
    { id: 'csharp', extensions: ['.cs'] },
    { id: 'css', extensions: ['.css'] },
    { id: 'diff', extensions: ['.diff', '.patch', '.rej'] },
    { id: 'dockerfile', extensions: ['.dockerfile'] },
    { id: 'elixir', extensions: ['.ex', '.exs'] },
    { id: 'fsharp', extensions: ['.fs', '.fsi', '.fsx', '.fsscript'] },
    { id: 'go', extensions: ['.go'] },
    { id: 'groovy', extensions: ['.groovy', '.gvy', '.gradle'] },
    { id: 'handlebars', extensions: ['.handlebars', '.hbs'] },
    { id: 'haskell', extensions: ['.hs', '.lhs'] },
    {
        id: 'html',
        extensions: ['.html', '.htm', '.shtml', '.xhtml', '.mdoc', '.jsp', '.asp', '.aspx', '.jshtm', '.volt', '.vue'],
    },
    { id: 'ini', extensions: ['.ini'] },
    { id: 'properties', extensions: ['.properties', '.gitconfig', '.cfg', '.conf'] },
    { id: 'jade', extensions: ['.jade', '.pug'] },
    { id: 'java', extensions: ['.java', '.jav'] },
    { id: 'javascriptreact', extensions: ['.jsx'] },
    { id: 'javascript', extensions: ['.js', '.mjs', '.es6', '.cjs'] },
    {
        id: 'json',
        extensions: ['.json', '.jsonc', '.bowerrc', '.jshintrc', '.jscsrc', '.eslintrc', '.babelrc', '.webmanifest'],
    },
    { id: 'less', extensions: ['.less'] },
    { id: 'literate haskell', extensions: ['.lhs'] },
    { id: 'lock', extensions: ['.lock'] },
    { id: 'lua', extensions: ['.lua'] },
    { id: 'makefile', extensions: ['.mk'] },
    { id: 'markdown', extensions: ['.md', '.mdown', '.markdown', '.markdn'] },
    { id: 'mdx', extensions: ['.mdx'] },
    { id: 'objective-c', extensions: ['.m'] },
    { id: 'perl', extensions: ['.pl', '.pm', '.pod', '.t', '.PL', '.psgi'] },
    { id: 'perl6', extensions: ['.p6', '.pl6', '.pm6', '.nqp'] },
    { id: 'php', extensions: ['.php', '.php4', '.php5', '.phtml', '.ctp'] },
    { id: 'plaintext', extensions: ['.txt'] },
    { id: 'powershell', extensions: ['.ps1', '.psm1', '.psd1', '.pssc', '.psrc'] },
    { id: 'python', extensions: ['.py', '.rpy', '.pyw', '.cpy', '.gyp', '.gypi'] },
    { id: 'r', extensions: ['.r', '.rhistory', '.rprofile', '.rt'] },
    { id: 'razor', extensions: ['.cshtml'] },
    { id: 'ruby', extensions: ['.rb', '.rbx', '.rjs', '.gemspec', '.rake', '.ru'] },
    { id: 'rust', extensions: ['.rs'] },
    { id: 'scala', extensions: ['.scala', '.sc'] },
    { id: 'scss', extensions: ['.scss'] },
    { id: 'shaderlab', extensions: ['.shader', '.cginc'] },
    {
        id: 'shellscript',
        extensions: [
            '.sh',
            '.bash',
            '.bashrc',
            '.bash_aliases',
            '.bash_profile',
            '.bash_login',
            '.ebuild',
            '.install',
            '.profile',
            '.bash_logout',
            '.zsh',
            '.zshrc',
            '.zprofile',
            '.zlogin',
            '.zlogout',
            '.zshenv',
            '.zsh-theme',
        ],
    },
    { id: 'sql', extensions: ['.sql', '.dsql'] },
    { id: 'swift', extensions: ['.swift'] },
    { id: 'toml', extensions: ['.toml'] },
    { id: 'typescript', extensions: ['.ts'] },
    { id: 'typescriptreact', extensions: ['.tsx'] },
    { id: 'vb', extensions: ['.vb', '.brs', '.vbs', '.bas'] },
    {
        id: 'xml',
        extensions: [
            '.ascx',
            '.atom',
            '.axml',
            '.bpmn',
            '.config',
            '.cpt',
            '.csl',
            '.csproj.user',
            '.csproj',
            '.dita',
            '.ditamap',
            '.dtd',
            '.dtml',
            '.ent',
            '.fsproj',
            '.fxml',
            '.iml',
            '.isml',
            '.jmx',
            '.launch',
            '.menu',
            '.mod',
            '.mxml',
            '.nuspec',
            '.opml',
            '.owl',
            '.proj',
            '.pt',
            '.pubxml.user',
            '.pubxml',
            '.rdf',
            '.rng',
            '.rss',
            '.shproj',
            '.storyboard',
            '.svg',
            '.targets',
            '.tld',
            '.tmx',
            '.vbproj.user',
            '.vbproj',
            '.vcxproj.filters',
            '.vcxproj',
            '.wsdl',
            '.wxi',
            '.wxl',
            '.wxs',
            '.xaml',
            '.xbl',
            '.xib',
            '.xlf',
            '.xliff',
            '.xml',
            '.xoml',
            '.xpdl',
            '.xsd',
            '.xul',
        ],
    },
    { id: 'xsl', extensions: ['.xsl', '.xslt'] },
    { id: 'yaml', extensions: ['.eyaml', '.eyml', '.yaml', '.yml'] },
    { id: 'latex', extensions: ['.tex'] },
    { id: 'map', extensions: ['.map'] },
    { id: 'pdf', extensions: ['.pdf'] },

    //
    // Special file types used to prevent spell checking.
    //
    { id: 'image', extensions: ['.jpg', '.png', '.jpeg', '.tiff', '.bmp', '.gif', '.ico'] },
    // cspell:ignore woff
    {
        id: 'binary',
        extensions: ['.gz', '.exe', '.dll', '.lib', '.obj', '.o', '.eot', '.cur', '.zip'],
    },
    {
        id: 'fonts',
        extensions: ['.ttf', '.woff', '.woff2'],
    },
    {
        id: 'video',
        extensions: ['.mov', '.mpg'],
    },
    {
        id: 'cache_files',
        // cspell:ignore eslintcache
        extensions: ['.cspellcache', '.DS_Store', '.eslintcache'],
    },
];

export type LanguageId = string;

export const binaryLanguages = new Set(['binary', 'image', 'video', 'fonts']);

export const generatedFiles = new Set([...binaryLanguages, 'map', 'lock', 'pdf', 'cache_files']);

export const languageIds: LanguageId[] = languageExtensionDefinitions.map(({ id }) => id);

const mapExtensionToLanguageIds: ExtensionToLanguageIdMap = buildLanguageExtensionMap(languageExtensionDefinitions);

export function isBinaryExt(ext: string): boolean {
    return isBinary(getLanguagesForExt(ext));
}

export function isBinary(languageId: LanguageId | LanguageId[] | Iterable<LanguageId>): boolean {
    return doesSetContainAnyOf(binaryLanguages, languageId);
}

export function isGeneratedExt(ext: string): boolean {
    return isGenerated(getLanguagesForExt(ext));
}

export function isGenerated(languageId: LanguageId | LanguageId[] | Iterable<LanguageId>): boolean {
    return doesSetContainAnyOf(generatedFiles, languageId);
}

function doesSetContainAnyOf(
    setOfIds: Set<LanguageId>,
    languageId: LanguageId | LanguageId[] | Iterable<LanguageId>
): boolean {
    if (typeof languageId === 'string') {
        return setOfIds.has(languageId);
    }
    for (const id of languageId) {
        if (setOfIds.has(id)) {
            return true;
        }
    }
    return false;
}

export function buildLanguageExtensionMap(defs: LanguageExtensionDefinitions): ExtensionToLanguageIdMap {
    return defs.reduce((map, def) => {
        def.extensions.forEach((ext) => {
            map.set(ext, (map.get(ext) || new Set<string>()).add(def.id));
        });
        return map;
    }, new Map<string, Set<string>>());
}

export function getLanguagesForExt(ext: string): string[] {
    return genSequence([ext, '.' + ext])
        .map((ext) => mapExtensionToLanguageIds.get(ext))
        .filter((a) => !!a)
        .concatMap<string>((a) => a!) // eslint-disable-line @typescript-eslint/no-non-null-assertion
        .toArray();
}
