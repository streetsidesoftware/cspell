import React from 'react';

import './home-page-section.scss';

export interface HomePageSectionProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
  center?: boolean;
}

export function HomePageSection(props: HomePageSectionProps): React.ReactElement {
  const className =
    'home-section' + (props.center ? ' home-section-center' : '') + (props.className ? ` ${props.className}` : '');
  return (
    <section className={className}>
      <div className="home-section-header">
        <span className="home-section-title">{props.title}</span>
        {props.description && <span className="home-section-description">{props.description}</span>}
      </div>

      <div className="home-section-content">{props.children}</div>
    </section>
  );
}
