'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import Image from 'next/image';

const FEATURES = [
  { icon: '🗺️', title: 'Live Floor Map', desc: 'Real-time seat visualization' },
  { icon: '🤖', title: 'AI Recommendations', desc: 'Smart desk suggestions' },
  { icon: '📅', title: 'Smart Scheduling', desc: 'Batch-based organization' },
  { icon: '📊', title: 'Analytics', desc: 'Occupancy insights' },
];

const STATS = [
  { val: '$1B', label: 'Project Value' },
  { val: '20+', label: 'Fortune 500 Clients' },
  { val: '4000+', label: 'Professionals' },
];

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [showContent, setShowContent] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace('/dashboard');
      } else {
        setShowContent(true);
      }
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!showContent) return;

    const handleScroll = () => {
      const progress = window.scrollY / (document.body.scrollHeight - window.innerHeight);
      setScrollProgress(Math.min(progress, 1));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showContent]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#050810]">
        <div className="w-8 h-8 border-2 border-[#4845D4] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!showContent) return null;

  return (
    <div className="bg-[#050810] text-white overflow-x-hidden">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 h-1 bg-gradient-to-r from-[#4845D4] via-[#00C9A7] to-[#7B5CF0] z-50" style={{ width: `${scrollProgress * 100}%` }} />

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-40 px-6 md:px-10 py-4 flex items-center justify-between transition-all duration-300 ${scrollProgress > 0.05 ? 'bg-[#050810]/90 backdrop-blur-xl border-b border-white/5' : ''}`}>
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
          <Image 
            src="/6448bf6f06402019562ca4db_Wissen Logo Blue.png" 
            alt="Wissen Logo" 
            width={140} 
            height={40}
            className="h-8 w-auto"
          />
        </Link>
        <div className="hidden lg:flex items-center gap-12">
          <a href="#features" className="text-sm text-white/60 hover:text-white transition-colors">Features</a>
          <a href="#about" className="text-sm text-white/60 hover:text-white transition-colors">About</a>
          <a href="#contact" className="text-sm text-white/60 hover:text-white transition-colors">Contact</a>
        </div>
        <Link href="/login">
          <button className="px-6 py-2 bg-white/7 border border-white/14 rounded-full text-sm font-semibold hover:bg-[#4845D4] hover:border-[#4845D4] transition-all">Sign In</button>
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center pt-20 px-6 md:px-10 text-center">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-[#00C9A7]/10 border border-[#00C9A7]/25 rounded-full px-4 py-1.5 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00C9A7]" />
            <span className="text-xs font-semibold text-[#00C9A7] uppercase tracking-widest">Smart Office Platform</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
            Book your desk,<br />
            <span className="bg-gradient-to-r from-[#4845D4] via-[#7B5CF0] to-[#00C9A7] bg-clip-text text-transparent">instantly.</span>
          </h1>
          <p className="text-lg md:text-xl text-white/55 mb-10 max-w-2xl mx-auto leading-relaxed">Wissen's intelligent seat booking platform brings real-time floor maps and AI-powered recommendations to your workplace.</p>
          <Link href="/login">
            <button className="px-8 py-3.5 bg-gradient-to-br from-[#4845D4] to-[#7B5CF0] rounded-full font-semibold hover:shadow-2xl hover:shadow-[#4845D4]/60 transition-all">Start Booking →</button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 md:py-28 px-6 md:px-10">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black mb-12 text-center">Powerful Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((feat, i) => (
              <div key={i} className="p-6 bg-white/3 border border-white/7 rounded-2xl hover:border-white/14 hover:-translate-y-1 transition-all">
                <div className="text-4xl mb-4">{feat.icon}</div>
                <h3 className="font-bold mb-2">{feat.title}</h3>
                <p className="text-sm text-white/50">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 md:py-24 px-6 md:px-10 bg-white/2">
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8">
          {STATS.map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl md:text-4xl font-black bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">{stat.val}</div>
              <div className="text-xs text-white/40 uppercase tracking-widest mt-2">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* About */}
      <section className="py-20 md:py-28 px-6 md:px-10">
        <div className="max-w-3xl mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#4845D4] to-[#7B5CF0] flex items-center justify-center font-black text-xl shadow-lg mb-6">W</div>
          <h2 className="text-3xl md:text-4xl font-black mb-4">About Wissen</h2>
          <p className="text-white/55 leading-relaxed mb-4">Wissen Technologies has delivered $1 billion in projects for Fortune 500 companies across banking, telecom, healthcare, and manufacturing. Founded in 2000, we bring 25 years of world-class technology expertise to the modern workplace.</p>
          <p className="text-white/55 leading-relaxed">With 4000+ skilled professionals across 7 global offices, we're committed to making office booking as intelligent and seamless as possible.</p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 px-6 md:px-10 bg-gradient-to-b from-[#0d1020] to-[#050810] text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black mb-4">Ready to transform your office?</h2>
          <p className="text-lg text-white/50 mb-8">Join employees booking smarter every single day.</p>
          <Link href="/login">
            <button className="px-8 py-3.5 bg-gradient-to-br from-[#4845D4] to-[#7B5CF0] rounded-full font-semibold hover:shadow-2xl hover:shadow-[#4845D4]/60 transition-all">Start Now →</button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/6 px-6 md:px-10 py-8 text-center text-sm text-white/35">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center gap-2.5 mb-4">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#4845D4] to-[#7B5CF0] flex items-center justify-center font-black text-xs">W</div>
            <span className="font-black text-xs tracking-widest">WISSEN</span>
          </div>
          <p>© 2025 Wissen Technology. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
