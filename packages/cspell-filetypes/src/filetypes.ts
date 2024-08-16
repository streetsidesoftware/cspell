// cspell:ignore cljs cljx cson iname pcregrep fsscript fasl gradle shtml xhtml mdoc aspx jshtm gitconfig bowerrc
// cspell:ignore jshintrc jscsrc eslintrc babelrc webmanifest mdown markdn psgi phtml pssc psrc gypi rhistory
// cspell:ignore rprofile cshtml gemspec cginc ebuild zshrc zprofile zlogin zlogout zshenv dsql ascx axml
// cspell:ignore bpmn csproj dita ditamap dtml fsproj fxml isml mxml adoc
// cspell:ignore purescript purs dhall SPSS tfvars

export interface FileTypeExtensionDefinition {
    id: string;
    /** List of extensions starting with '.' */
    extensions: string[];
    /** Filenames that do not have an extension or have a different type than their implied extension */
    filenames?: string[];
    /** Indicates that it is a Text or Binary file type. */
    format?: 'Text' | 'Binary';
    /** Optional Description */
    description?: string;
}
export type FileTypeDefinition = FileTypeExtensionDefinition;
export type FileTypeDefinitions = FileTypeDefinition[];
export type ExtensionToFileTypeIdMapSet = Map<string, Set<string>>;
export type ExtensionToFileTypeIdMap = Map<string, string[]>;

