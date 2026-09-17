import { useState, useRef, useEffect } from 'react';
import API from '../api/axios';

const GREETING_HI = "Namaskar! 🙏 Main KrushiSetu hoon. Mujhse mandi bhav, NRS profit, 7-din ka forecast, bulk buyers ya sarkari yojanaon ke baare me poochiye.";
const GREETING_EN = "Hello! 🙏 I'm KrushiSetu — your smart agriculture assistant. Ask me about mandi prices, NRS profit, 7-day forecast, direct buyers or government schemes.";

const NAV_LABELS = {
  'f-prices':     { label: 'Market Prices & NRS',    icon: '📈' },
  'f-decision':   { label: 'Smart Sell Decision',    icon: '🧠' },
  'f-marketplace':{ label: 'Sell Crop & Listings',   icon: '🌾' },
  'f-schemes':    { label: 'Government Schemes',      icon: '🏛️' },
  'f-orders':     { label: 'My Orders',               icon: '📦' },
  'f-overview':   { label: 'Dashboard Overview',      icon: '📊' },
  'f-requirements':{ label: 'Buyer Requirements',     icon: '📋' },
  'f-profile':    { label: 'My Profile',              icon: '👤' },
  // legacy aliases
  'f-market':     { label: 'Market Prices & NRS',    icon: '📈' },
};

function parseNavTag(text) {
  const m = text.match(/\[NAV:([a-z\-]+):([^\]]*)\]/i);
  return m
    ? { cleanText: text.replace(/\[NAV:[^\]]+\]/i, '').trim(), navSection: m[1], navSearch: m[2] || '' }
    : { cleanText: text, navSection: null, navSearch: '' };
}

