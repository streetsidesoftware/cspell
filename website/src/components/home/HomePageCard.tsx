import React from 'react';

import './home-page-card.scss';

export interface HomePageCard {
  icon: string;
  title: string;
  description: string;
  fill?: string;
}

export interface HomePageCardProps {
  cards: HomePageCard[];
  className?: string;
}

export function HomePageCards(props: HomePageCardProps): React.ReactElement {
  const cspellSvgStyle: React.CSSProperties = (card: HomePageCard) =>
    card.fill
      ? {
          maskImage: `url(${card.icon})`,
          WebkitMaskImage: `url(${card.icon})`,
          backgroundColor: card.fill,
        }
      : {
          backgroundImage: `url(${card.icon})`,
        };

  const cspellSvgFillStyle: React.CSSProperties = (card: HomePageCard) =>
    card.fill
      ? {
          '--icon-color': card.fill,
        }
      : {};

  return (
    <>
      {props.cards.map((card, index) => (
        <div key={index} className="cspell-card">
          <div className="cspell-card-header">
            <div className="cspell-card-icon" style={cspellSvgFillStyle(card)}>
              <div
                className={`cspell-card-icon-svg ${card.fill ? 'cspell-card-icon-colored' : ''}`}
                style={cspellSvgStyle(card)}
                aria-label={card.title}
              />
            </div>
            <h2 className="cspell-card-title">{card.title}</h2>
          </div>
          <p className="cspell-card-description">{card.description}</p>
        </div>
      ))}
    </>
  );
}
