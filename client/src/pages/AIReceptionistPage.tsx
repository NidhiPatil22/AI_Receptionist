import React, { useState, useEffect } from 'react';
import Mascot from '../components/Mascot';
import { api } from '../services/api';
import { Phone, MessageSquare, ToggleLeft, ToggleRight, Sparkles, Send, Volume2, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

export const AIReceptionistPage: React.FC = () => {
  // Toggle states
  const [receptionistActive, setReceptionistActive] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [messagingEnabled, setMessagingEnabled] = useState(true);
  const [autoAnswer, setAutoAnswer] = useState(true);
  const [humanEscalation, setHumanEscalation] = useState(true);

  // Simulation states
  const [activeTab, setActiveTab] = useState<'chat' | 'call'>('chat');
  const [simulating, setSimulating] = useState(false);
  const [simConversationId, setSimConversationId] = useState<string | null>(null);
  
  // Call simulation specific
  const [callStatus, setCallStatus] = useState<'idle' | 'ringing' | 'connected' | 'ended'>('idle');
  const [callTranscript, setCallTranscript] = useState<string[]>([]);
  const [duration, setDuration] = useState(0);
  const [timerInterval, setTimerInterval] = useState<any>(null);

  // Chat simulation specific
  const [chatMessages, setChatMessages] = useState<{ sender: 'customer' | 'ai'; content: string }[]>([
    { sender: 'ai', content: "Hi! I'm Bloomie, your virtual assistant. How can I help you today? ♡" }
  ]);
  
  const [inputText, setInputText] = useState('');
  const [mascotState, setMascotState] = useState<'idle' | 'thinking' | 'speaking' | 'listening' | 'happy'>('idle');
  const [businessId, setBusinessId] = useState('');

  useEffect(() => {
    const biz = localStorage.getItem('reception_business');
    if (biz) {
      setBusinessId(JSON.parse(biz).id);
    }
  }, []);

  const handleToggle = (setter: React.Dispatch<React.SetStateAction<boolean>>) => {
    setter(prev => !prev);
    confetti({
      particleCount: 15,
      spread: 20,
      colors: ['#E4C1F9', '#FCF6BD'],
    });
  };

  // --- Chat Simulation ---
  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !businessId) return;

    const textToSend = inputText;
    setInputText('');
    setChatMessages(prev => [...prev, { sender: 'customer', content: textToSend }]);
    setMascotState('thinking');

    try {
      const result = await api.simulations.simulateMessage({
        businessId,
        customerName: 'Demo Customer',
        channel: 'chat',
        content: textToSend,
      });

      if (result.aiMsg) {
        setTimeout(() => {
          setChatMessages(prev => [...prev, { sender: 'ai', content: result.aiMsg.content }]);
          
          // Trigger different mascot behaviors based on reply
          const textLower = result.aiMsg.content.toLowerCase();
          if (textLower.includes('urgent') || textLower.includes('flagged') || textLower.includes('sorry')) {
            setMascotState('listening');
          } else {
            setMascotState('speaking');
            setTimeout(() => setMascotState('idle'), 2500);
          }
        }, 800);
      }
    } catch (err) {
      console.error(err);
      setMascotState('idle');
    }
  };

  // --- Voice Call Simulation ---
  const handleStartCall = async () => {
    if (!businessId) return;
    setCallStatus('ringing');
    setMascotState('listening');
    setCallTranscript(['[Phone Ringing...]']);
    setDuration(0);

    try {
      // Ring for 1 second, then connect
      setTimeout(async () => {
        setCallStatus('connected');
        setMascotState('speaking');
        
        const initialText = "Hello, thanks for calling Bloom Dental Studio. My name is Bloomie. How can I help you today?";
        setCallTranscript(prev => [...prev, `🤖 Bloomie: ${initialText}`]);
        
        // Start duration timer
        const interval = setInterval(() => {
          setDuration(d => d + 1);
        }, 1000);
        setTimerInterval(interval);

        // Prime the simulated call on the backend
        const callPayload = await api.simulations.simulateCall({
          businessId,
          customerPhone: '+1 (555) 902-1200',
          customerName: 'Demo Caller',
          speechContent: 'Hello',
        });
        setSimConversationId(callPayload.conversation.id);
      }, 1200);
    } catch (err) {
      console.error(err);
      setCallStatus('idle');
      setMascotState('idle');
    }
  };

  const handleSendCallSpeech = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !businessId || !simConversationId) return;

    const speechText = inputText;
    setInputText('');
    setCallTranscript(prev => [...prev, `👤 You: ${speechText}`]);
    setMascotState('thinking');

    try {
      const response = await api.simulations.simulateCall({
        businessId,
        conversationId: simConversationId,
        speechContent: speechText,
      });

      setTimeout(() => {
        setCallTranscript(prev => [...prev, `🤖 Bloomie: ${response.aiVoiceReply}`]);
        setMascotState('speaking');
        setTimeout(() => setMascotState('idle'), 3000);
      }, 800);
    } catch (err) {
      console.error(err);
      setMascotState('idle');
    }
  };

  const handleHangup = async () => {
    if (timerInterval) clearInterval(timerInterval);
    setCallStatus('ended');
    setMascotState('idle');
    setCallTranscript(prev => [...prev, '[Call Disconnected]']);
    
    if (simConversationId) {
      try {
        await api.simulations.simulateHangup(simConversationId, duration);
      } catch (err) {
        console.error(err);
      }
    }
    
    setTimeout(() => {
      setCallStatus('idle');
      setSimConversationId(null);
    }, 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 fade-in-load">
      {/* Left Column: Mascot Profile & Configuration */}
      <div className="lg:col-span-5 space-y-6">
        {/* Mascot Center Card */}
        <div className="bg-[#FFFBF7] border-2 border-[#2E1E38] rounded-3xl p-8 shadow-soft-card text-center space-y-4 flex flex-col items-center">
          <div className="w-44 h-44 bg-[#FAF6F0] rounded-full border-2 border-[#2E1E38] flex items-center justify-center p-4 relative shadow-sm">
            <Mascot state={mascotState} size={150} />
            <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-400 border border-[#2E1E38] rounded-full animate-pulse" />
          </div>
          
          <div className="space-y-1">
            <h3 className="font-display text-xl text-[#2E1E38]">Meet Bloomie ♡</h3>
            <p className="text-xs font-semibold text-[#8C7B93] max-w-xs mx-auto">
              I'm your virtual front desk receptionist. I answer calls and reply to messages while you focus on your business.
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 px-4.5 py-1 rounded-full bg-[#E8DFF5] border border-[#2E1E38] text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" /> status: online & active
          </div>
        </div>

        {/* Configuration settings */}
        <div className="bg-[#FFFBF7] border-2 border-[#2E1E38] rounded-3xl p-6 shadow-sm space-y-4">
          <h4 className="font-display text-lg text-[#2E1E38]">Receptionist Configuration</h4>
          <div className="space-y-3.5 text-sm font-semibold text-[#52405A]">
            {[
              { label: 'Enable AI Receptionist', state: receptionistActive, setter: setReceptionistActive },
              { label: 'Voice calling active', state: voiceEnabled, setter: setVoiceEnabled },
              { label: 'Messaging channels active', state: messagingEnabled, setter: setMessagingEnabled },
              { label: 'Auto-answer instant reply', state: autoAnswer, setter: setAutoAnswer },
              { label: 'Human escalation triggers', state: humanEscalation, setter: setHumanEscalation },
            ].map((config, index) => (
              <div key={index} className="flex items-center justify-between">
                <span>{config.label}</span>
                <button onClick={() => handleToggle(config.setter)} className="focus:outline-none">
                  {config.state ? (
                    <ToggleRight className="w-10 h-10 text-[#A582B8]" />
                  ) : (
                    <ToggleLeft className="w-10 h-10 text-gray-300" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column: Interactive Simulators */}
      <div className="lg:col-span-7 bg-[#FFFBF7] border-2 border-[#2E1E38] rounded-3xl overflow-hidden shadow-soft-card flex flex-col h-[600px]">
        {/* Simulator Tabs */}
        <div className="flex border-b-2 border-[#2E1E38] bg-[#FAF6F0] text-sm shrink-0">
          <button
            onClick={() => { setActiveTab('chat'); setCallStatus('idle'); }}
            className={`flex-1 py-3 text-center font-bold flex items-center justify-center gap-1.5 transition-colors ${
              activeTab === 'chat' ? 'bg-[#FFFBF7] text-[#2E1E38] border-b-2 border-transparent' : 'text-[#8C7B93] hover:text-[#2E1E38]'
            }`}
          >
            <MessageSquare className="w-4 h-4" /> Message Simulator
          </button>
          <button
            onClick={() => { setActiveTab('call'); }}
            className={`flex-1 py-3 text-center font-bold flex items-center justify-center gap-1.5 transition-colors ${
              activeTab === 'call' ? 'bg-[#FFFBF7] text-[#2E1E38] border-b-2 border-transparent' : 'text-[#8C7B93] hover:text-[#2E1E38]'
            }`}
          >
            <Phone className="w-4 h-4" /> Voice Call Simulator
          </button>
        </div>

        {/* Simulator Content Area */}
        <div className="flex-1 overflow-y-auto p-5 bg-[#FAF6F0]/20 flex flex-col justify-between">
          {activeTab === 'chat' ? (
            /* Chat Content */
            <>
              <div className="space-y-4 flex-1 overflow-y-auto pb-4 max-h-[400px]">
                {chatMessages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex flex-col ${msg.sender === 'customer' ? 'items-start' : 'items-end'}`}
                  >
                    <span className="text-[9px] font-bold text-[#A582B8] uppercase mb-1">
                      {msg.sender === 'customer' ? '👤 Customer' : '🤖 Bloomie'}
                    </span>
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-xs font-semibold leading-relaxed border-2 border-[#2E1E38] ${
                        msg.sender === 'customer'
                          ? 'bg-[#FFFBF7] rounded-tl-none'
                          : 'bg-[#E8DFF5] rounded-tr-none'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendChatMessage} className="flex gap-2 pt-4 border-t border-[#2E1E38]/10">
                <input
                  type="text"
                  placeholder="Type a simulated client message (e.g. Do you accept Delta Dental?)..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-full border-2 border-[#2E1E38] bg-white text-xs font-semibold focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="p-3.5 rounded-full bg-[#E4C1F9] border-2 border-[#2E1E38] text-[#2E1E38] hover:bg-[#D9D2EC] active:translate-y-[1px] transition-all disabled:opacity-40 cursor-pointer flex items-center justify-center"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            /* Call Content */
            <div className="flex-1 flex flex-col justify-between h-full">
              {callStatus === 'idle' ? (
                /* Idle state */
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-5">
                  <div className="w-20 h-20 rounded-full bg-[#D0E1FD]/50 border-2 border-[#2E1E38] flex items-center justify-center animate-breath">
                    <Phone className="w-8 h-8 text-[#2E1E38]" />
                  </div>
                  <div className="space-y-2">
                    <h5 className="font-display text-base text-[#2E1E38]">Simulate receptionist call</h5>
                    <p className="text-xs text-[#8C7B93] max-w-xs font-medium">
                      Simulate calling your studio number. The AI receptionist will pick up and speak.
                    </p>
                  </div>
                  <button
                    onClick={handleStartCall}
                    className="px-6 py-3 rounded-full bg-[#D0E1FD] hover:bg-[#A9CFFF] text-[#2E1E38] border-2 border-[#2E1E38] text-sm font-bold shadow-cute-border active:translate-y-[2px] active:shadow-none transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    Start Simulated Call <Phone className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                /* Active Call State */
                <div className="flex-1 flex flex-col justify-between h-full">
                  <div className="flex justify-between items-center bg-[#D0E1FD]/40 border border-[#2E1E38]/20 p-3 rounded-2xl mb-4 text-xs font-bold text-[#2E1E38] shrink-0">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
                      Status: {callStatus.toUpperCase()}
                    </span>
                    <span>
                      Duration: {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}
                    </span>
                  </div>

                  {/* Transcript area */}
                  <div className="flex-1 overflow-y-auto space-y-2 bg-[#FFFBF7] border-2 border-[#2E1E38] rounded-2xl p-4 text-[11px] font-semibold text-[#52405A] max-h-[250px] mb-4">
                    {callTranscript.map((t, idx) => (
                      <p key={idx} className={t.startsWith('👤') ? 'text-[#2E1E38]' : t.startsWith('🤖') ? 'text-[#A582B8] font-bold' : 'text-gray-400 italic'}>
                        {t}
                      </p>
                    ))}
                  </div>

                  {/* Speak input & Hang up controls */}
                  <div className="space-y-3 shrink-0">
                    {callStatus === 'connected' && (
                      <form onSubmit={handleSendCallSpeech} className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Speak into the phone (type a phrase)..."
                          value={inputText}
                          onChange={(e) => setInputText(e.target.value)}
                          className="flex-1 px-4 py-2 rounded-full border-2 border-[#2E1E38] bg-white text-xs font-semibold focus:outline-none"
                        />
                        <button
                          type="submit"
                          disabled={!inputText.trim()}
                          className="p-3.5 rounded-full bg-[#D0E1FD] border-2 border-[#2E1E38] text-[#2E1E38] hover:bg-[#A9CFFF] active:translate-y-[1px] transition-all disabled:opacity-40 cursor-pointer flex items-center justify-center"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </form>
                    )}

                    <button
                      onClick={handleHangup}
                      className="w-full py-2.5 rounded-full bg-red-100 hover:bg-red-200 border-2 border-red-300 text-red-700 text-xs font-bold transition-colors cursor-pointer"
                    >
                      Hang Up / End Simulation
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default AIReceptionistPage;
