import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import DashboardOverview from './pages/DashboardOverview';
import ConversationsInbox from './pages/ConversationsInbox';
import AIReceptionistPage from './pages/AIReceptionistPage';
import KnowledgeBasePage from './pages/KnowledgeBasePage';
import BusinessSettingsPage from './pages/BusinessSettingsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import Mascot from './components/Mascot';
import { api } from './services/api';
import { NotificationAlert } from './types';
import { Home, MessageSquare, BookOpen, Settings, BarChart3, ShieldAlert, LogOut, Bell, Menu, X, ArrowUpRight } from 'lucide-react';

// --- Protected Dashboard Layout Wrapper ---
const DashboardLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [token, setToken] = useState(localStorage.getItem('reception_token'));
  const [businessName, setBusinessName] = useState(() => {
    const biz = localStorage.getItem('reception_business');
    return biz ? JSON.parse(biz).name : '';
  });
  const [notifications, setNotifications] = useState<NotificationAlert[]>([]);
  const [showBellMenu, setShowBellMenu] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Toast notifications for real-time alerts
  const [toast, setToast] = useState<NotificationAlert | null>(null);

  // Sign out helper
  const handleLogout = () => {
    localStorage.clear();
    setToken(null);
    navigate('/login');
  };

  const fetchAlerts = async () => {
    try {
      const list = await api.notifications.list();
      
      // If we got a new unread notification, display a toast pop-up!
      const unread = list.filter((n: any) => !n.isRead);
      if (unread.length > notifications.filter(n => !n.isRead).length && unread.length > 0) {
        const newest = unread[0];
        setToast(newest);
        // Clear toast after 5 seconds
        setTimeout(() => setToast(null), 5000);
      }

      setNotifications(list);
    } catch (err) {
      console.error('Failed to sync notifications:', err);
    }
  };

  useEffect(() => {
    if (!token) return;

    // Load fresh business details from API
    const loadFreshBusiness = async () => {
      try {
        const biz = await api.business.getProfile();
        if (biz) {
          setBusinessName(biz.name);
          localStorage.setItem('reception_business', JSON.stringify(biz));
        }
      } catch (err) {
        console.error('Failed to sync business in layout:', err);
      }
    };

    loadFreshBusiness();
    fetchAlerts();
    // Poll for new simulated messages/calls every 8 seconds
    const interval = setInterval(fetchAlerts, 8000);
    return () => clearInterval(interval);
  }, [token]);

  const handleReadAlert = async (id: string, conversationId?: string) => {
    try {
      await api.notifications.read(id);
      setShowBellMenu(false);
      fetchAlerts();
      if (conversationId) {
        navigate(`/dashboard/conversations?id=${conversationId}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReadAllAlerts = async () => {
    try {
      await api.notifications.readAll();
      fetchAlerts();
    } catch (err) {
      console.error(err);
    }
  };

  // If no token exists, redirect to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const sidebarLinks = [
    { to: '/dashboard', label: 'Overview Plan', icon: Home },
    { to: '/dashboard/conversations', label: 'Unified Inbox', icon: MessageSquare },
    { to: '/dashboard/receptionist', label: 'AI Receptionist', icon: ShieldAlert },
    { to: '/dashboard/faqs', label: 'Knowledge Base', icon: BookOpen },
    { to: '/dashboard/settings', label: 'Business Hours', icon: Settings },
    { to: '/dashboard/analytics', label: 'Analytics Panel', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-[#FAF6F0] text-[#2E1E38] flex flex-col selection:bg-[#FCE1E4]">
      {/* Top Header Bar */}
      <header className="bg-[#FFFBF7] border-b-2 border-[#2E1E38] h-16 px-6 flex items-center justify-between shrink-0 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 hover:bg-[#FAF6F0] rounded-lg lg:hidden">
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          
          <Link to="/dashboard" className="flex items-center gap-2 group">
            <Mascot state="happy" size={38} className="transition-transform group-hover:rotate-12" />
            <span className="font-display text-lg tracking-tight text-[#2E1E38]">
              Reception<span className="text-[#A582B8]">AI</span>
            </span>
          </Link>
          
          <span className="hidden sm:inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E8DFF5] border border-[#2E1E38]">
            Studio: {businessName}
          </span>
        </div>

        {/* Notifications and profile buttons */}
        <div className="flex items-center gap-3 relative">
          {/* Notifications bell */}
          <div className="relative">
            <button
              onClick={() => setShowBellMenu(!showBellMenu)}
              className="p-2 rounded-full border-2 border-[#2E1E38] bg-white hover:bg-[#FAF6F0] transition-colors relative"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-[-3px] right-[-3px] w-4.5 h-4.5 rounded-full bg-[#FCE1E4] border border-[#2E1E38] text-[9px] font-bold text-red-600 flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications panel dropdown */}
            {showBellMenu && (
              <div className="absolute right-0 mt-2.5 w-72 bg-[#FFFBF7] border-2 border-[#2E1E38] rounded-2xl shadow-soft-card overflow-hidden z-50 py-2">
                <div className="px-4 py-2 border-b border-[#2E1E38]/10 flex items-center justify-between">
                  <span className="text-xs font-bold text-[#2E1E38]">Notifications</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleReadAllAlerts}
                      className="text-[9px] font-bold text-[#A582B8] hover:text-[#2E1E38] underline"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                
                <div className="max-h-60 overflow-y-auto divide-y divide-[#2E1E38]/5">
                  {notifications.length === 0 ? (
                    <p className="text-[10px] font-semibold text-[#8C7B93] text-center py-6">No notifications.</p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => handleReadAlert(n.id, n.conversationId)}
                        className={`p-3 text-left hover:bg-[#FAF6F0] cursor-pointer transition-colors text-xs space-y-0.5 ${
                          !n.isRead ? 'bg-[#FFE5EC]/30 font-semibold' : ''
                        }`}
                      >
                        <div className="flex justify-between items-start gap-1">
                          <span className="font-bold text-[#2E1E38]">{n.title}</span>
                          {!n.isRead && <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 mt-1" />}
                        </div>
                        <p className="text-[10px] text-[#8C7B93] truncate">{n.message}</p>
                        <span className="text-[8px] text-gray-400 block pt-0.5">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="p-2 rounded-full border-2 border-[#2E1E38] bg-[#FCE1E4] hover:bg-[#FCA3B7]/40 text-[#2E1E38] transition-colors cursor-pointer"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Side Sidebar */}
        <aside
          className={`bg-[#FFFBF7] border-r-2 border-[#2E1E38] w-52 shrink-0 py-6 px-4 space-y-1.5 transition-all z-30 fixed inset-y-16 left-0 lg:static ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-0 lg:px-0 lg:border-r-0 lg:overflow-hidden'
          }`}
        >
          {sidebarLinks.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-full border-2 text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-[#E8DFF5] border-[#2E1E38] text-[#2E1E38] shadow-[0_2px_0px_0px_#2E1E38]'
                    : 'bg-transparent border-transparent text-[#8C7B93] hover:text-[#2E1E38]'
                }`}
              >
                <link.icon className="w-4.5 h-4.5" />
                {link.label}
              </Link>
            );
          })}
          
          <div className="pt-6 border-t border-[#2E1E38]/10 text-center space-y-2">
            <Mascot state="happy" size={70} />
            <p className="text-[10px] font-bold text-[#A582B8] uppercase">AI Companion</p>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 relative">
          <Outlet />

          {/* Gorgeous Blush Pink Floating Toast Alert for Urgent Events */}
          {toast && (
            <div
              onClick={() => handleReadAlert(toast.id, toast.conversationId)}
              className="fixed bottom-6 right-6 z-50 bg-[#FFE5EC] border-3 border-[#2E1E38] rounded-3xl p-4.5 max-w-sm shadow-soft-card cursor-pointer hover:scale-102 transition-all animate-bounce"
            >
              <div className="flex gap-3">
                <span className="text-2xl mt-0.5">🚨</span>
                <div className="space-y-1 flex-1">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-[#A582B8]">Urgent Request Alert</span>
                  <h5 className="font-display text-sm text-[#2E1E38] leading-tight">{toast.title}</h5>
                  <p className="text-xs font-semibold text-[#52405A] leading-relaxed">{toast.message}</p>
                  <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-[#A582B8] pt-1">
                    Click to resolve chat <ArrowUpRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

// --- Main App Route Router mapping ---
const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/signup" element={<AuthPage mode="signup" />} />
        
        {/* Nesting dashboard endpoints inside the protected Layout */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardOverview />} />
          <Route path="conversations" element={<ConversationsInbox />} />
          <Route path="receptionist" element={<AIReceptionistPage />} />
          <Route path="faqs" element={<KnowledgeBasePage />} />
          <Route path="settings" element={<BusinessSettingsPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
        </Route>

        {/* Fallback to landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
export default App;
