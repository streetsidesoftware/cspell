import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import npm2yarn from '@docusaurus/remark-plugin-npm2yarn';

// TypeDoc's own default `blockTags` (as of typedoc@0.28). Setting the `blockTags` option
// replaces this list rather than extending it, so it must be repeated here in full.
const typedocDefaultBlockTags = [
    '@defaultValue',
    '@deprecated',
    '@example',
    '@jsx',
    '@param',
    '@privateRemarks',
    '@remarks',
    '@returns',
    '@see',
    '@throws',
    '@typeParam',
    '@author',
    '@callback',
    '@category',
    '@categoryDescription',
    '@default',
    '@document',
    '@extends',
    '@augments',
    '@yields',
    '@group',
    '@groupDescription',
    '@import',
    '@inheritDoc',
    '@license',
    '@module',
    '@mergeModuleWith',
    '@prop',
    '@property',
    '@return',
    '@satisfies',
    '@since',
    '@sortStrategy',
    '@template',
    '@this',
    '@type',
    '@typedef',
    '@summary',
    '@preventInline',
    '@inlineType',
    '@preventExpand',
    '@expandType',
];

// Tags used by `cspell-types` (and elsewhere) to drive JSON-schema generation.
// They are not standard TSDoc/TypeDoc tags, so TypeDoc must be told about them
// to avoid "Encountered an unknown block tag" warnings during `docusaurus build`.
const schemaOnlyBlockTags = [
    '@deprecationMessage',
    '@hide',
    '@note',
    '@pattern',
    '@scope',
    '@stability',
    '@title',
    '@uniqueItems',
];

const typedocSharedOptions = {
    // Recognize the schema-only tags plus `@todo`, in addition to TypeDoc's defaults.
    blockTags: [...typedocDefaultBlockTags, ...schemaOnlyBlockTags, '@todo'],
    // The schema-only tags carry no useful information for API docs readers, so drop
    // them from the rendered output once TypeDoc has parsed (and stopped warning about) them.
    excludeTags: schemaOnlyBlockTags,
};

