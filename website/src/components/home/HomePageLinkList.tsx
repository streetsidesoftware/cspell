import React from 'react';

export interface LinkItem {
  title: string;
  url: string;
  description?: string;
}

export interface HomePageLinkListProps {
  items: LinkItem[];
  className?: string;
}

export function HomePageLinkList(props: HomePageLinkListProps): React.ReactElement {
  return (
    <ul className={`home-link-list ${props.className}`}>
      {props.items.map((item, index) => (
        <li key={index} className="home-link-item">
          <a href={item.url} target="_blank" rel="noopener noreferrer" className="home-link">
            {item.title}
          </a>
          {item.description && <span className="home-link-description"> - {item.description}</span>}
        </li>
      ))}
    </ul>
  );
}