export const languageExtensionDefinitions: FileTypeDefinitions = [
    { id: 'ada', extensions: ['.adb', '.ads'] },
    { id: 'apiblueprint', extensions: ['.apib', '.apiblueprint'] },
    { id: 'asciidoc', extensions: ['.adoc', '.asc', '.asciidoc'] },
    { id: 'bat', extensions: ['.bat', '.cmd'] },
    { id: 'clojure', extensions: ['.clj', '.cljs', '.cljx', '.clojure', '.edn'] },
    { id: 'coffeescript', extensions: ['.coffee', '.cson'] },
    { id: 'c', extensions: ['.c'] },
    // cspell:ignore cmake
    { id: 'cmake', extensions: ['.cmake'], filenames: ['CMakeLists.txt'] },
    {
        id: 'cpp',
        extensions: ['.cpp', '.cc', '.cxx', '.hpp', '.hh', '.hxx', '.h', '.mm', '.ino', '.inl'],
    },
    { id: 'csharp', extensions: ['.cs'] },
    { id: 'css', extensions: ['.css'] },
    { id: 'dhall', extensions: ['.dhall'] },
    { id: 'diff', extensions: ['.diff', '.patch', '.rej'] },
    { id: 'dockerfile', extensions: ['.dockerfile'], filenames: ['Dockerfile', 'dockerfile', 'Dockerfile.dev'] },
    { id: 'elisp', extensions: ['.el'] },
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
    { id: 'ini', extensions: ['.ini', '.conf'] },
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
    { id: 'jsonc', extensions: ['.code-workspace'], filenames: ['.code-workspace'] },
    { id: 'julia', extensions: ['.jl'] },
    { id: 'jungle', extensions: ['.jungle'] },
    { id: 'less', extensions: ['.less'] },
    { id: 'lisp', extensions: ['.lisp', '.lsp', '.l', '.fasl'] },
    { id: 'literate haskell', extensions: ['.lhs'] },
    { id: 'lua', extensions: ['.lua'] },
    { id: 'makefile', extensions: ['.mk'], filenames: ['makefile'] },
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
    { id: 'scala', extensions: ['.scala', '.sc', '.sbt'] },
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
    { id: 'svelte', extensions: ['.svelte'] },
    { id: 'swift', extensions: ['.swift'] },
    { id: 'toml', extensions: ['.toml'] },
    { id: 'terraform', extensions: ['.tf', '.tf.json'] },
    { id: 'tfvars', extensions: ['.tfvars'], description: 'Terraform Variables' },
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
    { id: 'wheel', extensions: ['.whl'], format: 'Binary' },
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
    {
        id: 'image',
        extensions: [
            '.bmp',
            '.exr',
            '.gif',
            '.heic',
            '.ico',
            '.jpeg',
            '.jpg',
            '.pbm',
            '.pgm',
            '.png',
            '.ppm',
            '.ras',
            '.sgi',
            '.tiff',
            '.webp',
            '.xbm',
        ],
        format: 'Binary',
        description: 'Some image extensions',
    },
    // cspell:ignore woff
    {
        id: 'binary',
        extensions: ['.bin', '.gz', '.exe', '.dll', '.lib', '.obj', '.o', '.eot', '.cur', '.zip'],
        format: 'Binary',
    },
    {
        id: 'gzip',
        extensions: ['.gz'],
        format: 'Binary',
    },
    {
        id: 'fonts',
        extensions: ['.ttf', '.woff', '.woff2'],
        format: 'Binary',
    },
    {
        id: 'video',
        extensions: ['.mov', '.mpg', '.mpeg', '.mp4', '.avi', '.wmv', '.mkv', '.flv'],
        format: 'Binary',
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
    { id: 'dll', extensions: ['.dll'], format: 'Binary' },
    { id: 'exe', extensions: ['.exe'], format: 'Binary' },
    { id: 'object-file', extensions: ['.o', '.obj'], format: 'Binary' },
    { id: 'jar', extensions: ['.jar'], format: 'Binary' },
    { id: 'spv', extensions: ['.spv'], format: 'Binary', description: 'SPSS Output Document' },
    { id: 'mdb', extensions: ['.mdb'], format: 'Binary', description: 'Microsoft Access DB' },
    { id: 'webm', extensions: ['.webm'], format: 'Binary', description: 'WebM is an audiovisual media file format.' },
    { id: 'trie', extensions: ['.trie'], format: 'Binary', description: 'CSpell dictionary file.' },
];

export type FileTypeId = string;

const binaryFormatIds = languageExtensionDefinitions.filter((d) => d.format === 'Binary').map((d) => d.id);
export const binaryLanguages = new Set(['binary', 'image', 'video', 'fonts', ...binaryFormatIds]);

export const generatedFiles = new Set([...binaryLanguages, 'map', 'lock', 'pdf', 'cache_files', 'rsa', 'pem', 'trie']);

export const languageIds: FileTypeId[] = languageExtensionDefinitions.map(({ id }) => id);

const mapExtensionToSetOfLanguageIds: ExtensionToFileTypeIdMapSet =
    buildLanguageExtensionMapSet(languageExtensionDefinitions);
const mapExtensionToLanguageIds: ExtensionToFileTypeIdMap =
    buildExtensionToLanguageIdMap(mapExtensionToSetOfLanguageIds);

/**
 * Checks to see if a file type is considered to be a binary file type.
 * @param ext - the file extension to check
 * @returns true if the file type is known to be binary.
 */
export function isBinaryExt(ext: string): boolean {
    return isBinaryFileType(getFileTypesForExt(ext));
}

/**
 * Checks to see if a file type is considered to be a binary file type.
 * @param filename - the filename to check
 * @returns true if the file type is known to be binary.
 */
export function isBinaryFile(filename: string): boolean {
    return isBinaryFileType(findMatchingFileTypes(filename));
}

/**
 * Checks to see if a file type is considered to be a binary file type.
 * @param fileTypeId - the file type id to check
 * @returns true if the file type is known to be binary.
 */
export function isBinaryFileType(fileTypeId: FileTypeId | FileTypeId[] | Iterable<FileTypeId>): boolean {
    return doesSetContainAnyOf(binaryLanguages, fileTypeId);
}

/**
 * Check if a file extension is associated with generated file.. Generated files are files that are not typically edited by a human.
 * Example:
 * - package-lock.json
 * @param ext - the file extension to check.
 * @returns true if the file type known to be generated.
 */
export function isGeneratedExt(ext: string): boolean {
    return isFileTypeGenerated(getFileTypesForExt(ext));
}

/**
 * Check if a file is auto generated. Generated files are files that are not typically edited by a human.
 * Example:
 * - package-lock.json
 * @param filename - the full filename to check
 * @returns true if the file type known to be generated.
 */
export function isGeneratedFile(filename: string): boolean {
    return isFileTypeGenerated(findMatchingFileTypes(filename));
}

/**
 * Check if a file type is auto generated. Generated files are files that are not typically edited by a human.
 * Example:
 * - package-lock.json
 * @param fileTypeId - the file type id to check
 * @returns true if the file type known to be generated.
 */
export function isFileTypeGenerated(fileTypeId: FileTypeId | FileTypeId[] | Iterable<FileTypeId>): boolean {
    return doesSetContainAnyOf(generatedFiles, fileTypeId);
}

function doesSetContainAnyOf(
    setOfIds: Set<FileTypeId>,
    fileTypeId: FileTypeId | FileTypeId[] | Iterable<FileTypeId>,
): boolean {
    if (typeof fileTypeId === 'string') {
        return setOfIds.has(fileTypeId);
    }
    for (const id of fileTypeId) {
        if (setOfIds.has(id)) {
            return true;
        }
    }
    return false;
}

function buildLanguageExtensionMapSet(defs: FileTypeDefinitions): ExtensionToFileTypeIdMapSet {
    return defs.reduce((map, def) => {
        function addId(value: string) {
            autoResolve(map, value, () => new Set<string>()).add(def.id);
        }

        def.extensions.forEach(addId);
        def.filenames?.forEach(addId);
        return map;
    }, new Map<string, Set<string>>());
}

function buildExtensionToLanguageIdMap(map: ExtensionToFileTypeIdMapSet): ExtensionToFileTypeIdMap {
    return new Map([...map].map(([k, s]) => [k, [...s]]));
}

function _getLanguagesForExt(ext: string): string[] | undefined {
    return mapExtensionToLanguageIds.get(ext) || mapExtensionToLanguageIds.get('.' + ext);
}

/**
 * Tries to find a matching language for a given file extension.
 * @param ext - the file extension to look up.
 * @returns an array of language ids that match the extension. The array is empty if no matches are found.
 */
export function getFileTypesForExt(ext: string): FileTypeId[] {
    return _getLanguagesForExt(ext) || _getLanguagesForExt(ext.toLowerCase()) || [];
}

function _getLanguagesForBasename(basename: string): string[] | undefined {
    const found = mapExtensionToLanguageIds.get(basename);
    if (found) return found;

    for (let pos = basename.indexOf('.'); pos >= 0; pos = basename.indexOf('.', pos + 1)) {
        const ids = mapExtensionToLanguageIds.get(basename.slice(pos));
        if (ids) return ids;
    }

    return undefined;
}

/**
 * Find the matching file types for a given filename.
 * @param filename - the full filename
 * @returns an array of language ids that match the filename. The array is empty if no matches are found.
 */
export function findMatchingFileTypes(filename: string): FileTypeId[] {
    return _getLanguagesForBasename(filename) || _getLanguagesForBasename(filename.toLowerCase()) || [];
}

export function autoResolve<K, V>(map: Map<K, V>, key: K, resolve: (k: K) => V): V {
    const found = map.get(key);
    if (found !== undefined || map.has(key)) return found as V;
    const value = resolve(key);
    map.set(key, value);
    return value;
}
