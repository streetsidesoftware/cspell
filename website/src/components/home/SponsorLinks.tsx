import React from 'react';
import './home.css';

export interface CSpellSponsorLink {
  label: string;
  url: string;
  icon?: string;
}

export interface SponsorLinksProps {
  links: CSpellSponsorLink[];
  className?: string;
}

function getIconPath(iconName?: string): string | null {
  if (!iconName) {
    return null;
  }

  const icons: Record<string, string> = {
    github: '/img/icons/github.svg',
    patreon: '/img/icons/patreon.svg',
    paypal: '/img/icons/paypal-simple.svg',
    openCollective: '/img/icons/open-collective.svg',
  };

  return icons[iconName.toLowerCase()] || null;
}

export function SponsorLinks(props: SponsorLinksProps): React.ReactElement {
  return (
    <div className={`cspell-sponsor-links ${props.className || ''}`}>
      {props.links.map((link, index) => {
        const icon = getIconPath(link.icon);

        return (
          <a key={index} href={link.url} target="_blank" rel="noopener noreferrer" className="cspell-sponsor-link">
            {icon && (
              <span className="cspell-sponsor-icon">
                <img src={icon} alt={link.label} />
              </span>
            )}
            <span className="cspell-sponsor-label">{link.label}</span>
          </a>
        );
      })}
    </div>
  );
}
