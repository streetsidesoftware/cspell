/**
 * The data for this file was constructed from:
 * ```
 * cd ~/projects/clones/vscode/extensions
 * find . -type f -iname package.json -exec pcregrep -M '(?:"id":.*)|(?:"extensions":[^\]]+)' {} \; > ~/projects/cspell/src/languageIds.txt`
 * ```
 */

// cspell:ignore cljs cljx cson iname pcregrep fsscript gradle shtml xhtml mdoc aspx jshtm gitconfig bowerrc
// cspell:ignore jshintrc jscsrc eslintrc babelrc webmanifest mdown markdn psgi phtml pssc psrc gypi rhistory
// cspell:ignore rprofile cshtml gemspec cginc ebuild zshrc zprofile zlogin zlogout zshenv dsql ascx axml
// cspell:ignore bpmn csproj dita ditamap dtml fsproj fxml isml mxml adoc
// cspell:ignore purescript purs dhall

export interface LanguageExtensionDefinition {
    id: string;
    /** List of extensions starting with '.' */
    extensions: string[];
    /** Filenames that do not have an extension or have a different type than their implied extension */
    filenames?: string[];
}
export type LanguageDefinition = LanguageExtensionDefinition;
export type LanguageDefinitions = LanguageDefinition[];
export type ExtensionToLanguageIdMapSet = Map<string, Set<string>>;
export type ExtensionToLanguageIdMap = Map<string, string[]>;

export const languageExtensionDefinitions: LanguageDefinitions = [
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
    { id: 'dhall', extensions: ['.dhall'] },
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
    { id: 'jsonc', extensions: ['.jsonc'] },
    { id: 'jsonc', extensions: [], filenames: ['.code-workspace'] },
    { id: 'jungle', extensions: ['.jungle'] },
    { id: 'less', extensions: ['.less'] },
    { id: 'literate haskell', extensions: ['.lhs'] },
    { id: 'lua', extensions: ['.lua'] },
    { id: 'makefile', extensions: ['.mk'] },
    { id: 'markdown', extensions: ['.md', '.mdown', '.markdown', '.markdn'] },
    { id: 'mdx', extensions: ['.mdx'] },
    { id: 'monkeyc', extensions: ['.mc', '.mb'] },
    { id: 'objective-c', extensions: ['.m'] },
    { id: 'perl', extensions: ['.pl', '.pm', '.pod', '.t', '.PL', '.psgi'] },
    { id: 'perl6', extensions: ['.p6', '.pl6', '.pm6', '.nqp'] },
    { id: 'php', extensions: ['.php', '.php4', '.php5', '.phtml', '.ctp'] },
    { id: 'plaintext', extensions: ['.txt'] },
    { id: 'powershell', extensions: ['.ps1', '.psm1', '.psd1', '.pssc', '.psrc'] },
    { id: 'purescript', extensions: ['.purs'] },
    { id: 'python', extensions: ['.py', '.rpy', '.pyw', '.cpy', '.gyp', '.gypi'] },
    { id: 'r', extensions: ['.r', '.R', '.rhistory', '.rprofile', '.rt'] },
    { id: 'razor', extensions: ['.cshtml'] },
    { id: 'ruby', extensions: ['.rb', '.rbx', '.rjs', '.gemspec', '.rake', '.ru'] },
    { id: 'ruby', extensions: [], filenames: ['Gemfile'] },
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
    { id: 'typescript', extensions: ['.ts', '.cts', '.mts'] },
    { id: 'typescriptreact', extensions: ['.tsx'] },
    { id: 'vb', extensions: ['.vb', '.brs', '.vbs', '.bas'] },
    { id: 'vue', extensions: ['.vue'] },
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
    { id: 'rsa', extensions: ['.pub'], filenames: ['id_rsa', 'id_rsa.pub'] },
    { id: 'pem', extensions: ['.private-key.pem', '.pem'] },
    { id: 'pem-private-key', extensions: ['.private-key.pem'] },

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
        id: 'lock',
        extensions: ['.lock'],
        filenames: ['package-lock.json'],
    },
    {
        id: 'cache_files',
        extensions: [],
        // cspell:ignore eslintcache
        filenames: ['.cspellcache', '.DS_Store', '.eslintcache'],
    },
];

export type LanguageId = string;

export const binaryLanguages = new Set(['binary', 'image', 'video', 'fonts']);

export const generatedFiles = new Set([...binaryLanguages, 'map', 'lock', 'pdf', 'cache_files', 'rsa', 'pem']);

export const languageIds: LanguageId[] = languageExtensionDefinitions.map(({ id }) => id);

const mapExtensionToSetOfLanguageIds: ExtensionToLanguageIdMapSet =
    buildLanguageExtensionMapSet(languageExtensionDefinitions);
const mapExtensionToLanguageIds: ExtensionToLanguageIdMap =
    buildExtensionToLanguageIdMap(mapExtensionToSetOfLanguageIds);

export function isBinaryExt(ext: string): boolean {
    return isBinary(getLanguagesForExt(ext));
}

export function isBinaryFile(basename: string): boolean {
    return isBinary(getLanguagesForBasename(basename));
}

export function isBinary(languageId: LanguageId | LanguageId[] | Iterable<LanguageId>): boolean {
    return doesSetContainAnyOf(binaryLanguages, languageId);
}

export function isGeneratedExt(ext: string): boolean {
    return isGenerated(getLanguagesForExt(ext));
}

export function isGeneratedFile(basename: string): boolean {
    return isGenerated(getLanguagesForBasename(basename));
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

export function buildLanguageExtensionMapSet(defs: LanguageDefinitions): ExtensionToLanguageIdMapSet {
    return defs.reduce((map, def) => {
        function getMapSet(value: string) {
            const found = map.get(value);
            if (found) return found;
            const s = new Set<string>();
            map.set(value, s);
            return s;
        }
        function addId(value: string) {
            getMapSet(value).add(def.id);
        }

        def.extensions.forEach(addId);
        def.filenames?.forEach(addId);
        return map;
    }, new Map<string, Set<string>>());
}

function buildExtensionToLanguageIdMap(map: ExtensionToLanguageIdMapSet): ExtensionToLanguageIdMap {
    return new Map([...map].map(([k, s]) => [k, [...s]]));
}

export function getLanguagesForExt(ext: string): string[] {
    return mapExtensionToLanguageIds.get(ext) || mapExtensionToLanguageIds.get('.' + ext) || [];
}

export function getLanguagesForBasename(basename: string): string[] {
    const found = mapExtensionToLanguageIds.get(basename);
    if (found) return found;

    for (let pos = basename.indexOf('.'); pos >= 0; pos = basename.indexOf('.', pos + 1)) {
        const ids = mapExtensionToLanguageIds.get(basename.slice(pos));
        if (ids) return ids;
    }

    return [];
}
