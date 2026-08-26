import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { Conversation, Message } from '../types';
import { Search, Phone, MessageSquare, AlertCircle, ShieldAlert, Check, RefreshCw, Send, Lock } from 'lucide-react';
import confetti from 'canvas-confetti';

export const ConversationsInbox: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeIdParam = searchParams.get('id');

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUrgency, setFilterUrgency] = useState('');
  const [filterChannel, setFilterChannel] = useState('');
  const [filterStatus, setFilterStatus] = useState('active');

  // Input states
  const [replyContent, setReplyContent] = useState('');
  const [isNote, setIsNote] = useState(false); // Toggle standard message vs internal note
  
  const [loadingList, setLoadingList] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);
  const [sending, setSending] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchList = async () => {
    try {
      const data = await api.conversations.list({
        status: filterStatus,
        urgency: filterUrgency,
        channel: filterChannel,
        search: searchTerm,
      });
      setConversations(data);
      
      // If we have an active param and selected is not set, load details
      if (activeIdParam && (!selectedConversation || selectedConversation.id !== activeIdParam)) {
        const activeConv = data.find((c: any) => c.id === activeIdParam);
        if (activeConv) {
          handleSelectConversation(activeConv);
        }
      }
    } catch (err) {
      console.error('Failed to load conversations list:', err);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, [filterStatus, filterUrgency, filterChannel, searchTerm, activeIdParam]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSelectConversation = async (conv: Conversation) => {
    setLoadingChat(true);
    setSearchParams({ id: conv.id });
    try {
      const details = await api.conversations.details(conv.id);
      setSelectedConversation(details);
      setMessages(details.messages || []);
    } catch (err) {
      console.error('Failed to fetch chat details:', err);
    } finally {
      setLoadingChat(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || !selectedConversation) return;

    setSending(true);
    try {
      if (isNote) {
        // Post internal note
        const note = await api.conversations.addNote(selectedConversation.id, replyContent);
        setMessages(prev => [...prev, note]);
      } else {
        // Send manual human message (clears AI auto response)
        const msg = await api.conversations.sendMessage(selectedConversation.id, replyContent, 'human');
        setMessages(prev => [...prev, msg]);
      }
      setReplyContent('');
      
      // Refresh list to update message preview bubble
      fetchList();
    } catch (err) {
      console.error('Failed to post reply:', err);
    } finally {
      setSending(false);
    }
  };

  const handleTakeover = async () => {
    if (!selectedConversation) return;
    try {
      const updated = await api.conversations.takeover(selectedConversation.id);
      setSelectedConversation(prev => prev ? { ...prev, requiresHuman: true } : null);
      confetti({
        particleCount: 50,
        spread: 30,
        colors: ['#E8DFF5', '#FCF6BD'],
      });
      fetchList();
    } catch (err) {
      console.error('Failed to pause AI receptionist:', err);
    }
  };

  const handleResolve = async () => {
    if (!selectedConversation) return;
    const targetStatus = selectedConversation.status === 'resolved' ? 'active' : 'resolved';
    try {
      await api.conversations.resolve(selectedConversation.id, targetStatus);
      
      if (targetStatus === 'resolved') {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.8 },
          colors: ['#FFE5EC', '#FCF6BD', '#E8DFF5'],
        });
      }

      // Close conversation panel if setting to resolved and view is active filter
      if (filterStatus === 'active') {
        setSelectedConversation(null);
        setMessages([]);
        setSearchParams({});
      } else {
        setSelectedConversation(prev => prev ? { ...prev, status: targetStatus } : null);
      }
      fetchList();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'sms': return '💬';
      case 'whatsapp': return '🟢';
      case 'instagram': return '📸';
      case 'call': return '📞';
      default: return '✉️';
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'urgent':
        return <span className="px-2 py-0.5 rounded-full bg-[#FCE1E4] border border-[#2E1E38] text-[9px] font-bold text-red-600 uppercase">Urgent</span>;
      case 'important':
        return <span className="px-2 py-0.5 rounded-full bg-[#FCF6BD] border border-[#2E1E38] text-[9px] font-bold text-amber-700 uppercase">Important</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full bg-[#FAF6F0] border border-[#2E1E38]/20 text-[9px] font-bold text-gray-500 uppercase">Normal</span>;
    }
  };

  return (
    <div className="bg-[#FFFBF7] border-2 border-[#2E1E38] rounded-3xl overflow-hidden h-[calc(100vh-140px)] flex shadow-soft-card fade-in-load">
      {/* 1. Left Sidebar: Conversations Thread List */}
      <div className="w-80 border-r-2 border-[#2E1E38] flex flex-col bg-[#FFFBF7] h-full shrink-0">
        {/* Search */}
        <div className="p-4 border-b-2 border-[#2E1E38] space-y-3 bg-[#FAF6F0]/50">
          <div className="relative">
            <Search className="w-4 h-4 text-[#A582B8] absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-full border-2 border-[#2E1E38] bg-white text-xs text-[#2E1E38] focus:outline-none"
            />
          </div>
          
          {/* Quick Filters */}
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            <select
              value={filterChannel}
              onChange={(e) => setFilterChannel(e.target.value)}
              className="text-[10px] font-bold px-2 py-1 rounded-full border-2 border-[#2E1E38] bg-white focus:outline-none"
            >
              <option value="">All Channels</option>
              <option value="chat">Web Chat</option>
              <option value="sms">SMS Text</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="instagram">Instagram</option>
              <option value="call">Phone Call</option>
            </select>

            <select
              value={filterUrgency}
              onChange={(e) => setFilterUrgency(e.target.value)}
              className="text-[10px] font-bold px-2 py-1 rounded-full border-2 border-[#2E1E38] bg-white focus:outline-none"
            >
              <option value="">All Urgencies</option>
              <option value="urgent">Urgent</option>
              <option value="important">Important</option>
              <option value="normal">Normal</option>
            </select>
          </div>

          {/* Status filter buttons */}
          <div className="flex bg-[#FAF6F0] p-1 rounded-full border border-[#2E1E38]/20 text-xs">
            <button
              onClick={() => setFilterStatus('active')}
              className={`flex-1 py-1 rounded-full text-center font-bold transition-all ${
                filterStatus === 'active' ? 'bg-[#2E1E38] text-white' : 'text-[#8C7B93] hover:text-[#2E1E38]'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilterStatus('resolved')}
              className={`flex-1 py-1 rounded-full text-center font-bold transition-all ${
                filterStatus === 'resolved' ? 'bg-[#2E1E38] text-white' : 'text-[#8C7B93] hover:text-[#2E1E38]'
              }`}
            >
              Resolved
            </button>
          </div>
        </div>

        {/* Thread List */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#2E1E38]/10">
          {loadingList ? (
            <div className="p-8 text-center text-xs font-bold text-[#A582B8] flex items-center justify-center gap-1.5">
              <RefreshCw className="w-4 h-4 animate-spin" /> Loading chats...
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center text-xs font-medium text-[#8C7B93]">No conversations found.</div>
          ) : (
            conversations.map((conv) => {
              const lastMsg = conv.messages && conv.messages[0] ? conv.messages[0].content : '';
              const isSelected = selectedConversation?.id === conv.id;
              
              return (
                <div
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv)}
                  className={`p-4 hover:bg-[#FAF6F0] cursor-pointer transition-colors ${
                    isSelected ? 'bg-[#E8DFF5]/60' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-display text-[#2E1E38]">{conv.customerName || 'Phone Customer'}</span>
                      <span className="text-xs">{getChannelIcon(conv.channel)}</span>
                    </div>
                    <span className="text-[10px] font-semibold text-[#8C7B93]">
                      {new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs text-[#8C7B93] truncate font-medium flex-1">
                      {lastMsg || 'New conversation'}
                    </p>
                    {getUrgencyBadge(conv.urgency)}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 2. Middle Panel: Chat Screen */}
      <div className="flex-1 flex flex-col bg-white h-full relative">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b-2 border-[#2E1E38] bg-[#FFFBF7] flex justify-between items-center z-10 shadow-sm shrink-0">
              <div className="space-y-0.5">
                <h3 className="font-display text-base text-[#2E1E38] flex items-center gap-1.5">
                  {selectedConversation.customerName || 'Simulated Customer'}
                  <span className="text-xs">{getChannelIcon(selectedConversation.channel)}</span>
                </h3>
                <p className="text-[10px] font-semibold text-[#8C7B93] flex items-center gap-1.5">
                  <span>Channel: {selectedConversation.channel.toUpperCase()}</span>
                  <span>•</span>
                  <span>
                    Status:{' '}
                    <strong className={selectedConversation.status === 'resolved' ? 'text-green-600' : 'text-amber-600'}>
                      {selectedConversation.status.toUpperCase()}
                    </strong>
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Takeover Control */}
                {!selectedConversation.requiresHuman && (
                  <button
                    onClick={handleTakeover}
                    className="px-3.5 py-1.5 rounded-full bg-[#E8DFF5] border-2 border-[#2E1E38] text-xs font-bold text-[#2E1E38] hover:bg-[#D9D2EC] shadow-[0_2px_0px_0px_#2E1E38] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer flex items-center gap-1"
                  >
                    Take Over 🤖
                  </button>
                )}
                {selectedConversation.requiresHuman && (
                  <span className="px-3 py-1.5 rounded-full bg-[#FFE5EC] border border-[#FCA3B7] text-[10px] font-bold text-[#E91E63] flex items-center gap-1">
                    🔒 Human Handling Mode
                  </span>
                )}

                {/* Resolve Control */}
                <button
                  onClick={handleResolve}
                  className={`px-3.5 py-1.5 rounded-full border-2 border-[#2E1E38] text-xs font-bold transition-all shadow-[0_2px_0px_0px_#2E1E38] active:translate-y-[2px] active:shadow-none cursor-pointer flex items-center gap-1 ${
                    selectedConversation.status === 'resolved'
                      ? 'bg-[#FAF6F0] text-[#8C7B93] hover:bg-gray-100'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  {selectedConversation.status === 'resolved' ? 'Reactivate' : 'Resolve'}
                </button>
              </div>
            </div>

            {/* Messages Feed */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FAF6F0]/20">
              {loadingChat ? (
                <div className="text-center text-xs font-bold text-[#A582B8] py-8">Fetching details...</div>
              ) : messages.length === 0 ? (
                <div className="text-center text-xs font-medium text-[#8C7B93] py-12">No messages in thread.</div>
              ) : (
                messages.map((msg) => {
                  const isNoteCard = msg.isNote;
                  const isCustomer = msg.sender === 'customer';
                  const isAI = msg.sender === 'ai';

                  if (isNoteCard) {
                    return (
                      <div key={msg.id} className="max-w-md mx-auto bg-[#FFE5EC] border border-[#FCA3B7] rounded-2xl p-3.5 text-center text-xs space-y-1 relative shadow-sm">
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-[#A582B8] mb-0.5">
                          <Lock className="w-3 h-3" /> Internal Office Note
                        </span>
                        <p className="font-semibold text-[#2E1E38]">{msg.content}</p>
                        <span className="text-[8px] text-gray-400 font-bold block pt-1">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isCustomer ? 'items-start' : 'items-end'}`}
                    >
                      <div className="flex items-center gap-1 mb-1 text-[9px] font-bold text-[#A582B8] uppercase">
                        <span>{isCustomer ? (selectedConversation.customerName || 'Customer') : isAI ? '🤖 Bloomie AI' : '👤 You'}</span>
                      </div>
                      
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-xs font-semibold leading-relaxed border-2 border-[#2E1E38] shadow-sm ${
                          isCustomer
                            ? 'bg-[#FFFBF7] rounded-tl-none'
                            : isAI
                            ? 'bg-[#E8DFF5] rounded-tr-none'
                            : 'bg-[#D0E1FD] rounded-tr-none'
                        }`}
                      >
                        <p className="text-[#2E1E38] whitespace-pre-wrap">{msg.content}</p>
                        <span className="text-[8px] text-right block mt-1.5 opacity-60 font-bold">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Call transcript attachment overlay if call conversation */}
            {selectedConversation.channel === 'call' && selectedConversation.calls && selectedConversation.calls[0] && (
              <div className="mx-4 mt-2 p-3 bg-blue-50 border border-blue-200 rounded-2xl text-[10px] font-medium text-blue-700 flex flex-col gap-1 shrink-0">
                <span className="font-bold flex items-center gap-1">📞 Call Recording Transcript Logs:</span>
                <p className="italic bg-white/50 p-2 rounded-lg max-h-20 overflow-y-auto whitespace-pre-wrap">
                  {selectedConversation.calls[0].transcript || 'No voice transcript logs captured.'}
                </p>
              </div>
            )}

            {/* Composer */}
            <form onSubmit={handleSendMessage} className="p-4 border-t-2 border-[#2E1E38] bg-[#FFFBF7] shrink-0">
              <div className="flex gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setIsNote(false)}
                  className={`px-3.5 py-1 rounded-full text-[10px] font-bold border ${
                    !isNote
                      ? 'bg-[#2E1E38] text-white border-[#2E1E38]'
                      : 'bg-white text-[#8C7B93] border-[#2E1E38]/20 hover:text-[#2E1E38]'
                  }`}
                >
                  Reply to Customer
                </button>
                <button
                  type="button"
                  onClick={() => setIsNote(true)}
                  className={`px-3.5 py-1 rounded-full text-[10px] font-bold border ${
                    isNote
                      ? 'bg-[#FFE5EC] text-[#2E1E38] border-[#2E1E38]'
                      : 'bg-white text-[#8C7B93] border-[#2E1E38]/20 hover:text-[#2E1E38]'
                  }`}
                >
                  🔒 Add Internal Office Note
                </button>
              </div>

              <div className="flex gap-2 items-end">
                <textarea
                  rows={2}
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder={
                    isNote
                      ? 'Type internal note (e.g. Dr. Sarah handles this chip at 4:30)...'
                      : 'Type response to customer...'
                  }
                  className="flex-1 p-3 rounded-2xl border-2 border-[#2E1E38] bg-white text-xs text-[#2E1E38] focus:outline-none resize-none font-medium"
                />
                <button
                  type="submit"
                  disabled={sending || !replyContent.trim()}
                  className="p-3.5 rounded-full bg-[#E4C1F9] border-2 border-[#2E1E38] text-[#2E1E38] hover:bg-[#D9D2EC] shadow-[0_2px_0px_0px_#2E1E38] active:translate-y-[2px] active:shadow-none transition-all disabled:opacity-40 cursor-pointer flex items-center justify-center"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#FAF6F0]/20 text-center space-y-4">
            <div className="w-24 h-24 rounded-full bg-[#E8DFF5]/60 flex items-center justify-center border border-[#2E1E38]">
              <MessageSquare className="w-10 h-10 text-[#2E1E38]" />
            </div>
            <div>
              <p className="font-display text-lg text-[#2E1E38]">Select a conversation</p>
              <p className="text-xs text-[#8C7B93] font-medium max-w-[240px]">
                Review message history, send replies, or review AI auto-response logs.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 3. Right Panel: Customer Profile Sheet */}
      {selectedConversation && (
        <div className="w-64 border-l-2 border-[#2E1E38] flex flex-col bg-[#FFFBF7] h-full shrink-0 p-4 space-y-6 overflow-y-auto">
          {/* Customer profile card */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-full border-2 border-[#2E1E38] bg-[#FFE5EC] mx-auto flex items-center justify-center font-display text-lg text-[#2E1E38]">
              {(selectedConversation.customerName || 'U')[0]}
            </div>
            <div>
              <h4 className="font-display text-base text-[#2E1E38]">{selectedConversation.customerName || 'Anonymous Customer'}</h4>
              <span className="text-[10px] font-bold text-[#8C7B93] uppercase">
                {selectedConversation.channel} Contact
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-4 text-xs font-semibold">
            <div className="border-t border-[#2E1E38]/10 pt-4 space-y-2.5">
              <span className="block text-[10px] font-bold text-[#A582B8] uppercase tracking-wider">Contact Info</span>
              <div className="space-y-1.5 text-[#52405A]">
                <p className="truncate">📞 {selectedConversation.customerPhone || 'Not provided'}</p>
                <p className="truncate">✉️ {selectedConversation.customerEmail || 'Not provided'}</p>
              </div>
            </div>

            <div className="border-t border-[#2E1E38]/10 pt-4 space-y-2.5">
              <span className="block text-[10px] font-bold text-[#A582B8] uppercase tracking-wider">Urgency Status</span>
              <div>
                {getUrgencyBadge(selectedConversation.urgency)}
                {selectedConversation.urgencyReason && (
                  <p className="mt-1.5 p-2 bg-[#FFFBF7] rounded-lg border border-[#2E1E38]/10 text-[10px] text-[#8C7B93] italic font-medium leading-relaxed">
                    "{selectedConversation.urgencyReason}"
                  </p>
                )}
              </div>
            </div>

            {/* AI Summary card */}
            <div className="border-t border-[#2E1E38]/10 pt-4 space-y-2.5">
              <span className="block text-[10px] font-bold text-[#A582B8] uppercase tracking-wider">AI Conversation Summary</span>
              <div className="bg-[#FCF6BD] p-3 rounded-2xl border-2 border-[#2E1E38] text-[10px] leading-relaxed text-[#2E1E38]">
                {selectedConversation.urgency === 'urgent' ? (
                  <strong>🚨 Emergency / billing conflict requires human team callback immediately.</strong>
                ) : (
                  <span>Customer seeking standard service consultation, pricing verification or hours confirmation.</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default ConversationsInbox;
