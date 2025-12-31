import React from 'react';
import './home.css';

export interface HomePageCardProps {
  key: number;
  icon: string;
  title: string;
  description: string;
  fill?: string;
}

export function HomePageCard(props: HomePageCardProps): React.ReactElement {
  return (
    <div key={props.key} className="cspell-card">
      <div className="cspell-card-header">
        <div
          className="cspell-card-icon"
          style={props.fill ? { '--icon-color': props.fill } as React.CSSProperties : {}}
        >
          <div
            className={`cspell-card-icon-svg ${props.fill ? 'cspell-card-icon-colored' : ''}`}
            style={props.fill ? {
              maskImage: `url(${props.icon})`,
              WebkitMaskImage: `url(${props.icon})`,
            } : {
              backgroundImage: `url(${props.icon})`,
            }}
            aria-label={props.title}
          />
        </div>
        <h2 className="cspell-card-title">{props.title}</h2>
      </div>
      <p className="cspell-card-description">{props.description}</p>
    </div>
  );
}
