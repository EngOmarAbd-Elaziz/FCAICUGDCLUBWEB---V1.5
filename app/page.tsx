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

  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-container">
          <div className="hero-left">
            <h1><span className="s-main" style={{ fontSize: 'clamp(3.5rem, 12vw, 8rem)' }}>متخليش الدنيا</span> <br/><span className="s-sec" style={{ fontSize: 'clamp(2.5rem, 9vw, 5.5rem)' }}>تبكسلك</span></h1>
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

      {/* Linktree / Social Hub Banner */}
      <a
        href="https://linktr.ee/FCAI_GDClub"
        target="_blank"
        rel="noreferrer"
        style={{ textDecoration: 'none', display: 'block' }}
        aria-label="Find all our social media links on Linktree"
      >
        <div className="linktree-banner">
          <div className="linktree-banner-inner">
            <span className="linktree-banner-icon">🌐</span>
            <span className="linktree-banner-text">
              Connect, Follow &amp; Explore — Find All Our Social Media Links Here
            </span>
            <span className="linktree-banner-arrow">↗</span>
          </div>
          <div className="linktree-banner-shimmer" />
        </div>
      </a>

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
          <div className="impact-cta-container" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '2rem' }}>
            <Link href="/waves" className="btn-primary">Explore Waves</Link>
            <Link href="/courses" className="btn-primary">Explore Our Courses</Link>
          </div>
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
          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <a href="https://www.youtube.com/@FCAICairoGDClub" target="_blank" rel="noreferrer" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
              <i className="fab fa-youtube" style={{ fontSize: '1.2rem' }}></i>
              Visit Our YouTube Channel
            </a>
          </div>
        </div>
      </section>

      {/* Our Events Section (New) */}
      <section className="events-invitation" style={{ padding: '120px 20px', position: 'relative', overflow: 'hidden', background: 'transparent' }}>
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes float-icon {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(5deg); }
          }
          .invitation-btn:hover {
            transform: translateY(-5px) scale(1.02);
            box-shadow: 0 15px 35px rgba(255, 83, 3, 0.4) !important;
          }
        `}} />
        <div className="container" style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          
          <div className="invitation-badge" style={{ display: 'inline-block', padding: '0.5rem 1.2rem', background: 'rgba(255, 83, 3, 0.1)', color: 'var(--primary-color)', borderRadius: '999px', fontSize: '0.9rem', fontWeight: 800, letterSpacing: '0.15em', marginBottom: '1.5rem', border: '1px solid rgba(255, 83, 3, 0.3)' }}>
            YOU IN?
          </div>
          
          <h2 dir="rtl" style={{ fontSize: 'clamp(1.8rem, 8vw, 4.5rem)', fontWeight: 900, marginBottom: '1.5rem', lineHeight: 1.2, fontFamily: '"Aref Ruqaa Ink", serif', color: 'var(--text-color)', filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.1))' }}>
            مستني إيه؟ تعالى شاركنا! 👀
          </h2>
          
          <p dir="rtl" style={{ maxWidth: '750px', fontSize: 'clamp(1rem, 4vw, 1.4rem)', color: 'rgba(255, 255, 255, 0.85)', marginBottom: '3.5rem', lineHeight: 1.8, fontWeight: 500 }}>
            من أول الـ workshops والـ talks لحد الـ game jams والفعاليات اللي بنعملها سوا… دايمًا فيه حاجة جديدة بتحصل. تعالى شوف إيه اللي جاي وخلّي مكانك وسطنا!
          </p>
          
          <Link href="/events" className="btn-primary invitation-btn" style={{ fontSize: '1.2rem', padding: '1.2rem 3rem', borderRadius: '50px', display: 'inline-flex', alignItems: 'center', gap: '12px', boxShadow: '0 10px 30px rgba(255, 83, 3, 0.25)', transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)' }}>
            Explore Our Events <i className="fas fa-arrow-right"></i>
          </Link>
          
        </div>

        {/* Decorative Floating Elements */}
        <div style={{ position: 'absolute', top: '15%', left: '15%', fontSize: '4rem', opacity: 0.15, pointerEvents: 'none', animation: 'float-icon 7s ease-in-out infinite' }}>🎮</div>
        <div style={{ position: 'absolute', bottom: '20%', right: '15%', fontSize: '5rem', opacity: 0.1, pointerEvents: 'none', animation: 'float-icon 9s ease-in-out infinite reverse' }}>✨</div>
        <div style={{ position: 'absolute', top: '60%', left: '10%', fontSize: '3rem', opacity: 0.15, pointerEvents: 'none', animation: 'float-icon 8s ease-in-out infinite 2s' }}>🚀</div>
        <div style={{ position: 'absolute', top: '25%', right: '20%', fontSize: '3rem', opacity: 0.1, pointerEvents: 'none', animation: 'float-icon 10s ease-in-out infinite 1s' }}>🎲</div>
        
        {/* Glow effect */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '800px', height: '800px', background: 'radial-gradient(circle, rgba(255,83,3,0.06) 0%, rgba(255,83,3,0) 60%)', pointerEvents: 'none', zIndex: 1 }}></div>
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
                  <i className="fab fa-discord"></i>
                </div>
                <div>
                  <h3>Join Us</h3>
                  <a href="#" target="_blank" rel="noreferrer">Community Discord</a>
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
