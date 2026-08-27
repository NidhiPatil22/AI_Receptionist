import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Mascot from '../components/Mascot';
import { api } from '../services/api';
import { Mail, Lock, User, Briefcase, Heart } from 'lucide-react';

interface AuthPageProps {
  mode: 'login' | 'signup';
}

export const AuthPage: React.FC<AuthPageProps> = ({ mode }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let data;
      if (mode === 'signup') {
        data = await api.auth.signup({ email, password, name, businessName });
      } else {
        data = await api.auth.login({ email, password });
      }

      localStorage.setItem('reception_token', data.token);
      localStorage.setItem('reception_user', JSON.stringify(data.user));
      localStorage.setItem('reception_business', JSON.stringify(data.business));
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartDemo = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.auth.continueWithDemo();
      localStorage.setItem('reception_token', data.token);
      localStorage.setItem('reception_user', JSON.stringify(data.user));
      localStorage.setItem('reception_business', JSON.stringify(data.business));
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Could not establish simulation session.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0] flex flex-col justify-center py-12 px-6 lg:px-8 relative overflow-hidden selection:bg-[#FCE1E4]">
      {/* Background blobs */}
      <div className="absolute top-[10%] right-[-10%] w-[35vw] h-[35vw] rounded-full bg-[#E8DFF5] opacity-40 blur-[80px] pointer-events-none" />
      <div className="absolute bottom-[10%] left-[-10%] w-[35vw] h-[35vw] rounded-full bg-[#FFE5EC] opacity-40 blur-[80px] pointer-events-none" />

      {/* Main card */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex flex-col items-center mb-6">
          <Link to="/" className="flex items-center gap-2 group mb-4">
            <Mascot state="happy" size={54} className="transition-transform group-hover:scale-105" />
            <span className="font-display text-2xl text-[#2E1E38] tracking-tight">
              Reception<span className="text-[#A582B8]">AI</span>
            </span>
          </Link>
          <h2 className="text-center font-display text-2xl text-[#2E1E38]">
            {mode === 'signup' ? 'Create your command center ♡' : 'Welcome back to front desk ✨'}
          </h2>
        </div>

        <div className="bg-[#FFFBF7] border-2 border-[#2E1E38] rounded-3xl p-8 shadow-soft-card">
          {error && (
            <div className="mb-4 p-3.5 bg-[#FCE1E4] border border-red-300 rounded-xl text-xs font-bold text-red-700">
              🚨 {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-[#A582B8] uppercase tracking-wider mb-1.5">
                    Your Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A582B8]">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="Dr. Sarah Bloom"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="block w-full pl-10 pr-4 py-2.5 rounded-full border-2 border-[#2E1E38] bg-[#FAF6F0] text-sm text-[#2E1E38] placeholder-gray-400 focus:outline-none focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#A582B8] uppercase tracking-wider mb-1.5">
                    Business Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A582B8]">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="Bloom Dental Studio"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="block w-full pl-10 pr-4 py-2.5 rounded-full border-2 border-[#2E1E38] bg-[#FAF6F0] text-sm text-[#2E1E38] placeholder-gray-400 focus:outline-none focus:bg-white transition-colors"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-[#A582B8] uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A582B8]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="admin@bloomdental.studio"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2.5 rounded-full border-2 border-[#2E1E38] bg-[#FAF6F0] text-sm text-[#2E1E38] placeholder-gray-400 focus:outline-none focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#A582B8] uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A582B8]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2.5 rounded-full border-2 border-[#2E1E38] bg-[#FAF6F0] text-sm text-[#2E1E38] placeholder-gray-400 focus:outline-none focus:bg-white transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-3 rounded-full text-sm font-bold bg-[#E4C1F9] hover:bg-[#D9D2EC] text-[#2E1E38] border-2 border-[#2E1E38] shadow-cute-border active:translate-y-[2px] active:shadow-[0_2px_0px_0px_#2E1E38] transition-all cursor-pointer flex items-center justify-center gap-1"
            >
              {loading ? 'Authenticating...' : mode === 'signup' ? 'Create Account ✨' : 'Enter Dashboard 🌸'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t-2 border-[#2E1E38]/10"></div>
            </div>
            <div className="relative flex justify-center text-xs font-bold uppercase">
              <span className="bg-[#FFFBF7] px-3.5 text-[#A582B8]">or explore instantly</span>
            </div>
          </div>

          <button
            onClick={handleStartDemo}
            disabled={loading}
            className="w-full py-3 rounded-full text-sm font-bold bg-[#FFE5EC] hover:bg-[#FCA3B7]/30 text-[#2E1E38] border-2 border-[#2E1E38] hover:shadow-cute-border transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            Dr. Bloom Demo Bypass 🔑
          </button>
        </div>

        <p className="mt-6 text-center text-xs font-semibold text-[#A582B8]">
          {mode === 'signup' ? (
            <span>
              Already have an account?{' '}
              <Link to="/login" className="text-[#2E1E38] underline font-bold hover:text-[#52405A]">
                Sign In here
              </Link>
            </span>
          ) : (
            <span>
              New to ReceptionAI?{' '}
              <Link to="/signup" className="text-[#2E1E38] underline font-bold hover:text-[#52405A]">
                Register Business here
              </Link>
            </span>
          )}
        </p>
      </div>
    </div>
  );
};
export default AuthPage;
