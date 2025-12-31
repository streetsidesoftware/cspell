import React from 'react';

import './home-page-card.scss';

export interface HomePageCardProps {
  key: number;
  icon: string;
  title: string;
  description: string;
  fill?: string;
}

export function HomePageCard(props: HomePageCardProps): React.ReactElement {
  const cspellSvgStyle: React.CSSProperties = props.fill
    ? {
        maskImage: `url(${props.icon})`,
        WebkitMaskImage: `url(${props.icon})`,
        backgroundColor: props.fill,
      }
    : {
        backgroundImage: `url(${props.icon})`,
      };

  const cspellSvgFillStyle: React.CSSProperties = props.fill
    ? {
        '--icon-color': props.fill,
      }
    : {};

  return (
    <div key={props.key} className="cspell-card">
      <div className="cspell-card-header">
        <div className="cspell-card-icon" style={cspellSvgFillStyle}>
          <div
            className={`cspell-card-icon-svg ${props.fill ? 'cspell-card-icon-colored' : ''}`}
            style={cspellSvgStyle}
            aria-label={props.title}
          />
        </div>
        <h2 className="cspell-card-title">{props.title}</h2>
      </div>
      <p className="cspell-card-description">{props.description}</p>
    </div>
  );
}
