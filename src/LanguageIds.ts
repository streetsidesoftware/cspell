/**
 * The data for this file was constructed from:
 * ```
 * cd ~/projects/clones/vscode/extensions
 * find . -type f -iname package.json -exec pcregrep -M '(?:"id":.*)|(?:"extensions":[^\]]+)' {} \; > ~/projects/cspell/src/languageIds.txt`
 * ```
 */

import {genSequence} from 'gensequence';

// cspell:ignore cljs cljx cson iname pcregrep fsscript gradle shtml xhtml mdoc aspx jshtm gitconfig bowerrc
// cspell:ignore jshintrc jscsrc eslintrc babelrc webmanifest mdown markdn psgi phtml pssc psrc gypi rhistory
// cspell:ignore rprofile cshtml gemspec cginc ebuild zshrc zprofile zlogin zlogout zshenv dsql ascx axml
// cspell:ignore bpmn csproj dita ditamap dtml fsproj fxml isml mxml

export interface LanguageExtensionDefinition {
    id: string;
    extensions: string[];
}

export type LanguageExtensionDefinitions = LanguageExtensionDefinition[];
export type ExtensionToLanguageIdMap = Map<string, Set<string>>;

export const languageExtensionDefinitions: LanguageExtensionDefinitions = [
    { id: 'bat', extensions: ['.bat', '.cmd'], },
    { id: 'clojure', extensions: ['.clj', '.cljs', '.cljx', '.clojure', '.edn'], },
    { id: 'coffeescript', extensions: ['.coffee', '.cson'], },
    { id: 'c',	extensions: ['.c'], },
    { id: 'cpp', extensions: ['.cpp', '.cc', '.cxx', '.hpp', '.hh', '.hxx', '.h', '.mm', '.ino', '.inl'], },
    { id: 'csharp',	extensions: ['.cs'], },
    { id: 'css', extensions: ['.css'], },
    { id: 'diff', extensions: ['.diff', '.patch', '.rej'], },
    { id: 'dockerfile', extensions: ['.dockerfile'], },
    { id: 'fsharp', extensions: ['.fs', '.fsi', '.fsx', '.fsscript'], },
    { id: 'go', extensions: ['.go'], },
    { id: 'groovy', extensions: ['.groovy', '.gvy', '.gradle'], },
    { id: 'handlebars', extensions: ['.handlebars', '.hbs'], },
    { id: 'html', extensions: [
            '.html',
            '.htm',
            '.shtml',
            '.xhtml',
            '.mdoc',
            '.jsp',
            '.asp',
            '.aspx',
            '.jshtm',
            '.volt',
            '.vue'
        ],
    },
    { id: 'ini', extensions: ['.ini'], },
    { id: 'properties', extensions: ['.properties', '.gitconfig', '.cfg', '.conf'], },
    { id: 'jade', extensions: ['.jade', '.pug'], },
    { id: 'java', extensions: ['.java', '.jav'], },
    { id: 'javascriptreact', extensions: ['.jsx'], },
    { id: 'javascript', extensions: ['.js', '.es6'], },
    { id: 'json', extensions: [
            '.json',
            '.bowerrc',
            '.jshintrc',
            '.jscsrc',
            '.eslintrc',
            '.babelrc',
            '.webmanifest'
    ], },
    { id: 'less', extensions: ['.less'], },
    { id: 'lua', extensions: ['.lua'], },
    { id: 'makefile', extensions: ['.mk'], },
    { id: 'markdown', extensions: ['.md', '.mdown', '.markdown', '.markdn'], },
    { id: 'objective-c', extensions: ['.m'], },
    { id: 'perl', extensions: ['.pl', '.pm', '.pod', '.t', '.PL', '.psgi'], },
    { id: 'perl6', extensions: ['.p6', '.pl6', '.pm6', '.nqp'], },
    { id: 'php', extensions: ['.php', '.php4', '.php5', '.phtml', '.ctp'], },
    { id: 'powershell', extensions: ['.ps1', '.psm1', '.psd1', '.pssc', '.psrc'], },
    { id: 'python', extensions: ['.py', '.rpy', '.pyw', '.cpy', '.gyp', '.gypi'], },
    { id: 'r', extensions: ['.r', '.rhistory', '.rprofile', '.rt'], },
    { id: 'razor', extensions: ['.cshtml'], },
    { id: 'ruby', extensions: ['.rb', '.rbx', '.rjs', '.gemspec', '.rake', '.ru'], },
    { id: 'rust', extensions: ['.rs'], },
    { id: 'scss', extensions: ['.scss'], },
    { id: 'shaderlab', extensions: ['.shader', '.cginc'], },
    { id: 'shellscript',
      extensions: [
            '.sh', '.bash', '.bashrc', '.bash_aliases', '.bash_profile',
            '.bash_login', '.ebuild', '.install', '.profile', '.bash_logout',
            '.zsh', '.zshrc', '.zprofile', '.zlogin', '.zlogout', '.zshenv', '.zsh-theme'
      ],
    },
    { id: 'sql', extensions: ['.sql', '.dsql'], },
    { id: 'swift', extensions: ['.swift'], },
    { id: 'typescript', extensions: ['.ts'], },
    { id: 'typescriptreact', extensions: ['.tsx'], },
    { id: 'vb', extensions: ['.vb', '.brs', '.vbs', '.bas'], },
    { id: 'xml',
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
            '.fsproj',
            '.fxml',
            '.iml',
            '.isml',
            '.jmx',
            '.launch',
            '.menu',
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
    { id: 'xsl', extensions: ['.xsl', '.xslt'], },
    { id: 'yaml', extensions: ['.eyaml', '.eyml', '.yaml', '.yml'], },
    { id: 'latex', extensions: ['.tex'], },
    { id: 'map', extensions: ['.map'], },
    { id: 'image', extensions: ['.jpg', '.png', '.jpeg', '.tiff', '.bmp', '.gif']},
    { id: 'binary', extensions: ['.gz', '.exe', '.dll', '.lib', '.obj', '.o']},
];

export const languageIds: string[] = languageExtensionDefinitions.map(({id}) => id);

let mapExtensionToLanguageIds: ExtensionToLanguageIdMap;

export function buildLanguageExtensionMap(defs: LanguageExtensionDefinitions): ExtensionToLanguageIdMap {
    return defs.reduce((map, def) => {
        def.extensions.forEach(ext => { map.set(ext, (map.get(ext) || new Set<string>()).add(def.id)); });
        return map;
    }, new Map<string, Set<string>>());
}

export function getLanguagesForExt(ext: string): string[] {
    if (!mapExtensionToLanguageIds) { mapExtensionToLanguageIds = buildLanguageExtensionMap(languageExtensionDefinitions); }
    return genSequence([ext, '.' + ext])
        .map(ext => mapExtensionToLanguageIds.get(ext))
        .filter(a => !!a)
        .concatMap<string>(a => a!)
        .toArray();
}
