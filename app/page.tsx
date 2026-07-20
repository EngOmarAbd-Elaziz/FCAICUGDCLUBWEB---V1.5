/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import Image from 'next/image';
import HeroVideo from '@/components/HeroVideo';
import ContactForm from '@/components/ContactForm';

export default async function HomePage() {
  const supabase = await createClient();

  // Fetch data
  const { data: founders } = await supabase
    .from('founders')
    .select('*')
    .order('display_order', { ascending: true });

  const { data: youtubeVideos } = await supabase
    .from('youtube_videos')
    .select('*')
    .order('created_at', { ascending: false });

  const { data: stats } = await supabase
    .from('statistics')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(1)
    .single();

  const { data: partners } = await supabase
    .from('partners')
    .select('*')
    .order('display_order', { ascending: true });

  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-container">
          <div className="hero-left">
            <h1><span className="s-main">متخليش الدنيا</span> <br/><span className="s-sec">تبكسلك</span></h1>
            <p className="description">Join the premier game development community at FCAI. Learn, create, and innovate in the world of gaming.</p>
            <div className="animated-text">
              <span style={{ animationDelay: '0s' }}>Unity</span>
              <span style={{ animationDelay: '0.5s' }}>C#</span>
              <span style={{ animationDelay: '1s' }}>Computer Graphics</span>
              <span style={{ animationDelay: '1.5s' }}>Game Design</span>
            </div>
          </div>
          <div className="hero-right">
            <HeroVideo />
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="mission-vision" id="about">
        <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '5rem', paddingTop: '5rem', paddingBottom: '2rem' }}>
          <div className="mission">
            <h2>Our Mission</h2>
            <p>To foster a vibrant community of game developers, providing resources, mentorship, and opportunities for growth in the gaming industry.</p>
          </div>
          <div className="vision">
            <h2>Our Vision</h2>
            <p>To be the leading game development community in Egypt, producing innovative games and skilled developers that shape the future of gaming.</p>
          </div>
        </div>
      </section>

      {/* Overview */}
      <section className="overview">
        <div className="container">
          <h2>Our Impact</h2>
          <div className="stats">
            <div className="stat">
              <h3 id="students-count">{stats?.students_count || 0}</h3>
              <p>Students Trained</p>
            </div>
            <div className="stat">
              <h3 id="graduates-count">{stats?.graduates_count || 0}</h3>
              <p>Active Graduates</p>
            </div>
            <div className="stat">
              <h3 id="projects-count">{stats?.projects_count || 0}</h3>
              <p>Community Projects</p>
            </div>
          </div>
          <Link href="/projects" className="btn-primary">Explore Projects</Link>
        </div>
      </section>

      {/* Founders Section */}
      <section className="team" id="team">
        <div className="container">
          <h2>Our Founders</h2>
          <div className="team-grid" id="team-grid">
            {founders && founders.length > 0 ? (
              founders.map((founder: any) => (
                <div className="team-card" key={founder.id}>
                  {founder.photo && (
                    <Image src={founder.photo} alt={founder.name} width={400} height={500} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
                  )}
                  <div className="overlay">
                    <h3>{founder.name}</h3>
                    <p>{founder.role}</p>
                    {founder.linkedin_url && (
                      <a href={founder.linkedin_url} target="_blank" rel="noreferrer"><i className="fab fa-linkedin"></i></a>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p style={{ textAlign: 'center', gridColumn: '1 / -1' }}>Founders data will appear here.</p>
            )}
          </div>
          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <Link href="/team" className="btn-primary">View Full Team</Link>
          </div>
        </div>
      </section>

      {/* YouTube Showcase */}
      <section className="youtube-showcase">
        <div className="container">
          <h2>Our YouTube Content</h2>
          <div className="youtube-slider" id="youtube-slider">
            <div className="youtube-track">
              {youtubeVideos && youtubeVideos.length > 0 ? (
                // Duplicate twice for marquee effect
                [...youtubeVideos, ...youtubeVideos].map((video: any, idx) => {
                  // Auto-generate thumbnail from YouTube video ID if not stored
                  const getYouTubeThumbnail = (url: string, storedThumb?: string) => {
                    if (storedThumb) return storedThumb;
                    const match = url?.match(/(?:v=|youtu\.be\/)([\w-]{11})/);
                    return match ? `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg` : null;
                  };
                  const thumb = getYouTubeThumbnail(video.youtube_url, video.thumbnail);
                  return (
                    <a href={video.youtube_url} target="_blank" rel="noreferrer" key={idx} className="youtube-thumb-link">
                      {thumb ? (
                        <Image src={thumb} alt={video.title} width={320} height={190} style={{ objectFit: 'cover', borderRadius: '14px', display: 'block' }} />
                      ) : (
                        <div style={{ width: 320, height: 190, background: 'var(--card-bg)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <i className="fab fa-youtube" style={{ fontSize: '3rem', color: 'red' }}></i>
                        </div>
                      )}
                    </a>
                  );
                })
              ) : (
                <p>YouTube videos will appear here.</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="partners-section" style={{ padding: '60px 0' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--primary-color)' }}>Our Partners</h2>
          <div className="partners-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'center' }}>
            {partners && partners.length > 0 ? (
              partners.map((partner: any) => (
                <div key={partner.id} style={{ background: 'var(--card-bg)', padding: '1rem', borderRadius: '10px' }}>
                  {partner.website_url ? (
                    <a href={partner.website_url} target="_blank" rel="noreferrer">
                      <Image src={partner.logo_url} alt={partner.name} width={150} height={150} style={{ objectFit: 'contain' }} />
                    </a>
                  ) : (
                    <Image src={partner.logo_url} alt={partner.name} width={150} height={150} style={{ objectFit: 'contain' }} />
                  )}
                </div>
              ))
            ) : (
              <p>Partners will appear here.</p>
            )}
          </div>
        </div>
      </section>
      {/* Contact Section */}
      <section className="contact-section" id="contact">
        <div className="container">
          <div className="contact-header">
            <h2>Get In Touch</h2>
            <p>Have a question or want to collaborate? We&apos;d love to hear from you.</p>
          </div>
          
          <div className="contact-grid">
            <div className="contact-info-cards">
              <div className="contact-card">
                <div className="icon-wrapper">
                  <i className="fas fa-envelope"></i>
                </div>
                <div>
                  <h3>Email Us</h3>
                  <a href="mailto:fcaigamedevclub@gmail.com">fcaigamedevclub@gmail.com</a>
                </div>
              </div>
              
              <div className="contact-card">
                <div className="icon-wrapper">
                  <i className="fas fa-phone-alt"></i>
                </div>
                <div>
                  <h3>Call Us</h3>
                  <a href="tel:+201020468877">+20 102 046 8877</a>
                </div>
              </div>

              <div className="contact-card">
                <div className="icon-wrapper">
                  <i className="fas fa-map-marker-alt"></i>
                </div>
                <div>
                  <h3>Visit Us</h3>
                  <p>FCAI, Cairo University, Giza</p>
                </div>
              </div>

              {/* Social Links */}
              <div className="contact-socials-row">
                <a href="https://www.facebook.com/FCA.Cairo.GD.Club" className="contact-social-btn" target="_blank" rel="noreferrer" aria-label="Facebook" style={{ '--social-color': '#1877f2' } as React.CSSProperties}>
                  <i className="fab fa-facebook"></i>
                  <span>Facebook</span>
                </a>
                <a href="https://www.linkedin.com/company/fcai-cu-game-development-club" className="contact-social-btn" target="_blank" rel="noreferrer" aria-label="LinkedIn" style={{ '--social-color': '#0a66c2' } as React.CSSProperties}>
                  <i className="fab fa-linkedin"></i>
                  <span>LinkedIn</span>
                </a>
                <a href="https://www.instagram.com/fcai_cairogdclub" className="contact-social-btn" target="_blank" rel="noreferrer" aria-label="Instagram" style={{ '--social-color': '#e1306c' } as React.CSSProperties}>
                  <i className="fab fa-instagram"></i>
                  <span>Instagram</span>
                </a>
                <a href="https://www.youtube.com/@FCAICairoGDClub" className="contact-social-btn" target="_blank" rel="noreferrer" aria-label="YouTube" style={{ '--social-color': '#ff0000' } as React.CSSProperties}>
                  <i className="fab fa-youtube"></i>
                  <span>YouTube</span>
                </a>
              </div>
            </div>

            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
