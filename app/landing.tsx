'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { SparklesPreviewDark } from '@/components/ui/sparkles-demo';
import { DisplayCardsDemo } from '@/components/ui/display-cards-demo';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace('/dashboard');
      } else {
        setShowContent(true);
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-primary)' }}>
        <div style={{ width: 32, height: 32, border: '2px solid var(--accent)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <>
      {showContent && (
        <div className="fade-in">
          {/* Sparkles Hero Section */}
          <section style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, zIndex: 1, opacity: 0.6 }}>
              <SparklesPreviewDark />
            </div>
            {/* dark overlay for readability */}
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,30,0.5)', zIndex: 2 }} />
            {/* CTA Overlay */}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 20, textAlign: 'center', padding: '0 20px' }}>
              <h1 style={{ fontSize: 60, fontWeight: 900, color: '#fff', marginBottom: 24, lineHeight: 1.1 }}>Wissen Seat Booking</h1>
              <p style={{ fontSize: 22, color: '#ccc', marginBottom: 48, maxWidth: 650 }}>Smart, efficient seat reservation system for modern workspaces</p>
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
                <Link href="/login">
                  <button style={{ padding: '16px 36px', background: 'linear-gradient(135deg, #6c63ff, #a78bfa)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 18, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: 'transform 0.2s' }} onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')} onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}>
                    Get Started <ArrowRight size={20} />
                  </button>
                </Link>
                <button style={{ padding: '16px 36px', background: 'transparent', color: '#fff', border: '2px solid #6c63ff', borderRadius: 8, fontSize: 18, fontWeight: 700, cursor: 'pointer', transition: 'background 0.2s, color 0.2s' }} onMouseEnter={e => { e.currentTarget.style.background = '#6c63ff'; e.currentTarget.style.color = '#fff'; }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#fff'; }}>
                  Learn More
                </button>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section style={{ padding: '80px 20px', background: 'var(--bg-primary)' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
              <h2 style={{ fontSize: 40, fontWeight: 700, color: 'var(--text-primary)', textAlign: 'center', marginBottom: 60 }}>
                Key Features
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 32 }}>
                {[
                  { emoji: '🎯', title: 'Smart Booking', desc: 'Easily book and manage your seats with our intuitive interface' },
                  { emoji: '📊', title: 'Real-time Analytics', desc: 'Track occupancy and usage patterns in real-time' },
                  { emoji: '👥', title: 'Team Management', desc: 'Organize teams and batches for better coordination' },
                ].map(f => (
                  <div key={f.title} className="glass" style={{ padding: 32, textAlign: 'center', transition: 'transform 0.2s', cursor: 'default' }} onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-4px)')} onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}>
                    <div style={{ fontSize: 44, marginBottom: 18 }}>{f.emoji}</div>
                    <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14 }}>{f.title}</h3>
                    <p style={{ fontSize: 15, color: 'var(--text-secondary)' }}>{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Display Cards Section */}
          <section style={{ padding: '80px 20px', background: 'var(--bg-secondary)' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
              <h2 style={{ fontSize: 40, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20 }}>
                Trending Updates
              </h2>
              <p style={{ fontSize: 16, color: 'var(--text-secondary)', marginBottom: 60 }}>
                Stay updated with the latest features and announcements
              </p>
              <DisplayCardsDemo />
            </div>
          </section>

          {/* CTA Section */}
          <section style={{ padding: '80px 20px', background: 'var(--bg-primary)' }}>
            <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center', paddingTop: 40 }}>
              <h2 style={{ fontSize: 40, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20 }}>
                Ready to get started?
              </h2>
              <p style={{ fontSize: 16, color: 'var(--text-secondary)', marginBottom: 40 }}>
                Join thousands of users managing their seats efficiently
              </p>
              <Link href="/login">
                <button style={{ padding: '16px 40px', background: 'linear-gradient(135deg, #6c63ff, #a78bfa)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 16, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  Start Now <ArrowRight size={18} />
                </button>
              </Link>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
