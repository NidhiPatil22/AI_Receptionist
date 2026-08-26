import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { BarChart3, RefreshCw } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';

export const AnalyticsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [charts, setCharts] = useState<any>(null);

  const fetchAnalytics = async () => {
    try {
      const data = await api.analytics.get();
      setStats(data.stats);
      setCharts(data.charts);
    } catch (err) {
      console.error('Failed to fetch analytics metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="p-12 text-center text-xs font-bold text-[#A582B8] flex items-center justify-center gap-2">
        <RefreshCw className="w-5 h-5 animate-spin" /> Loading analytics dashboards...
      </div>
    );
  }

  // Pastel Color Map for Recharts Cell Fills
  const PASTEL_COLORS = ['#D0E1FD', '#E8DFF5', '#FFE5EC', '#FCF6BD', '#FCEADE'];

  return (
    <div className="space-y-6 fade-in-load">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl md:text-3xl text-[#2E1E38] flex items-center gap-2">
          <BarChart3 className="w-7 h-7 text-[#A582B8]" /> Reception Analytics
        </h1>
        <p className="text-xs font-semibold text-[#8C7B93]">
          Analyze incoming traffic volume, auto-answer performance metrics, and channel distributions.
        </p>
      </div>

      {/* Stats Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Conversations Handled', value: stats?.totalConversations || 15, sub: 'Total phone/chats' },
          { label: 'AI Auto-Response Rate', value: `${stats?.aiHandlingRate || 94}%`, sub: 'No human steps needed' },
          { label: 'Avg AI Response Speed', value: '2.4s', sub: 'Instant receptionist time' },
          { label: 'Urgency Escalations', value: stats?.escalationsCount || 3, sub: 'Required human takeover' },
        ].map((item, idx) => (
          <div key={idx} className="bg-[#FFFBF7] border-2 border-[#2E1E38] rounded-2xl p-5 shadow-sm">
            <span className="text-[10px] font-bold text-[#A582B8] uppercase tracking-wider block mb-1">
              {item.label}
            </span>
            <span className="font-display text-2xl md:text-3xl text-[#2E1E38] block mb-1">
              {item.value}
            </span>
            <span className="text-[9px] text-[#8C7B93] font-semibold">{item.sub}</span>
          </div>
        ))}
      </div>

      {/* Timelines Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Calls timeline Area chart */}
        <div className="bg-[#FFFBF7] border-2 border-[#2E1E38] rounded-3xl p-5 shadow-sm space-y-4">
          <h3 className="font-display text-base text-[#2E1E38]">Simulated Voice Calls (Daily)</h3>
          <div className="h-64 text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts?.callsOverTime || []} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="callsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D0E1FD" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#D0E1FD" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#2E1E38" fontSize={9} fontWeight="bold" />
                <YAxis stroke="#2E1E38" fontSize={9} fontWeight="bold" />
                <Tooltip />
                <Area type="monotone" dataKey="calls" stroke="#4B88E3" strokeWidth={2} fillOpacity={1} fill="url(#callsGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Message Traffic Bar chart */}
        <div className="bg-[#FFFBF7] border-2 border-[#2E1E38] rounded-3xl p-5 shadow-sm space-y-4">
          <h3 className="font-display text-base text-[#2E1E38]">Message Traffic Volume (Daily)</h3>
          <div className="h-64 text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.messagesOverTime || []} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <XAxis dataKey="date" stroke="#2E1E38" fontSize={9} fontWeight="bold" />
                <YAxis stroke="#2E1E38" fontSize={9} fontWeight="bold" />
                <Tooltip />
                <Bar dataKey="messages" fill="#E8DFF5" stroke="#2E1E38" strokeWidth={1.5} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* PIE breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Channel Splits */}
        <div className="bg-[#FFFBF7] border-2 border-[#2E1E38] rounded-3xl p-5 shadow-sm flex flex-col justify-between">
          <h3 className="font-display text-base text-[#2E1E38] mb-4">Traffic Channel Share</h3>
          <div className="h-56 text-xs flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts?.channelsData || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {(charts?.channelsData || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={PASTEL_COLORS[index % PASTEL_COLORS.length]} stroke="#2E1E38" strokeWidth={1.5} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Custom legend */}
          <div className="flex flex-wrap gap-2 justify-center pt-2 text-[10px] font-bold text-[#52405A]">
            {(charts?.channelsData || []).map((entry: any, index: number) => (
              <span key={entry.name} className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded border border-[#2E1E38]" style={{ backgroundColor: PASTEL_COLORS[index % PASTEL_COLORS.length] }} />
                {entry.name} ({entry.value})
              </span>
            ))}
          </div>
        </div>

        {/* AI handling rates */}
        <div className="bg-[#FFFBF7] border-2 border-[#2E1E38] rounded-3xl p-5 shadow-sm flex flex-col justify-between">
          <h3 className="font-display text-base text-[#2E1E38] mb-4">Auto Handling Resolution</h3>
          <div className="h-56 text-xs flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts?.handlingData || []}
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                  dataKey="value"
                >
                  {(charts?.handlingData || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={PASTEL_COLORS[(index + 1) % PASTEL_COLORS.length]} stroke="#2E1E38" strokeWidth={1.5} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Custom legend */}
          <div className="flex justify-center gap-4 pt-2 text-[10px] font-bold text-[#52405A]">
            {(charts?.handlingData || []).map((entry: any, index: number) => (
              <span key={entry.name} className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded border border-[#2E1E38]" style={{ backgroundColor: PASTEL_COLORS[(index + 1) % PASTEL_COLORS.length] }} />
                {entry.name}
              </span>
            ))}
          </div>
        </div>

        {/* Urgency distributions */}
        <div className="bg-[#FFFBF7] border-2 border-[#2E1E38] rounded-3xl p-5 shadow-sm flex flex-col justify-between">
          <h3 className="font-display text-base text-[#2E1E38] mb-4">Urgency Distribution</h3>
          <div className="h-56 text-xs flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts?.urgencyDistribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  dataKey="value"
                >
                  {(charts?.urgencyDistribution || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={PASTEL_COLORS[(index + 2) % PASTEL_COLORS.length]} stroke="#2E1E38" strokeWidth={1.5} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Custom legend */}
          <div className="flex flex-wrap gap-2 justify-center pt-2 text-[10px] font-bold text-[#52405A]">
            {(charts?.urgencyDistribution || []).map((entry: any, index: number) => (
              <span key={entry.name} className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded border border-[#2E1E38]" style={{ backgroundColor: PASTEL_COLORS[(index + 2) % PASTEL_COLORS.length] }} />
                {entry.name} ({entry.value})
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default AnalyticsPage;
