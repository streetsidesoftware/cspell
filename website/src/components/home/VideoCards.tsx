import React from 'react';

import './video-cards.scss';

export interface CSpellVideoPresentation {
  title: string;
  url: string;
  description?: string;
  thumbnail?: string;
}

export interface VideoCardsProps {
  videos: CSpellVideoPresentation[];
  className?: string;
}

function getYouTubeThumbnail(url: string): string {
  // Extract YouTube video ID from URL
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
  const videoId = match?.[1];

  if (videoId) {
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  }

  return '/img/video-placeholder.svg';
}

export function VideoCards(props: VideoCardsProps): React.ReactElement {
  return (
    <div className={`home-video-cards ${props.className || ''}`}>
      {props.videos.map((video, index) => {
        const thumbnail = video.thumbnail || getYouTubeThumbnail(video.url);

        return (
          <a key={index} href={video.url} target="_blank" rel="noopener noreferrer" className="home-video-card">
            <div className="home-video-thumbnail">
              <img src={thumbnail} alt={video.title} loading="lazy" />
              <div className="home-video-play-overlay">
                <svg className="home-video-play-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
            <div className="home-video-content">
              <h3 className="home-video-title">{video.title}</h3>
              {video.description && <p className="home-video-description">{video.description}</p>}
            </div>
          </a>
        );
      })}
    </div>
  );
}
