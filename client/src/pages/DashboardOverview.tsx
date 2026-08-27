import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Mascot from '../components/Mascot';
import { api } from '../services/api';
import { Conversation, NotificationAlert } from '../types';
import { Phone, MessageSquare, AlertCircle, Sparkles, User, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export const DashboardOverview: React.FC = () => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [notifications, setNotifications] = useState<NotificationAlert[]>([]);
  const [stats, setStats] = useState<any>({
    totalConversations: 0,
    urgentConversations: 0,
    totalCalls: 0,
    missedCalls: 0,
    totalMessages: 0,
    aiHandlingRate: 100,
    avgResponseTime: '2.4s',
  });
  const [loading, setLoading] = useState(true);
  const [businessName, setBusinessName] = useState('Bloom Dental Studio');
  const [ownerName, setOwnerName] = useState('Dr. Sarah Bloom');
  const [receptionistName, setReceptionistName] = useState('Bloomie');
  const [receptionistActive, setReceptionistActive] = useState(true);

  const fetchData = async () => {
    try {
      // Load user details cache
      const userData = localStorage.getItem('reception_user');
      if (userData) {
        setOwnerName(JSON.parse(userData).name);
      }

      // Fetch conversations, notifications, analytics, and settings
      const [convList, alerts, metrics, bizProfile] = await Promise.all([
        api.conversations.list(),
        api.notifications.list(),
        api.analytics.get(),
        api.business.getProfile(),
      ]);

      setConversations(convList.slice(0, 5)); // Show top 5 recent
      setNotifications(alerts.slice(0, 4)); // Show recent alerts
      setStats(metrics.stats);
      if (bizProfile) {
        setBusinessName(bizProfile.name);
        setReceptionistName(bizProfile.receptionistName || 'Bloomie');
        setReceptionistActive(bizProfile.receptionistActive ?? true);
        localStorage.setItem('reception_business', JSON.stringify(bizProfile));
      }
    } catch (err) {
      console.error('Failed to load dashboard overview data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Poll updates every 15 seconds to simulate real-time interaction
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleTakeover = async (id: string) => {
    try {
      await api.conversations.takeover(id);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#E4C1F9', '#D0E1FD', '#FFE5EC'],
      });
      fetchData();
      navigate(`/dashboard/conversations?id=${id}`);
    } catch (err) {
      console.error('Failed to execute takeover:', err);
    }
  };

  const handleResolve = async (id: string) => {
    try {
      await api.conversations.resolve(id, 'resolved');
      confetti({
        particleCount: 50,
        spread: 40,
        colors: ['#FCF6BD', '#FCEADE'],
      });
      fetchData();
    } catch (err) {
      console.error('Failed to resolve conversation:', err);
    }
  };

  const urgentQueue = conversations.filter(c => c.urgency === 'urgent' && c.status === 'active');

  const getChannelBadgeColor = (channel: string) => {
    switch (channel) {
      case 'sms': return 'bg-[#FAF6F0] text-[#2E1E38]';
      case 'whatsapp': return 'bg-emerald-50 text-emerald-700';
      case 'instagram': return 'bg-pink-50 text-pink-700';
      case 'call': return 'bg-sky-50 text-sky-700';
      default: return 'bg-[#E8DFF5] text-[#2E1E38]';
    }
  };

  return (
    <div className="space-y-6 fade-in-load">
      {/* Welcome & AI Mascot Card */}
      <div className="bg-gradient-to-r from-[#E8DFF5] to-[#FFE5EC] border-2 border-[#2E1E38] rounded-3xl p-6 md:p-8 relative shadow-soft-card overflow-hidden flex flex-col md:flex-row items-center gap-6">
        <div className="relative z-10 flex-1 text-center md:text-left space-y-2.5">
          <h1 className="font-display text-2xl md:text-3.5xl text-[#2E1E38] leading-tight">
            {ownerName}'s Command Center ✨
          </h1>
          <p className="text-sm font-semibold text-[#52405A] max-w-xl">
            Good morning! Your receptionist, <strong>{receptionistName}</strong>, is currently {receptionistActive ? 'online and active' : 'paused/offline'}. She has handled {stats.totalConversations ?? 0} customer chats today with a {stats.aiHandlingRate ?? 100}% auto-resolution rate.
          </p>
          <div className="flex flex-wrap gap-2.5 justify-center md:justify-start pt-2">
            {receptionistActive ? (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white border border-[#2E1E38] text-xs font-bold text-green-600 shadow-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-ping" />
                🟢 Active Online
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white border border-[#2E1E38] text-xs font-bold text-amber-600 shadow-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                🟡 Paused / Offline
              </span>
            )}
            <Link
              to="/dashboard/receptionist"
              className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full bg-[#2E1E38] text-white hover:bg-[#52405A] text-xs font-bold transition-all shadow-sm"
            >
              Test Receptionist <Sparkles className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="w-36 h-36 flex items-center justify-center p-2 bg-white/40 rounded-3xl border border-white/60 shadow-inner">
          <Mascot state={receptionistActive ? "happy" : "idle"} size={110} />
        </div>
      </div>

      {/* Pastel Overview Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Conversations Today', val: stats.totalConversations ?? 0, col: 'bg-[#D0E1FD]', sub: 'Calls and DMs handled' },
          { title: 'AI Handled Rate', val: `${stats.aiHandlingRate ?? 100}%`, col: 'bg-[#FCF6BD]', sub: 'No human steps needed' },
          { title: 'Urgent Alerts', val: stats.urgentConversations ?? 0, col: 'bg-[#FCE1E4] text-red-900 border-red-300', sub: 'Require your review' },
          { title: 'Total Calls Answered', val: stats.totalCalls ?? 0, col: 'bg-[#E8DFF5]', sub: 'Simulated voice logs' },
        ].map((item, idx) => (
          <div key={idx} className={`${item.col} border-2 border-[#2E1E38] rounded-2xl p-5 shadow-sm`}>
            <div className="text-xs font-bold uppercase tracking-wider text-[#2E1E38]/60 mb-1">{item.title}</div>
            <div className="font-display text-3xl text-[#2E1E38] mb-1">{item.val}</div>
            <div className="text-[10px] font-semibold text-[#52405A]/80">{item.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Urgent Actions Queue */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl text-[#2E1E38] flex items-center gap-1.5">
              <span>🚨 Urgent Takeover Queue</span>
              {urgentQueue.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-[#FCE1E4] border border-[#2E1E38] text-xs font-bold text-red-600 animate-bounce">
                  {urgentQueue.length}
                </span>
              )}
            </h2>
          </div>

          {urgentQueue.length === 0 ? (
            <div className="bg-[#FFFBF7] border-2 border-dashed border-[#2E1E38]/30 rounded-2xl p-8 text-center text-[#8C7B93] flex flex-col items-center">
              <CheckCircle2 className="w-8 h-8 text-green-500 mb-2" />
              <p className="text-sm font-bold">Inbox fully resolved!</p>
              <p className="text-xs font-medium">Any incoming emergencies will appear immediately.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {urgentQueue.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#FFE5EC] border-2 border-[#2E1E38] rounded-2xl p-4 shadow-sm relative overflow-hidden group"
                >
                  <div className="absolute right-3 top-3 flex items-center gap-1 bg-[#FAF6F0] px-2 py-0.5 rounded-full border border-[#2E1E38] text-[10px] font-bold uppercase">
                    {item.channel}
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-display text-base text-[#2E1E38]">{item.customerName}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 uppercase">
                        Urgent Alert
                      </span>
                    </div>
                    <div className="p-2.5 bg-white/70 rounded-xl border border-[#2E1E38]/10 text-xs font-semibold text-[#52405A]">
                      <strong>Issue:</strong> {item.urgencyReason || 'Immediate review requested.'}
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-[10px] font-bold text-[#8C7B93] flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Last active: {new Date(item.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleResolve(item.id)}
                          className="px-3.5 py-1.5 rounded-full bg-[#FFFBF7] text-[#2E1E38] border border-[#2E1E38] text-xs font-bold hover:bg-[#FAF6F0] transition-colors cursor-pointer"
                        >
                          Resolve
                        </button>
                        <button
                          onClick={() => handleTakeover(item.id)}
                          className="px-4 py-1.5 rounded-full bg-[#E4C1F9] text-[#2E1E38] border border-[#2E1E38] text-xs font-bold hover:bg-[#D9D2EC] shadow-sm active:translate-y-[1px] transition-all cursor-pointer"
                        >
                          Take Over Chat
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Recent Conversations */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl text-[#2E1E38]">Recent Conversations</h2>
              <Link to="/dashboard/conversations" className="text-xs font-bold text-[#A582B8] hover:text-[#2E1E38] flex items-center gap-0.5">
                Go to Inbox <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="bg-[#FFFBF7] border-2 border-[#2E1E38] rounded-2xl divide-y-2 divide-[#2E1E38]/10 overflow-hidden shadow-sm">
              {conversations.length === 0 ? (
                <div className="p-6 text-center text-xs font-medium text-[#8C7B93]">No conversations found.</div>
              ) : (
                conversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => navigate(`/dashboard/conversations?id=${conv.id}`)}
                    className="p-4 hover:bg-[#FAF6F0] transition-colors cursor-pointer flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full border border-[#2E1E38] bg-[#E8DFF5] flex items-center justify-center font-display text-[#2E1E38]">
                        {(conv.customerName || 'U')[0]}
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-display text-sm text-[#2E1E38]">{conv.customerName || 'Anonymous Customer'}</span>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${getChannelBadgeColor(conv.channel)}`}>
                            {conv.channel}
                          </span>
                        </div>
                        <p className="text-xs text-[#8C7B93] truncate max-w-[200px] md:max-w-xs font-medium">
                          {conv.messages && conv.messages[0] ? conv.messages[0].content : 'No message history'}
                        </p>
                      </div>
                    </div>

                    <div className="text-right space-y-1">
                      <div className="text-[10px] font-bold text-[#8C7B93]">
                        {new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full border border-[#2E1E38] uppercase ${
                        conv.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {conv.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Panel: Alerts and Tips */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#FFFBF7] border-2 border-[#2E1E38] rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-display text-lg text-[#2E1E38] flex items-center gap-1.5">
              <span>🔔 Notification Center</span>
            </h3>

            <div className="space-y-3.5">
              {notifications.length === 0 ? (
                <p className="text-xs text-[#8C7B93] font-medium text-center py-6">No unread notifications.</p>
              ) : (
                notifications.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex gap-2.5 text-xs text-[#52405A] items-start border-b border-[#2E1E38]/10 pb-3 last:border-0 last:pb-0"
                  >
                    <span className="text-sm mt-0.5">
                      {alert.type === 'urgent_conversation' ? '🚨' : alert.type === 'missed_call' ? '📞' : '✉️'}
                    </span>
                    <div className="space-y-0.5 flex-1">
                      <p className="font-bold text-[#2E1E38]">{alert.title}</p>
                      <p className="font-medium text-[#8C7B93]">{alert.message}</p>
                      <span className="text-[9px] text-gray-400 font-bold block pt-0.5">
                        {new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-[#FCF6BD] border-2 border-[#2E1E38] rounded-3xl p-6 shadow-sm space-y-2 relative overflow-hidden">
            <div className="absolute right-[-15px] bottom-[-15px] text-5xl opacity-25">💡</div>
            <h4 className="font-display text-base text-[#2E1E38] flex items-center gap-1">
              <span>💡 Receptionist Tip</span>
            </h4>
            <p className="text-xs font-semibold text-[#52405A] leading-relaxed">
              If your receptionist doesn't know the answer to a question, make sure to add it to the <strong>Knowledge Base</strong>. Once saved, she will instantly start answering correctly!
            </p>
            <div className="pt-2">
              <Link
                to="/dashboard/faqs"
                className="text-xs font-bold text-[#2E1E38] underline hover:text-[#52405A]"
              >
                Manage FAQs →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default DashboardOverview;
