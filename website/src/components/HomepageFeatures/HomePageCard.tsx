import React from 'react';

export interface HomePageCardProps {
  title: string;
  description: string;
  icon: string;
  fill?: string;
}

export function HomePageCard({ title, description, icon, fill }: HomePageCardProps) {
  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        padding: '1.5rem',
        borderRadius: '1rem',
        flexDirection: 'column',
        backgroundColor: '#282c34',
      }}
    >
      <div
        style={{
          display: 'flex',
          padding: '0.5rem',
          alignItems: 'center',
          borderRadius: '0.5rem',
          maxWidth: 'fit-content',
          backgroundColor: '#242526',
          border: '1px solid #282c34',
        }}
      >
        <img src={icon} alt={title} style={{ width: '2rem', height: '2rem', color: fill }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', marginTop: '0.5rem' }}>
        <h2>{title}</h2>
        <span style={{ textAlign: 'justify', fontSize: '1rem', fontWeight: '500' }}>{description}</span>
      </div>
    </div>
  );
}
