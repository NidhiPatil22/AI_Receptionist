import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Mascot from '../components/Mascot';
import { Phone, MessageSquare, ShieldAlert, Sparkles, BookOpen, BarChart3, Clock, MapPin, Heart } from 'lucide-react';
import { api } from '../services/api';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleStartDemo = async () => {
    try {
      const data = await api.auth.continueWithDemo();
      localStorage.setItem('reception_token', data.token);
      localStorage.setItem('reception_user', JSON.stringify(data.user));
      localStorage.setItem('reception_business', JSON.stringify(data.business));
      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to trigger demo:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0] text-[#2E1E38] relative overflow-hidden selection:bg-[#FCE1E4]">
      {/* Decorative Pastel Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#E8DFF5] opacity-40 blur-[80px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-[#FFE5EC] opacity-50 blur-[100px] pointer-events-none" />
      <div className="absolute top-[40%] right-[-20%] w-[35vw] h-[35vw] rounded-full bg-[#FCF6BD] opacity-35 blur-[90px] pointer-events-none" />

      {/* Navigation Bar */}
      <header className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between relative z-10">
        <Link to="/" className="flex items-center gap-2.5 group">
          <Mascot state="happy" size={48} className="transition-transform group-hover:scale-110" />
          <span className="font-display text-2xl tracking-tight text-[#2E1E38] flex items-center gap-1">
            Reception<span className="text-[#A582B8]">AI</span>
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 font-medium text-[#52405A]">
          <a href="#how-it-works" className="hover:text-[#2E1E38] transition-colors">How it works</a>
          <a href="#features" className="hover:text-[#2E1E38] transition-colors">Features</a>
          <a href="#about" className="hover:text-[#2E1E38] transition-colors">Community</a>
        </nav>
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="px-5 py-2.5 rounded-full font-medium text-[#2E1E38] border-2 border-transparent hover:border-[#2E1E38] transition-all bg-[#FFFBF7] shadow-sm"
          >
            Sign In
          </Link>
          <button
            onClick={handleStartDemo}
            className="px-6 py-2.5 rounded-full font-medium bg-[#E8DFF5] hover:bg-[#D9D2EC] text-[#2E1E38] border-2 border-[#2E1E38] shadow-cute-border active:translate-y-[2px] active:shadow-[0_2px_0px_0px_#2E1E38] transition-all flex items-center gap-1.5"
          >
            Try Demo ✨
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-6 pt-12 pb-24 text-center relative z-10 flex flex-col items-center">
        {/* Tiny Sparkle Badges */}
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#FFE5EC] border border-[#FCA3B7] text-[#52405A] text-xs font-semibold uppercase tracking-wider mb-6 animate-pulse-slow">
          <Sparkles className="w-3.5 h-3.5 text-[#A582B8]" />
          Meet Your Business's New Bestie
        </div>

        {/* Core Headline */}
        <h1 className="font-display text-4xl sm:text-6xl text-[#2E1E38] leading-[1.1] max-w-3xl mb-6">
          Meet your new favorite receptionist <span className="text-[#A582B8]">✨</span>
        </h1>

        <p className="text-lg sm:text-xl text-[#52405A] max-w-2xl leading-relaxed mb-10 font-medium">
          A tiny, adorable AI assistant that answers your business phone calls, replies to customer DMs, takes messages, and knows exactly when to bring you in.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-16 relative">
          <button
            onClick={handleStartDemo}
            className="px-8 py-4 rounded-full text-lg font-bold bg-[#E4C1F9] hover:bg-[#D9C4FF] text-[#2E1E38] border-2 border-[#2E1E38] shadow-cute-border active:translate-y-[4px] active:shadow-none transition-all flex items-center justify-center gap-2 group cursor-pointer"
          >
            Launch Free Demo Mode
            <Sparkles className="w-5 h-5 text-[#2E1E38] group-hover:rotate-12 transition-transform" />
          </button>
          <Link
            to="/signup"
            className="px-8 py-4 rounded-full text-lg font-bold bg-[#FFFBF7] hover:bg-[#FAF6F0] text-[#2E1E38] border-2 border-[#2E1E38] hover:shadow-cute-border transition-all flex items-center justify-center"
          >
            Register Business
          </Link>
        </div>

        {/* Pinterest Moodboard Interactive Mascot / Hero Layout */}
        <div className="w-full max-w-4xl relative mt-4">
          <div className="absolute top-[20%] left-[-5%] bg-[#FFFBF7] border-2 border-[#2E1E38] p-4 rounded-2xl shadow-sm text-left max-w-[200px] hidden lg:block rotate-[-6deg]">
            <div className="flex items-center gap-1.5 text-xs text-[#A582B8] font-bold mb-1 uppercase tracking-wider">
              <Phone className="w-3 h-3" /> Voice Call
            </div>
            <p className="text-xs font-semibold text-[#52405A]">
              "Hi Bloom Dental! Can I schedule a cleaning tomorrow morning?"
            </p>
          </div>

          <div className="absolute bottom-[20%] right-[-5%] bg-[#FFFBF7] border-2 border-[#2E1E38] p-4 rounded-2xl shadow-sm text-left max-w-[220px] hidden lg:block rotate-[6deg]">
            <div className="flex items-center gap-1.5 text-xs text-[#F59E0B] font-bold mb-1 uppercase tracking-wider">
              <ShieldAlert className="w-3 h-3 text-[#A582B8]" /> Urgency Tag
            </div>
            <p className="text-xs font-semibold text-[#52405A]">
              "🚨 Double charge detected. System escalated to business manager review."
            </p>
          </div>

          {/* Central Showcase Card */}
          <div className="bg-[#FFFBF7] border-3 border-[#2E1E38] rounded-[32px] p-8 md:p-12 shadow-soft-card max-w-2xl mx-auto relative z-10 flex flex-col items-center">
            {/* Mascot Center Stage */}
            <div className="w-40 h-40 bg-[#FAF6F0] rounded-full border-2 border-[#2E1E38] flex items-center justify-center p-4 shadow-sm mb-6 relative">
              <Mascot state="wave" size={130} />
              {/* Soft decorative elements */}
              <div className="absolute top-[-5px] right-[-5px] bg-[#FCF6BD] text-xs font-bold px-2 py-0.5 rounded-full border border-[#2E1E38] rotate-[12deg] shadow-sm">
                Hi! ♡
              </div>
            </div>

            <div className="w-full bg-[#FAF6F0] rounded-2xl border-2 border-[#2E1E38] p-4 mb-4 text-left max-w-md">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-ping" />
                <span className="text-xs font-bold text-[#A582B8] uppercase">Receptionist Live Feed</span>
              </div>
              <div className="space-y-3 text-sm">
                <p className="font-semibold text-[#2E1E38]">
                  💬 Customer: <span className="font-medium text-[#52405A]">Do you take Delta Dental insurance?</span>
                </p>
                <p className="font-semibold text-[#A582B8]">
                  🤖 ReceptionAI: <span className="font-medium text-[#52405A]">Yes! Bloom Dental Studio accepts all Delta Dental PPO plans. I can verify your benefits when booking!</span>
                </p>
              </div>
            </div>

            <div className="text-xs font-bold text-[#A582B8] flex items-center gap-1.5">
              <span>94% conversations auto-handled</span>
              <span>•</span>
              <span>2.4s average response</span>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-6 py-20 border-t border-[#E8DFF5] relative z-10">
        <h2 className="font-display text-3xl sm:text-4xl text-center text-[#2E1E38] mb-12">
          How ReceptionAI makes life cozy 🌸
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              step: '01',
              title: 'Customer Connects',
              color: '#E8DFF5',
              desc: 'Customers dial your dedicated number or message you on WhatsApp, SMS, Instagram, or Web Chat.',
            },
            {
              step: '02',
              title: 'AI Front Desk Handles It',
              color: '#FFE5EC',
              desc: 'Our adorable AI Mascot references your profile settings and FAQs database to chat or call with natural answers.',
            },
            {
              step: '03',
              title: 'Escalates when Urgent',
              color: '#FCF6BD',
              desc: 'If the customer asks a complex question, needs booking support, or flags an emergency, it instantly alerts you.',
            },
          ].map((item, idx) => (
            <div key={idx} className="bg-[#FFFBF7] border-2 border-[#2E1E38] rounded-2xl p-8 relative shadow-sm">
              <div
                className="w-12 h-12 rounded-full border-2 border-[#2E1E38] flex items-center justify-center font-display text-xl font-bold mb-6"
                style={{ backgroundColor: item.color }}
              >
                {item.step}
              </div>
              <h3 className="font-display text-xl text-[#2E1E38] mb-3">{item.title}</h3>
              <p className="text-sm font-medium text-[#52405A] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Product Features Grid */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-20 border-t border-[#E8DFF5] relative z-10">
        <h2 className="font-display text-3xl sm:text-4xl text-center text-[#2E1E38] mb-4">
          A cute suite of SaaS features 🍬
        </h2>
        <p className="text-center text-[#52405A] max-w-xl mx-auto font-medium mb-12">
          Say goodbye to boring corporate software. ReceptionAI is a cozy dashboard styled like a Pinterest planner, loaded with serious capabilities.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: Phone,
              title: 'AI Voice Calling',
              color: 'bg-[#D0E1FD]',
              desc: 'Initiates and accepts simulated phone calls. Generates spoken responses and logs transcripts in real-time.',
            },
            {
              icon: MessageSquare,
              title: 'Unified Inbox Channels',
              color: 'bg-[#E8DFF5]',
              desc: 'Consolidates messages from SMS, WhatsApp, Instagram, and web chats into one gorgeous conversation planner.',
            },
            {
              icon: ShieldAlert,
              title: 'Smart Urgency Tagging',
              color: 'bg-[#FCE1E4]',
              desc: 'Classifies inquiries instantly into normal, important, or urgent. Alerts you immediately to double charges or emergency pain.',
            },
            {
              icon: BookOpen,
              title: 'FAQ Knowledge Base',
              color: 'bg-[#FCF6BD]',
              desc: 'Teach the receptionist everything. Easily add, edit, and search FAQs to keep your AI assistant fully aligned.',
            },
            {
              icon: BarChart3,
              title: 'Pastel Analytics',
              color: 'bg-[#FFE5EC]',
              desc: 'Monitor call counts, channel splits, customer volume, and AI handling success rates with soft-rounded custom graphs.',
            },
            {
              icon: Clock,
              title: 'Business Hours Sync',
              color: 'bg-[#FAF6F0]',
              desc: 'Manage weekly opening hours. The AI dynamically lets customers know if you are currently open or closed.',
            },
          ].map((feat, idx) => (
            <div key={idx} className="bg-[#FFFBF7] border-2 border-[#2E1E38] rounded-2xl p-6 shadow-sm hover:translate-y-[-2px] transition-transform">
              <div className={`w-10 h-10 rounded-xl border border-[#2E1E38] ${feat.color} flex items-center justify-center mb-4`}>
                <feat.icon className="w-5 h-5 text-[#2E1E38]" />
              </div>
              <h3 className="font-display text-lg text-[#2E1E38] mb-2">{feat.title}</h3>
              <p className="text-xs font-semibold text-[#52405A] leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Footer */}
      <section className="bg-[#FFE5EC] border-y-3 border-[#2E1E38] py-16 px-6 relative text-center">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <h2 className="font-display text-3xl sm:text-5xl text-[#2E1E38] mb-4">
            Let AI handle the front desk!
          </h2>
          <p className="text-sm font-semibold text-[#52405A] max-w-lg mb-8">
            Step back and focus on your business. Let our adorable mascot take care of questions, messages, and calls with a friendly tone.
          </p>
          <button
            onClick={handleStartDemo}
            className="px-8 py-4 rounded-full text-lg font-bold bg-[#E4C1F9] hover:bg-[#D9C4FF] text-[#2E1E38] border-2 border-[#2E1E38] shadow-cute-border active:translate-y-[4px] active:shadow-none transition-all flex items-center gap-1.5 cursor-pointer"
          >
            Launch Demo Dashboard ✨
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 text-center text-xs font-semibold text-[#8C7B93] relative z-10 flex items-center justify-center gap-1">
        <span>© {new Date().getFullYear()} ReceptionAI. Made with</span>
        <Heart className="w-3.5 h-3.5 fill-[#FCA3B7] stroke-[#FCA3B7]" />
        <span>for dental clinics and small studios.</span>
      </footer>
    </div>
  );
};
export default LandingPage;
