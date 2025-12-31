import React from 'react';
import Layout from '@theme/Layout';
import { HomePageCard } from '@site/src/components/home/HomePageCard';
import { CARD_DATA, SPONSOR_LINKS, STATUS_BADGES, VIDEO_PRESENTATIONS } from '@site/src/components/home/content';
import { HomePageSection } from '@site/src/components/home/HomePageSection';
import { StatusBadgeList } from '@site/src/components/home/StatusBadges';
import { SponsorLinks } from '@site/src/components/home/SponsorLinks';
import { VideoCards } from '@site/src/components/home/VideoCards';
import { HomePageTable, HomeTableColumnAlign } from '@site/src/components/home/HomePageTable';

/** Home page CSS module import */
import styles from './index.module.css';

const packageRows = [
  {
    cells: [
      <a
        key="pkg1"
        href="https://github.com/streetsidesoftware/cspell/tree/main/packages/cspell"
        target="_blank"
        rel="noopener noreferrer"
      >
        cspell
      </a>,
      'cspell command-line application',
    ],
  },
  {
    cells: [
      <a
        key="pkg2"
        href="https://github.com/streetsidesoftware/cspell/tree/main/packages/cspell-eslint-plugin"
        target="_blank"
        rel="noopener noreferrer"
      >
        @cspell/eslint-plugin
      </a>,
      'CSpell ESLint Plugin',
    ],
  },
  {
    cells: [
      <a
        key="pkg3"
        href="https://github.com/streetsidesoftware/cspell/tree/main/packages/cspell-bundled-dicts"
        target="_blank"
        rel="noopener noreferrer"
      >
        cspell-bundled-dicts
      </a>,
      'collection of dictionaries bundled with cspell.',
    ],
  },
  {
    cells: [
      <a
        key="pkg4"
        href="https://github.com/streetsidesoftware/cspell/tree/main/packages/cspell-glob"
        target="_blank"
        rel="noopener noreferrer"
      >
        cspell-glob
      </a>,
      'glob library.',
    ],
  },
  {
    cells: [
      <a
        key="pkg5"
        href="https://github.com/streetsidesoftware/cspell/tree/main/packages/cspell-io"
        target="_blank"
        rel="noopener noreferrer"
      >
        cspell-io
      </a>,
      'i/o library.',
    ],
  },
  {
    cells: [
      <a
        key="pkg6"
        href="https://github.com/streetsidesoftware/cspell/tree/main/packages/cspell-lib"
        target="_blank"
        rel="noopener noreferrer"
      >
        cspell-lib
      </a>,
      'cspell library used for code driven spelling checking (used by the application).',
    ],
  },
  {
    cells: [
      <a
        key="pkg7"
        href="https://github.com/streetsidesoftware/cspell/tree/main/packages/cspell-types"
        target="_blank"
        rel="noopener noreferrer"
      >
        cspell-types
      </a>,
      'cspell types and JSON schema for cspell configuration files.',
    ],
  },
  {
    cells: [
      <a
        key="pkg8"
        href="https://github.com/streetsidesoftware/cspell/tree/main/packages/cspell-tools"
        target="_blank"
        rel="noopener noreferrer"
      >
        cspell-tools
      </a>,
      'tool used to compile dictionaries.',
    ],
  },
  {
    cells: [
      <a
        key="pkg9"
        href="https://github.com/streetsidesoftware/cspell/tree/main/packages/cspell-trie-lib"
        target="_blank"
        rel="noopener noreferrer"
      >
        cspell-trie-lib
      </a>,
      'trie data structure used to store words.',
    ],
  },
  {
    cells: [
      <a
        key="pkg10"
        href="https://github.com/streetsidesoftware/cspell/tree/main/packages/cspell-trie"
        target="_blank"
        rel="noopener noreferrer"
      >
        cspell-trie
      </a>,
      'trie data tool used to store words.',
    ],
  },
  {
    cells: [
      <a
        key="pkg11"
        href="https://github.com/streetsidesoftware/cspell/tree/main/packages/hunspell-reader"
        target="_blank"
        rel="noopener noreferrer"
      >
        hunspell-reader
      </a>,
      'reads Hunspell files and outputs words.',
    ],
  },
];

