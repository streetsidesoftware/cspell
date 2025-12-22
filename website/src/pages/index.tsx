import React from 'react';
import Layout from '@theme/Layout';
import { HomePageCard } from '@site/src/components/HomepageFeatures/HomePageCard';

const demoData = [
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
    // Tailwind blue-500
    fill: '#3b82f6',
  },
  {
    title: 'Works Everywhere',
    description:
      'VS Code extension, CLI tool, ESLint plugin. Integrate into your editor, CI/CD pipeline, or build process.',
    icon: '/img/icons/leaf.svg',
    fill: '#22c55e',
  },
];

export default function Home() {
  return (
    <Layout title="CSpell - A Spell Checker for Code" description="CSpell - A spell checker for code!">
      <div style={{ display: 'flex', flexDirection: 'column', padding: '64px 64px' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '3rem', fontWeight: 'bold' }}>CSpell</h1>
            <h4 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>A Spell Checker for Code!</h4>
          </div>
          <img
            src="/img/logo.png"
            alt="CSpell Logo"
            style={{ width: '100%', maxWidth: '100px', borderRadius: '50%' }}
          />
        </div>
        <div
          style={{
            gap: '1.5rem',
            padding: '0 64px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          }}
        >
          {demoData.map((card) => (
            <HomePageCard {...card} />
          ))}
        </div>
      </div>
    </Layout>
  );
}