const config: Config = {
    title: 'CSpell',
    tagline: 'A spell checker for code!',
    favicon: 'img/favicon.ico',
    staticDirectories: ['public', 'static'],

    // Set the production url of your site here
    url: 'https://cspell.org',
    // Set the /<baseUrl>/ pathname under which your site is served
    // For GitHub pages deployment, it is often '/<projectName>/'
    baseUrl: '/',

    // GitHub pages deployment config.
    // If you aren't using GitHub pages, you don't need these.
    organizationName: 'streetsidesoftware', // Usually your GitHub org/user name.
    projectName: 'cspell', // Usually your repo name.

    trailingSlash: false,

    onBrokenLinks: 'throw',
    onBrokenMarkdownLinks: 'warn',

    plugins: [
        'docusaurus-plugin-sass',
        [
            'docusaurus-plugin-typedoc',
            {
                id: 'api-cspell-types',
                out: './docs/api/cspell-types',
                entryPoints: ['../packages/cspell-types/src/index.ts'],
                tsconfig: '../packages/cspell-types/tsconfig.json',
                // outputFileStrategy: 'modules',
                fileExtension: '.md',
                ...typedocSharedOptions,
            },
        ],
        [
            'docusaurus-plugin-typedoc',
            {
                id: 'api-cspell-lib',
                out: './docs/api/cspell-lib',
                entryPoints: ['../packages/cspell-lib/src/lib/index.ts'],
                tsconfig: '../packages/cspell-lib/tsconfig.json',
                // outputFileStrategy: 'modules',
                fileExtension: '.md',
                ...typedocSharedOptions,
            },
        ],
        [
            'docusaurus-plugin-typedoc',
            {
                id: 'api-cspell',
                out: './docs/api/cspell',
                entryPoints: ['../packages/cspell/src/index.mts'],
                tsconfig: '../packages/cspell/tsconfig.json',
                // outputFileStrategy: 'modules',
                fileExtension: '.md',
                ...typedocSharedOptions,
            },
        ],
        // [
        //     'docusaurus-plugin-typedoc',
        //     {
        //         id: 'api-cspell-trie-lib',
        //         out: './docs/api/cspell-trie-lib',
        //         entryPoints: ['../packages/cspell-trie-lib/src/lib/index.ts'],
        //         tsconfig: '../packages/cspell-trie-lib/tsconfig.json',
        //         // outputFileStrategy: 'modules',
        //         fileExtension: '.md',
        //     },
        // ],
        [
            '@docusaurus/plugin-client-redirects',
            {
                createRedirects(existingPath: string) {
                    if (existingPath.includes('/docs/Configuration/')) {
                        return [existingPath.replace('/docs/Configuration/', '/configuration/')];
                    }
                    return undefined; // Return a falsy value: no redirect created
                },
            },
        ],
    ],

    // Even if you don't use internationalization, you can use this field to set
    // useful metadata like html lang. For example, if your site is Chinese, you
    // may want to replace "en" with "zh-Hans".
    i18n: {
        defaultLocale: 'en',
        locales: ['en'],
    },

    presets: [
        [
            'classic',
            {
                docs: {
                    sidebarPath: './sidebars.ts',
                    // Please change this to your repo.
                    // Remove this to remove the "edit this page" links.
                    editUrl: 'https://github.com/streetsidesoftware/cspell/tree/main/website',
                    remarkPlugins: [npm2yarn],
                },
                // blog: {
                //   showReadingTime: true,
                //   // Please change this to your repo.
                //   // Remove this to remove the "edit this page" links.
                //   editUrl:
                //     'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
                // },
                theme: {
                    customCss: './src/css/custom.css',
                },
            } satisfies Preset.Options,
        ],
    ],

    themeConfig: {
        // Replace with your project's social card
        // image: 'img/docusaurus-social-card.jpg',
        colorMode: {
            defaultMode: 'light',
            disableSwitch: false,
            respectPrefersColorScheme: false,
        },
        navbar: {
            title: 'CSpell',
            logo: {
                alt: 'Street Side Software Logo',
                src: 'img/logo.png',
            },
            items: [
                {
                    type: 'docSidebar',
                    sidebarId: 'tutorialSidebar',
                    position: 'left',
                    label: 'Docs',
                },
                { to: '/about', label: 'About', position: 'left' },
                { label: 'Street Side Software', href: 'https://streetsidesoftware.com', position: 'right' },
                // {to: '/blog', label: 'Blog', position: 'left'},
                {
                    href: 'https://github.com/streetsidesoftware/cspell',
                    label: 'GitHub',
                    position: 'right',
                },
            ],
        },
        footer: {
            style: 'dark',
            // links: [
            //     {
            //         title: 'Docs',
            //         items: [
            //             {
            //                 label: 'Tutorial',
            //                 to: '/docs/intro',
            //             },
            //         ],
            //     },
            //     {
            //         title: 'Community',
            //         items: [
            //             {
            //                 label: 'Stack Overflow',
            //                 href: 'https://stackoverflow.com/questions/tagged/docusaurus',
            //             },
            //             {
            //                 label: 'Discord',
            //                 href: 'https://discordapp.com/invite/docusaurus',
            //             },
            //             {
            //                 label: 'Twitter',
            //                 href: 'https://twitter.com/docusaurus',
            //             },
            //         ],
            //     },
            //     {
            //         title: 'More',
            //         items: [
            //             {
            //                 label: 'Blog',
            //                 to: '/blog',
            //             },
            //             {
            //                 label: 'GitHub',
            //                 href: 'https://github.com/facebook/docusaurus',
            //             },
            //         ],
            //     },
            // ],
            copyright: `Copyright © ${new Date().getFullYear()} Street Side Software`,
        },
        prism: {
            theme: prismThemes.github,
            darkTheme: prismThemes.dracula,
            additionalLanguages: ['json', 'json5', 'bash'],
        },
    } satisfies Preset.ThemeConfig,

    scripts: [
        {
            defer: true,
            'data-domain': 'cspell.org',
            src: 'https://plausible.io/js/script.js',
        },
    ],
};

export default config;