const rfcRows = [
  {
    cells: [
      <a key="rfc1" href="https://github.com/streetsidesoftware/cspell/tree/main/rfc/rfc-0001%20suggestions/">
        rfc-0001
      </a>,
      'Fixing common misspellings',
      'Done',
    ],
  },
  {
    cells: [
      <a
        key="rfc2"
        href="https://github.com/streetsidesoftware/cspell/tree/main/rfc/rfc-0002%20improve%20dictionary%20suggestions/"
      >
        rfc-0002
      </a>,
      'Improving Generated Suggestions',
      'Done',
    ],
  },
  {
    cells: [
      <a key="rfc3" href="https://github.com/streetsidesoftware/cspell/tree/main/rfc/rfc-0003%20parsing%20files/">
        rfc-0003
      </a>,
      'Plug-ins: Adding file parsers',
      'In Progress',
    ],
  },
  {
    cells: [
      <a key="rfc4" href="https://github.com/streetsidesoftware/cspell/tree/main/rfc/rfc-0004%20known%20issues/">
        rfc-0004
      </a>,
      'Support Marking Issues as Known',
      'Not started',
    ],
  },
];

const versionRows = [
  {
    cells: ['cspell', '9.x', '20.x', 'In Active Development', 'TBD', 'TBD'],
  },
  {
    cells: ['cspell', '8.x', '18.x', 'Maintenance', '2025-05-01', '2025-06-01'],
  },
  {
    cells: ['cspell', '7.x', '16.x', 'Paid support only[^1]', '2023-10-01', '2023-11-07'],
  },
  {
    cells: ['cspell', '6.x', '14.14.x', 'Paid support only[^1]', '2023-04-01', '2023-05-01'],
  },
  {
    cells: ['cspell', '5.x', '12.x', 'Paid support only[^1]', '-', '2022-10-01'],
  },
  {
    cells: ['cspell', '4.x', '10.x', 'Paid support only[^1]', '-', '2022-05-01'],
  },
];

