import React from 'react';
import Layout from '@theme/Layout';
import CodeBlock from '@theme/CodeBlock';
import { HomePageCards } from '@site/src/components/home/HomePageCard';
import { CARD_DATA, SPONSOR_LINKS, VIDEO_PRESENTATIONS } from '@site/src/components/home/content';
import { HomePageSection } from '@site/src/components/home/HomePageSection';
import { SponsorLinks } from '@site/src/components/home/SponsorLinks';
import { VideoCards } from '@site/src/components/home/VideoCards';
import Contributors from '@site/src/components/home/contributors.mdx';

/** Home page CSS module import */
import './index.scss';

export default function Home() {
  const onGetStartedClick = (): void => {
    window.location.href = 'https://cspell.org/docs/getting-started';
  };

  const onGitHubClick = (): void => {
    window.location.href = 'https://github.com/streetsidesoftware/cspell';
  };

  return (
    <Layout title="CSpell" description="A spell checker for code!">
      <div className="home-container">
        <div className="hero">
          <img src="/img/logo.png" alt="CSpell Logo" className="logo-image" />
          <div className="hero-content">
            <span className="hero-title">CSpell</span>
            <span className="hero-tagline">A Spell Checker for Code!</span>
          </div>
        </div>
        <div className="hero-buttons">
          <button className="hero-button-primary" onClick={onGetStartedClick}>
            Quickstart
          </button>
          <button className="hero-button-secondary" onClick={onGitHubClick}>
            GitHub
          </button>
        </div>
        <div className="cards-grid">
          <HomePageCards cards={CARD_DATA} />
        </div>
        <HomePageSection title="Support Future Development" center>
          <SponsorLinks links={SPONSOR_LINKS} />
        </HomePageSection>
        <HomePageSection title="Related Packages">
          <p>
            <a href="https://github.com/streetsidesoftware/cspell-cli" target="_blank" rel="noopener noreferrer">
              cspell-cli
            </a>{' '}
            — <code>cspell-cli</code> is useful for including <code>cspell</code> directly from GitHub.
          </p>
          <CodeBlock title="Install from GitHub">
            npm install -g git+https://github.com/streetsidesoftware/cspell-cli
          </CodeBlock>
          <p>
            This will add the <code>cspell-cli</code> command, which is an alias of the <code>cspell</code> command.
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
            .
          </p>
          <p>
            <strong>Note:</strong> To add or remove words in a dictionary, visit{' '}
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
          <Contributors />
        </HomePageSection>
        <HomePageSection
          title="Third-Party Video Presentations"
          description="Some videos related to CSpell from the community."
          center
        >
          <VideoCards videos={VIDEO_PRESENTATIONS} />
        </HomePageSection>
        <div className="footer-container">
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
                className="sponsor-logo-image"
              />{' '}
              Street Side Software
            </a>
          </p>
        </div>
      </div>
    </Layout>
  );
}
