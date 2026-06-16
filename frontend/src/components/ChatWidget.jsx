import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';
import useAuthStore from '../store/authStore';

const DEMO_MESSAGES = [
  { sender: 'admin', text: 'Hello! How can we help you today?', timestamp: new Date().toISOString() },
];

function ChatBubble({ msg }) {
  const isAdmin = msg.sender === 'admin';
  return (
    <div className={`flex ${isAdmin ? 'justify-start' : 'justify-end'} mb-3`}>
      <div
        className={`max-w-[80%] px-3.5 py-2.5 text-sm font-sans leading-relaxed ${
          isAdmin
            ? 'bg-stone-100 text-obsidian rounded-tr-xl rounded-br-xl rounded-bl-xl'
            : 'bg-obsidian text-cream rounded-tl-xl rounded-bl-xl rounded-br-xl'
        }`}
      >
        <p>{msg.text}</p>
        <p className={`text-[10px] mt-1 ${isAdmin ? 'text-stone-400' : 'text-cream/50'}`}>
          {new Date(msg.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}

function PreChatForm({ onSubmit, loading }) {
  const { user } = useAuthStore();
  const [form, setForm] = useState({
    customerName: user?.name || '',
    email:        user?.email || '',
    phone:        user?.phoneNumber || user?.phone || '',
    initialMessage: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.customerName.trim() || !form.email.trim()) {
      toast.error('Name and email are required.');
      return;
    }
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-3">
      <p className="text-xs text-stone-500 font-sans leading-relaxed">
        Message us with your questions. We are happy to help. Before we start, please provide
        your information so we can reply to you if you leave the chat.
      </p>

      <div>
        <label className="label-luxury text-[10px]">Full Name *</label>
        <input
          type="text"
          value={form.customerName}
          onChange={(e) => setForm({ ...form, customerName: e.target.value })}
          placeholder="Jane Doe"
          className="input-luxury text-sm py-2"
          required
        />
      </div>
      <div>
        <label className="label-luxury text-[10px]">Email Address *</label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="you@example.com"
          className="input-luxury text-sm py-2"
          required
        />
      </div>
      <div>
        <label className="label-luxury text-[10px]">Contact Number</label>
        <input
          type="tel"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          placeholder="+91 98765 43210"
          className="input-luxury text-sm py-2"
        />
      </div>
      <div>
        <label className="label-luxury text-[10px]">Message</label>
        <textarea
          value={form.initialMessage}
          onChange={(e) => setForm({ ...form, initialMessage: e.target.value })}
          rows={3}
          placeholder="How can we help you today?"
          className="input-luxury text-sm py-2 resize-none"
          maxLength={2000}
        />
      </div>

      <button type="submit" disabled={loading} className="btn-dark w-full text-xs py-2.5">
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="animate-spin rounded-full h-3.5 w-3.5 border-t-2 border-cream" />
            Starting chat…
          </span>
        ) : 'Start Chat'}
      </button>
    </form>
  );
}

export default function ChatWidget() {
  const [open, setOpen]         = useState(false);
  const [phase, setPhase]       = useState('welcome'); // welcome | form | chat
  const [ticketId, setTicketId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText]         = useState('');
  const [sending, setSending]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const messagesEndRef           = useRef(null);
  useAuthStore(); // keep store subscription for future auth-gated features

  // Demo mode: if ticketId is 'demo', keep locally
  const isDemo = ticketId === 'demo';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Poll for new messages every 8 seconds when chat is open
  useEffect(() => {
    if (!open || phase !== 'chat' || isDemo || !ticketId) return;
    const interval = setInterval(async () => {
      try {
        const { data } = await api.get(`/support/chat/${ticketId}`);
        setMessages(data.ticket.messages || []);
      } catch {
        // silently ignore polling errors
      }
    }, 8000);
    return () => clearInterval(interval);
  }, [open, phase, ticketId, isDemo]);

  const handleStartChat = async (formData) => {
    setLoading(true);
    try {
      const { data } = await api.post('/support/chat', formData);
      setTicketId(data.ticket.id);
      setMessages(
        data.ticket.messages?.length
          ? data.ticket.messages
          : [{ sender: 'admin', text: 'Thanks for reaching out! A team member will be with you shortly.', timestamp: new Date().toISOString() }]
      );
      setPhase('chat');
    } catch {
      // Demo fallback
      setTicketId('demo');
      setMessages([
        ...DEMO_MESSAGES,
        ...(formData.initialMessage
          ? [{ sender: 'customer', text: formData.initialMessage, timestamp: new Date().toISOString() }]
          : []),
      ]);
      setPhase('chat');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!text.trim()) return;
    const newMsg = { sender: 'customer', text: text.trim(), timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, newMsg]);
    setText('');
    setSending(true);

    if (!isDemo) {
      try {
        await api.post('/support/chat/message', { ticketId, text: newMsg.text });
      } catch {
        // keep in local state for demo
      }
    }
    setSending(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        aria-label="Chat With Us"
        className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-obsidian text-cream px-4 py-3 shadow-2xl hover:bg-gold-600 transition-all duration-300 ${
          open ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <MessageCircle size={18} />
        <span className="text-xs font-sans font-medium tracking-widest uppercase">Chat With Us</span>
      </button>

      {/* Widget panel */}
      <div
        className={`fixed bottom-6 right-6 z-50 w-[340px] max-w-[calc(100vw-2rem)] bg-white shadow-2xl border border-stone-100 flex flex-col transition-all duration-300 origin-bottom-right ${
          open ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'
        }`}
        style={{ maxHeight: '520px' }}
      >
        {/* Header */}
        <div className="bg-obsidian px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-green-400" />
            <div>
              <p className="text-cream text-sm font-sans font-medium">J Raph Streach Support</p>
              <p className="text-cream/50 text-[10px] font-sans">Typically replies in a few hours</p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="text-cream/50 hover:text-cream transition-colors"
            aria-label="Close chat"
          >
            <X size={16} />
          </button>
        </div>

        {/* Welcome screen */}
        {phase === 'welcome' && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-14 h-14 bg-stone-50 border border-stone-100 flex items-center justify-center mb-4">
              <MessageCircle size={26} className="text-gold-500" />
            </div>
            <h3 className="font-serif text-lg font-medium text-obsidian mb-2">Hello there 👋</h3>
            <p className="text-sm text-stone-500 font-sans mb-6 leading-relaxed">
              Have a question about a fragrance or your order? We're here to help.
            </p>
            <button onClick={() => setPhase('form')} className="btn-dark w-full text-xs py-2.5">
              Start Conversation
            </button>
          </div>
        )}

        {/* Pre-chat form */}
        {phase === 'form' && (
          <div className="flex-1 overflow-y-auto">
            <PreChatForm onSubmit={handleStartChat} loading={loading} />
          </div>
        )}

        {/* Chat view */}
        {phase === 'chat' && (
          <>
            <div className="flex-1 overflow-y-auto p-4">
              {messages.map((msg, i) => <ChatBubble key={i} msg={msg} />)}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-stone-100 p-3 flex gap-2">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message…"
                rows={1}
                className="flex-1 resize-none bg-stone-50 border border-stone-100 px-3 py-2 text-sm font-sans text-obsidian outline-none focus:border-stone-300 transition-colors"
                maxLength={2000}
              />
              <button
                onClick={handleSend}
                disabled={!text.trim() || sending}
                className="w-9 h-9 flex items-center justify-center bg-obsidian text-cream hover:bg-gold-500 hover:text-obsidian disabled:opacity-40 transition-all flex-shrink-0"
                aria-label="Send"
              >
                <Send size={14} />
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
