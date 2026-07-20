'use client';

import React, { useState, useRef } from 'react';

export default function HeroVideo() {
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <video ref={videoRef} id="hero-video" autoPlay muted loop style={{ width: '100%', borderRadius: '10px' }}>
        <source src="/assets/videos/intro.webm" type="video/webm" />
        Your browser does not support the video tag.
      </video>
      <button 
        className="mute-btn" 
        id="mute-btn" 
        onClick={toggleMute}
        style={{
          position: 'absolute',
          bottom: '15px',
          right: '10px',
          background: 'var(--bg-color)',
          border: 'none',
          color: 'var(--text-color)',
          padding: '10px',
          borderRadius: '50%',
          cursor: 'pointer',
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 10px rgba(0,0,0,0.5)',
          zIndex: 10
        }}
        title={isMuted ? "Unmute" : "Mute"}
      >
        <i className={`fas ${isMuted ? 'fa-volume-mute' : 'fa-volume-up'}`}></i>
      </button>
    </div>
  );
}
