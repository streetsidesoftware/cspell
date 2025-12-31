export interface CSpellCard {
    title: string;
    description: string;
    icon: string;
    fill?: string;
}

export interface CSpellSponsorLink {
    label: string;
    url: string;
    icon?: string;
}

export interface CSpellStatusBadge {
    alt: string;
    src: string;
    href: string;
}

export interface CSpellVideoPresentation {
    title: string;
    url: string;
    description?: string;
    thumbnail?: string;
}

export const CARD_DATA: CSpellCard[] = [
    {
        title: 'Lightning Fast',
        description:
            'Optimized for performance to handle large codebases with thousands of files. Spell check your entire project in seconds.',
        icon: '/img/icons/lightning.svg',
        fill: '#eab308',
    },
    {
        title: 'Multi-Language',
        description:
            'Built-in dictionaries for dozens of programming and human languages. Extensible with custom word lists or dictionaries.',
        icon: '/img/icons/globe.svg',
        fill: '#3b82f6',
    },
    {
        title: 'Works Everywhere',
        description:
            'VS Code extension, CLI tool, ESLint plugin. Integrate into your editor, CI/CD pipeline, or build process.',
        icon: '/img/icons/leaf.svg',
        fill: '#22c55e',
    },
] as const;

export const SPONSOR_LINKS: CSpellSponsorLink[] = [
    {
        label: 'GitHub Sponsor',
        url: 'https://github.com/sponsors/streetsidesoftware',
        icon: 'github',
    },
    {
        label: 'Patreon',
        url: 'https://patreon.com/streetsidesoftware',
        icon: 'patreon',
    },
    {
        label: 'PayPal',
        url: 'https://www.paypal.com/donate/?hosted_button_id=26LNBP2Q6MKCY',
        icon: 'paypal',
    },
    {
        label: 'Open Collective',
        url: 'https://opencollective.com/cspell',
        icon: 'openCollective',
    },
    {
        label: 'CSpell',
        url: 'https://streetsidesoftware.com/sponsor',
        icon: 'cspell',
    },
] as const;

export const STATUS_BADGES: CSpellStatusBadge[] = [
    {
        alt: 'unit tests',
        src: 'https://github.com/streetsidesoftware/cspell/actions/workflows/test.yml/badge.svg?branch=main',
        href: 'https://github.com/streetsidesoftware/cspell/actions',
    },
    {
        alt: 'integration tests',
        src: 'https://github.com/streetsidesoftware/cspell/actions/workflows/integration-test.yml/badge.svg?branch=main',
        href: 'https://github.com/streetsidesoftware/cspell/actions',
    },
    {
        alt: 'lint',
        src: 'https://github.com/streetsidesoftware/cspell/actions/workflows/lint.yml/badge.svg?branch=main',
        href: 'https://github.com/streetsidesoftware/cspell/actions',
    },
    {
        alt: 'coverage',
        src: 'https://github.com/streetsidesoftware/cspell/actions/workflows/coverage.yml/badge.svg?branch=main',
        href: 'https://github.com/streetsidesoftware/cspell/actions',
    },
    {
        alt: 'codecov',
        src: 'https://codecov.io/gh/streetsidesoftware/cspell/branch/main/graph/badge.svg?token=Dr4fi2Sy08',
        href: 'https://codecov.io/gh/streetsidesoftware/cspell',
    },
    {
        alt: 'Coverage Status',
        src: 'https://coveralls.io/repos/github/streetsidesoftware/cspell/badge.svg?branch=main',
        href: 'https://coveralls.io/github/streetsidesoftware/cspell',
    },
] as const;

export const VIDEO_PRESENTATIONS: CSpellVideoPresentation[] = [
    {
        title: 'Spell Checking Documentation in DevOps Pipelines',
        url: 'https://www.youtube.com/watch?v=w8gGi3aeVpc',
        description: 'by Houssem Dellai',
    },
    {
        title: "Don't Worry About Spelling...VS Code Can Do It For You!!",
        url: 'https://www.youtube.com/watch?v=MfxFMFMsBP4',
        description: 'by James Q Quick',
    },
    {
        title: 'Spell Checking In VSCode - VSCode Pro Tips',
        url: 'https://www.youtube.com/watch?v=_GwpPJgH1Gw',
    },
    {
        title: 'Spell Check in VS Code with Code Spell Checker - Extension Highlight',
        url: 'https://www.youtube.com/watch?v=ZxNnOjWetH4',
    },
    {
        title: 'Spell check your code from the command line with Cspell',
        url: 'https://www.youtube.com/watch?v=nwmJ9h_zPJc',
    },
    {
        title: 'How to Use VS Code Spell Checker',
        url: 'https://www.youtube.com/watch?v=Ix5bMd0kZeY',
        description: 'Detailed walkthrough to setup and use multiple languages',
    },
    {
        title: 'Code Spell Checker Extension for Visual Studio Code',
        url: 'https://www.youtube.com/watch?v=dUn1mrJYMrM',
    },
] as const;
