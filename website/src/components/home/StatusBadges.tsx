import React from 'react';

export interface CSpellStatusBadge {
  alt: string;
  src: string;
  href: string;
}

export interface StatusBadgeListProps {
  badges: CSpellStatusBadge[];
  className?: string;
}

export function StatusBadgeList(props: StatusBadgeListProps): React.ReactElement {
  return (
    <div className={`home-badges ${props.className}`}>
      {props.badges.map((badge, index) => (
        <a key={index} href={badge.href} target="_blank" rel="noopener noreferrer" className="home-badge-link">
          <img src={badge.src} alt={badge.alt} className="home-badge" />
        </a>
      ))}
    </div>
  );
}