export default function FloatingChatbot({ hide = false }) {
  if (hide) return null;

  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState('');
  const [inited, setInited] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [lang, setLang] = useState('hi');
  const [loading, setLoading] = useState(false);
  const msgsRef = useRef(null);
  const recognitionRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight;
  }, [msgs, loading]);

  const greeting = () => lang === 'hi' ? GREETING_HI : GREETING_EN;

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next && !inited) {
      setInited(true);
      setMsgs([{ role: 'bot', text: greeting() }]);
    }
    if (next) setTimeout(() => inputRef.current?.focus(), 300);
  };

  const switchLang = () => {
    const next = lang === 'hi' ? 'en' : 'hi';
    setLang(next);
    const g = next === 'hi' ? GREETING_HI : GREETING_EN;
    setMsgs(m => [...m, { role: 'bot', text: `🌐 Language switched. ${g}` }]);
  };

  const speak = (text, l) => {
    if (!ttsEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const clean = text.replace(/[^\w\s\u0900-\u097F.,?!]/g, '').trim();
    const utter = new SpeechSynthesisUtterance(clean);
    const useLang = l || lang;
    utter.lang = useLang === 'hi' ? 'hi-IN' : 'en-IN';
    utter.rate = 1.0;
    const voices = window.speechSynthesis.getVoices();
    const v = voices.find(v => v.lang === utter.lang) || voices.find(v => v.lang.startsWith(useLang === 'hi' ? 'hi' : 'en'));
    if (v) utter.voice = v;
    utter.onstart = () => setSpeaking(true);
    utter.onend = () => setSpeaking(false);
    utter.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utter);
  };

  const stopSpeaking = () => { window.speechSynthesis.cancel(); setSpeaking(false); };

  const startListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert('Voice recognition sirf Chrome me kaam karta hai.'); return; }
    const r = new SR();
    r.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
    r.interimResults = false;
    r.onstart = () => setListening(true);
    r.onresult = e => { setListening(false); handleSend(e.results[0][0].transcript); };
    r.onerror = () => setListening(false);
    r.onend = () => setListening(false);
    recognitionRef.current = r;
    r.start();
  };

  const stopListening = () => { if (recognitionRef.current) recognitionRef.current.stop(); setListening(false); };

  const handleSend = async (override) => {
    const q = (override || input).trim();
    if (!q || loading) return;
    setMsgs(prev => [...prev, { role: 'user', text: q }]);
    setInput('');
    setLoading(true);
    try {
      const history = msgs
        .filter(m => !m.isTyping)
        .map(m => ({ role: m.role === 'bot' ? 'model' : 'user', text: m.text }));
      const { data } = await API.post('/chatai', { message: q, lang, history });
      const { cleanText, navSection, navSearch } = parseNavTag(data.reply || '...');
      setMsgs(prev => [...prev, { role: 'bot', text: cleanText, navSection, navSearch }]);
      if (ttsEnabled) speak(cleanText);
    } catch {
      setMsgs(prev => [...prev, {
        role: 'bot',
        text: lang === 'hi' ? 'Khed hai, response nahi mila. Thodi der baad koshish karein.' : 'Sorry, no response. Please try again.'
      }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const navigateTo = (section, search) => {
    if (window.__setActiveSection) window.__setActiveSection(section);
    if (search && window.__setSectionSearch) window.__setSectionSearch(section, search);
    setOpen(false);
  };

  const clearChat = () => {
    if (speaking) stopSpeaking();
    setMsgs([{ role: 'bot', text: greeting() }]);
    setInput('');
  };

  return (
    <>
      {/* FAB Button */}
      <button
        onClick={toggle}
        style={{
          position: 'fixed', bottom: '24px', right: '24px',
          width: '52px', height: '52px', borderRadius: '50%',
          background: open
            ? 'linear-gradient(135deg,#424242,#616161)'
            : 'linear-gradient(135deg,#1B5E20,#2E7D32)',
          color: '#fff', border: 'none', cursor: 'pointer',
          fontSize: open ? '1.1rem' : '1.4rem',
          boxShadow: '0 4px 20px rgba(0,0,0,.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 999,
          transition: 'all .25s cubic-bezier(.4,0,.2,1)',
          transform: open ? 'rotate(0deg) scale(1)' : 'rotate(0deg) scale(1)',
        }}
        title={open ? 'Close Assistant' : 'Open KrushiSetu'}
      >
        {open ? '✕' : '🤖'}
      </button>

      {/* Chat Panel */}
      {open && (
        <div style={{
          position: 'fixed', bottom: '88px', right: '24px',
          width: '360px', height: '520px',
          background: '#fff', borderRadius: '18px',
          boxShadow: '0 12px 48px rgba(0,0,0,.18)',
          border: '1px solid #E0EBE0',
          display: 'flex', flexDirection: 'column',
          zIndex: 998, overflow: 'hidden',
          animation: 'panelIn .2s ease-out',
        }}>

          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg,#1B5E20 0%,#2E7D32 60%,#388E3C 100%)',
            padding: '.9rem 1.1rem',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.7rem' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '10px',
                background: 'rgba(255,255,255,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.1rem', border: '1px solid rgba(255,255,255,0.2)',
              }}>🤖</div>
              <div>
                <div style={{ color: '#fff', fontWeight: 800, fontSize: '.9rem', lineHeight: 1.2 }}>KrushiSetu</div>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '.68rem', display: 'flex', alignItems: 'center', gap: '.3rem' }}>
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#69F0AE', display: 'inline-block' }} />
                  Gemini AI • Hinglish
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '.35rem' }}>
              <button onClick={switchLang} style={{
                background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)',
                color: '#fff', borderRadius: '6px', padding: '.2rem .5rem',
                fontSize: '.7rem', fontWeight: 800, cursor: 'pointer',
              }}>
                {lang === 'hi' ? 'EN' : 'हिं'}
              </button>
              <button onClick={() => { if (speaking) stopSpeaking(); else setTtsEnabled(t => !t); }} style={{
                background: ttsEnabled ? 'rgba(105,240,174,0.2)' : 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.25)',
                color: '#fff', borderRadius: '6px', width: '28px', height: '28px',
                cursor: 'pointer', fontSize: '.8rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }} title={ttsEnabled ? 'Mute voice' : 'Enable voice'}>
                {speaking ? '⏹' : ttsEnabled ? '🔊' : '🔇'}
              </button>
              <button onClick={clearChat} style={{
                background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                color: 'rgba(255,255,255,0.75)', borderRadius: '6px', width: '28px', height: '28px',
                cursor: 'pointer', fontSize: '.75rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }} title="Clear chat">🗑️</button>
            </div>
          </div>

          {/* Messages */}
          <div ref={msgsRef} style={{
            flex: 1, overflowY: 'auto', padding: '1rem',
            display: 'flex', flexDirection: 'column', gap: '.75rem',
            background: '#F8FAFB',
          }}>
            {msgs.map((m, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
                alignItems: 'flex-end', gap: '.45rem',
              }}>
                {m.role === 'bot' && (
                  <div style={{
                    width: '26px', height: '26px', borderRadius: '50%',
                    background: '#1B5E20', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '.72rem',
                  }}>🤖</div>
                )}
                <div style={{ maxWidth: '82%' }}>
                  <div style={{
                    padding: '.7rem .9rem',
                    borderRadius: m.role === 'user' ? '16px 16px 3px 16px' : '16px 16px 16px 3px',
                    background: m.role === 'user'
                      ? 'linear-gradient(135deg,#1B5E20,#2E7D32)'
                      : '#fff',
                    color: m.role === 'user' ? '#fff' : '#1A2A1A',
                    fontSize: '.84rem', lineHeight: 1.55,
                    whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                    boxShadow: m.role === 'user'
                      ? '0 3px 12px rgba(27,94,32,.2)'
                      : '0 2px 8px rgba(0,0,0,.06)',
                    border: m.role === 'bot' ? '1px solid #E8F0E8' : 'none',
                  }}>
                    {m.text}
                  </div>
                  {m.role === 'bot' && (
                    <div style={{ display: 'flex', gap: '.3rem', marginTop: '.3rem', flexWrap: 'wrap' }}>
                      {m.navSection && (
                        <button
                          onClick={() => navigateTo(m.navSection, m.navSearch)}
                          style={{
                            background: '#E8F5E9', color: '#1B5E20',
                            border: '1px solid #A5D6A7', borderRadius: '6px',
                            padding: '.2rem .55rem', fontSize: '.7rem', fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          {NAV_LABELS[m.navSection]?.icon || '🚀'} {NAV_LABELS[m.navSection]?.label || 'Open Section'} →
                        </button>
                      )}
                      <button
                        onClick={() => speaking ? stopSpeaking() : speak(m.text)}
                        style={{
                          background: 'transparent', border: '1px solid #DDE8DD',
                          color: '#7A9A7A', borderRadius: '6px',
                          padding: '.2rem .45rem', fontSize: '.68rem', cursor: 'pointer',
                        }}
                      >
                        {speaking ? '⏹' : '🔈'}
                      </button>
                    </div>
                  )}
                </div>
                {m.role === 'user' && (
                  <div style={{
                    width: '26px', height: '26px', borderRadius: '50%',
                    background: '#E3F2FD', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '.72rem',
                  }}>👤</div>
                )}
              </div>
            ))}

            {/* Typing dots */}
            {loading && (
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '.45rem' }}>
                <div style={{
                  width: '26px', height: '26px', borderRadius: '50%', background: '#1B5E20',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.72rem',
                }}>🤖</div>
                <div style={{
                  background: '#fff', border: '1px solid #E8F0E8',
                  borderRadius: '16px 16px 16px 3px', padding: '.6rem .9rem',
                  display: 'flex', gap: '.28rem', alignItems: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,.05)',
                }}>
                  {[0, 1, 2].map(d => (
                    <span key={d} style={{
                      width: '7px', height: '7px', borderRadius: '50%', background: '#2E7D32',
                      display: 'inline-block', opacity: 0.7,
                      animation: `fDot 1.2s ease-in-out ${d * 0.2}s infinite`,
                    }} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div style={{
            background: '#fff', borderTop: '1px solid #EAF0EA',
            padding: '.65rem .85rem',
            display: 'flex', gap: '.4rem', alignItems: 'center',
            flexShrink: 0,
          }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder={
                listening ? '🎤 Bol rahe hain...' :
                loading ? '⏳ Jawab aa raha hai...' :
                lang === 'hi' ? 'Kuch bhi poochiye...' : 'Ask anything...'
              }
              disabled={loading}
              style={{
                flex: 1, padding: '.6rem .9rem', borderRadius: '10px',
                border: listening ? '1.5px solid #E53935' : '1.5px solid #D8E8D8',
                background: listening ? '#FFF5F5' : '#F9FBF9',
                fontSize: '.84rem', outline: 'none', color: '#1A2A1A',
                transition: 'border-color .2s',
              }}
            />
            <button
              onClick={listening ? stopListening : startListening}
              disabled={loading}
              style={{
                width: '38px', height: '38px', borderRadius: '10px',
                background: listening ? '#E53935' : '#E8F5E9',
                color: listening ? '#fff' : '#1B5E20',
                border: `1.5px solid ${listening ? '#E53935' : '#A5D6A7'}`,
                cursor: 'pointer', fontSize: '.95rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}
            >🎤</button>
            <button
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              style={{
                width: '38px', height: '38px', borderRadius: '10px',
                background: loading || !input.trim() ? '#E8F5E9' : 'linear-gradient(135deg,#1B5E20,#2E7D32)',
                color: loading || !input.trim() ? '#A5D6A7' : '#fff',
                border: 'none', cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                fontSize: '.95rem', fontWeight: 800,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                transition: 'all .15s',
              }}
            >➤</button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fDot {
          0%, 100% { transform: translateY(0); opacity: .5; }
          50% { transform: translateY(-5px); opacity: 1; }
        }
        @keyframes panelIn {
          from { opacity: 0; transform: translateY(12px) scale(.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </>
  );
}