export default function Home() {
  return (
    <Layout title="CSpell" description="A spell checker for code!">
      <div className={styles['home-container']}>
        <div className={styles.hero}>
          <img src="/img/logo.png" alt="CSpell Logo" className={styles['logo-image']} />
          <div className={styles['hero-content']}>
            <h1 className={styles.heroTitle}>CSpell</h1>
            <p className={styles.heroTagline}>A Spell Checker for Code!</p>
          </div>
          {/* TODO(Bence): Add Getting started and GitHub buttons */}
        </div>

        <div className={styles.cardsGrid}>
          {CARD_DATA.map((card, index) => (
            <HomePageCard
              key={index}
              title={card.title}
              description={card.description}
              icon={card.icon}
              fill={card.fill}
            />
          ))}
        </div>
        <HomePageSection title="Project Status">
          <StatusBadgeList badges={STATUS_BADGES} />
        </HomePageSection>

        <HomePageSection title="Support Future Development">
          <SponsorLinks links={SPONSOR_LINKS} />
        </HomePageSection>

        <HomePageSection title="Documentation">
          <p>
            <a href="https://cspell.org/docs/getting-started" target="_blank" rel="noopener noreferrer">
              Documentation - CSpell
            </a>
          </p>
        </HomePageSection>

        <HomePageSection title="Third-Party Video Presentations">
          <p>
            Some videos related to CSpell and the{' '}
            <a
              href="https://marketplace.visualstudio.com/items?itemName=streetsidesoftware.code-spell-checker"
              target="_blank"
              rel="noopener noreferrer"
            >
              Code Spell Checker
            </a>{' '}
            for VS Code.
          </p>
          <VideoCards videos={VIDEO_PRESENTATIONS} />
        </HomePageSection>

        <HomePageSection title="Packages">
          <HomePageTable
            headerColumns={[
              { header: 'Package', align: HomeTableColumnAlign.Left },
              { header: 'Description', align: HomeTableColumnAlign.Left },
            ]}
            rows={packageRows}
          />
        </HomePageSection>

        <HomePageSection title="Related Packages">
          <p>
            <a href="https://github.com/streetsidesoftware/cspell-cli" target="_blank" rel="noopener noreferrer">
              cspell-cli
            </a>{' '}
            — <code>cspell-cli</code> is useful for including <code>cspell</code> directly from GitHub.
          </p>
          <p>
            Example install: <code>npm install -g git+https://github.com/streetsidesoftware/cspell-cli</code>
          </p>
          <p>
            This will add the <code>cspell-cli</code> command, which is an alias of the <code>cspell</code> command.
          </p>
        </HomePageSection>

        <HomePageSection title="RFCs">
          <HomePageTable
            headerColumns={[
              { header: 'Link', align: HomeTableColumnAlign.Left },
              { header: 'Description', align: HomeTableColumnAlign.Left },
              { header: 'Status', align: HomeTableColumnAlign.Left },
            ]}
            rows={rfcRows}
          />
        </HomePageSection>

        <HomePageSection title="CSpell for enterprise">
          <p>Available as part of the Tidelift Subscription.</p>
          <p>
            The maintainers of CSpell and thousands of other packages are working with Tidelift to deliver commercial
            support and maintenance for the open source packages you use to build your applications. Save time, reduce
            risk, and improve code health, while paying the maintainers of the exact packages you use.{' '}
            <a
              href="https://tidelift.com/subscription/pkg/npm-cspell?utm_source=npm-cspell&utm_medium=referral&utm_campaign=enterprise&utm_term=repo"
              target="_blank"
              rel="noopener noreferrer"
            >
              Learn more.
            </a>
          </p>
        </HomePageSection>

        <HomePageSection title="Security contact information">
          <p>
            To report a security vulnerability, please email{' '}
            <a href="mailto:security@streetsidesoftware.com">security@streetsidesoftware.com</a> or use the{' '}
            <a href="https://tidelift.com/security" target="_blank" rel="noopener noreferrer">
              Tidelift security contact
            </a>
            . Tidelift will coordinate the fix and disclosure.
          </p>
        </HomePageSection>

        <HomePageSection title="Versions">
          <HomePageTable
            headerColumns={[
              { header: '', align: HomeTableColumnAlign.Left },
              { header: 'version', align: HomeTableColumnAlign.Left },
              { header: 'Node', align: HomeTableColumnAlign.Left },
              { header: 'Status', align: HomeTableColumnAlign.Left },
              { header: 'Maintenance', align: HomeTableColumnAlign.Left },
              { header: 'End of Free Support', align: HomeTableColumnAlign.Left },
            ]}
            rows={versionRows}
          />
          <p>
            <small>
              <a
                href="https://streetsidesoftware.com/support/#maintenance-agreements"
                target="_blank"
                rel="noopener noreferrer"
              >
                [^1]: Support - Street Side Software
              </a>
            </small>
          </p>
        </HomePageSection>

        <HomePageSection title="Contributing">
          <p>
            Contributions are welcome! See our{' '}
            <a
              href="https://github.com/streetsidesoftware/cspell/blob/main/CONTRIBUTING.md"
              target="_blank"
              rel="noopener noreferrer"
            >
              contribution notes
            </a>
            . <strong>Note:</strong> To add or remove words in a dictionary, visit{' '}
            <a
              href="https://github.com/streetsidesoftware/cspell-dicts/issues"
              target="_blank"
              rel="noopener noreferrer"
            >
              cspell-dicts
            </a>
            .
          </p>
          <p>
            🙏{' '}
            <em>
              <strong>Special thanks to all of our amazing contributors!</strong>
            </em>{' '}
            🥰
          </p>
        </HomePageSection>
        <div
          style={{
            textAlign: 'center',
            marginTop: '4rem',
            paddingTop: '2rem',
            borderTop: '1px solid var(--ifm-color-emphasis-200)',
          }}
        >
          <p>
            Brought to you by{' '}
            <a
              href="https://streetsidesoftware.com"
              title="Street Side Software"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                width="16"
                alt="Street Side Software Logo"
                src="https://i.imgur.com/CyduuVY.png"
                style={{ verticalAlign: 'middle', margin: '0 0.25rem' }}
              />{' '}
              Street Side Software
            </a>
          </p>
        </div>
      </div>
    </Layout>
  );
}
