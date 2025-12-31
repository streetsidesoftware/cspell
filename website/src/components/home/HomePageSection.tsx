import React from 'react';
import './home.css';

export interface HomePageSectionProps {
  title: string;
  children?: React.ReactNode;
  className?: string;
}

export function HomePageSection(props: HomePageSectionProps): React.ReactElement {
  return (
    <section className={`home-section ${props.className || ''}`}>
      <h2 className="home-section-title">{props.title}</h2>
      <div className="home-section-content">{props.children}</div>
    </section>
  );
}
