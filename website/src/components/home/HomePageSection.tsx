import React from 'react';

import './home-page-section.scss';

export interface HomePageSectionProps {
  title: string;
  children?: React.ReactNode;
  className?: string;
}

export function HomePageSection(props: HomePageSectionProps): React.ReactElement {
  return (
    <section className="home-section">
      <span className="home-section-title">{props.title}</span>
      <div className="home-section-content">{props.children}</div>
    </section>
  );
}
