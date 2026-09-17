import { useState, useRef, useEffect } from 'react';
import API from '../../../api/axios';

const GREETING = "Namaskar! 🙏 Main hoon KrushiSetu — aapka smart bazaar sahayak. Mujhse mandi bhav, NRS (Net Realization Score), 7-din ka forecast, bulk buyers ya PM-KISAN jaisi sarkari yojanaon ke baare me poochiye.";

export default function ChatbotSection() {
  const [msgs, setMsgs] = useState([{ role: 'bot', text: GREETING }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [lang, setLang] = useState('hi');
  const msgsRef = useRef(null);
  const recognitionRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (msgsRef.current) {
      msgsRef.current.scrollTo({ top: msgsRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [msgs, loading]);

  const speak = (text) => {
    if (!ttsEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const clean = text.replace(/\[NAV:[^\]]+\]/g, '').replace(/[^\w\s\u0900-\u097F.,?!]/g, '').trim();
    const utter = new SpeechSynthesisUtterance(clean);
    utter.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
    utter.rate = 1.0;
    const voices = window.speechSynthesis.getVoices();
    const v = voices.find(v => v.lang === utter.lang) || voices.find(v => v.lang.startsWith(lang));
    if (v) utter.voice = v;
    utter.onstart = () => setSpeaking(true);
    utter.onend = () => setSpeaking(false);
    utter.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utter);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
  };

  const startListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      alert('Voice recognition sirf Google Chrome me supported hai.');
      return;
    }
    const recognition = new SR();
    recognition.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
    recognition.interimResults = false;
    recognition.onstart = () => setListening(true);
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setListening(false);
      handleSend(transcript);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) recognitionRef.current.stop();
    setListening(false);
  };

  const clearChat = () => {
    if (speaking) stopSpeaking();
    setMsgs([{ role: 'bot', text: GREETING }]);
    setInput('');
  };

  const handleSend = async (overrideText) => {
    const query = (overrideText || input).trim();
    if (!query || loading) return;

    setMsgs(prev => [...prev, { role: 'user', text: query }]);
    setInput('');
    setLoading(true);

    try {
      const history = msgs
        .filter(m => !m.isTyping)
        .map(m => ({ role: m.role === 'bot' ? 'model' : 'user', text: m.text }));

      const res = await API.post('/chatai', { message: query, lang, history });
      const rawReply = res.data.reply || 'Maaf kijiye, response nahi mila. Dobara koshish karein.';

      const navRegex = /\[NAV:([a-z\-]+):([^\]]*)\]/i;
      const match = rawReply.match(navRegex);
      const cleanText = rawReply.replace(navRegex, '').trim();

      setMsgs(prev => [...prev, {
        role: 'bot',
        text: cleanText,
        navSection: match ? match[1] : null,
        navSearch: match ? match[2] : '',
      }]);

      if (ttsEnabled) speak(cleanText);
    } catch {
      setMsgs(prev => [...prev, {
        role: 'bot',
        text: 'Network error. Kisan Helpline: 1800-180-1551 par call karein.',
      }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: 'calc(100vh - 120px)', minHeight: '540px',
      background: '#F8FAFB', borderRadius: '16px',
      border: '1px solid #E0E7EF', overflow: 'hidden',
      boxShadow: '0 4px 24px rgba(0,0,0,0.07)'
    }}>

      {/* ── Header ── */}
      <div style={{
        background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #388E3C 100%)',
        padding: '1.1rem 1.5rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: '12px',
            background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.3rem', border: '1px solid rgba(255,255,255,0.2)',
          }}>🤖</div>
          <div>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: '1.05rem', letterSpacing: '.01em' }}>
              KrushiSetu Voice Assistant
            </div>
            <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '.75rem', marginTop: '.1rem', display: 'flex', alignItems: 'center', gap: '.4rem' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#69F0AE', display: 'inline-block', boxShadow: '0 0 6px #69F0AE' }} />
              Gemini AI Active • Vernacular Hinglish
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center' }}>
          {/* Lang Toggle */}
          <button
            onClick={() => setLang(l => l === 'hi' ? 'en' : 'hi')}
            style={{
              background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)',
              color: '#fff', padding: '.35rem .75rem', borderRadius: '8px',
              fontSize: '.75rem', fontWeight: 800, cursor: 'pointer',
            }}
          >
            🌐 {lang === 'hi' ? 'हिं / EN' : 'EN / हिं'}
          </button>

          {/* Voice Toggle */}
          <button
            onClick={() => { if (speaking) stopSpeaking(); else setTtsEnabled(t => !t); }}
            style={{
              background: ttsEnabled ? 'rgba(105,240,174,0.2)' : 'rgba(255,255,255,0.1)',
              border: `1px solid ${ttsEnabled ? '#69F0AE' : 'rgba(255,255,255,0.2)'}`,
              color: '#fff', width: '34px', height: '34px', borderRadius: '8px',
              cursor: 'pointer', fontSize: '.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            title={ttsEnabled ? 'Voice ON — click to mute' : 'Voice OFF — click to enable'}
          >
            {speaking ? '⏹️' : ttsEnabled ? '🔊' : '🔇'}
          </button>

          {/* Clear Chat */}
          <button
            onClick={clearChat}
            style={{
              background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
              color: 'rgba(255,255,255,0.8)', width: '34px', height: '34px', borderRadius: '8px',
              cursor: 'pointer', fontSize: '.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            title="Clear chat history"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* ── Messages ── */}
      <div
        ref={msgsRef}
        style={{
          flex: 1, overflowY: 'auto',
          padding: '1.5rem',
          display: 'flex', flexDirection: 'column', gap: '1rem',
          background: '#F8FAFB',
        }}
      >
        {msgs.map((m, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
              gap: '.6rem',
              alignItems: 'flex-end',
            }}
          >
            {/* Bot avatar */}
            {m.role === 'bot' && (
              <div style={{
                width: '30px', height: '30px', borderRadius: '50%',
                background: 'linear-gradient(135deg,#1B5E20,#2E7D32)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '.85rem', flexShrink: 0, boxShadow: '0 2px 8px rgba(46,125,50,.2)',
              }}>🤖</div>
            )}

            <div style={{ maxWidth: '78%' }}>
              {/* Bubble */}
              <div style={{
                padding: '.85rem 1.1rem',
                borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                background: m.role === 'user'
                  ? 'linear-gradient(135deg, #1B5E20, #2E7D32)'
                  : '#fff',
                color: m.role === 'user' ? '#fff' : '#1A2A1A',
                fontSize: '.9rem', lineHeight: 1.6,
                whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                boxShadow: m.role === 'user'
                  ? '0 4px 16px rgba(27,94,32,.2)'
                  : '0 2px 12px rgba(0,0,0,.06)',
                border: m.role === 'bot' ? '1px solid #E8F0E8' : 'none',
              }}>
                {m.text}
              </div>

              {/* Bot action row */}
              {m.role === 'bot' && (
                <div style={{ display: 'flex', gap: '.4rem', marginTop: '.4rem', flexWrap: 'wrap' }}>
                  {m.navSection && (
                    <button
                      onClick={() => window.__setActiveSection && window.__setActiveSection(m.navSection)}
                      style={{
                        background: '#E8F5E9', color: '#1B5E20',
                        border: '1px solid #A5D6A7', borderRadius: '8px',
                        padding: '.25rem .7rem', fontSize: '.75rem', fontWeight: 700,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '.3rem',
                      }}
                    >
                      🚀 Go to Section →
                    </button>
                  )}
                  <button
                    onClick={() => speaking ? stopSpeaking() : speak(m.text)}
                    style={{
                      background: 'transparent', border: '1px solid #DDE8DD',
                      color: '#5A7A5A', borderRadius: '8px',
                      padding: '.25rem .55rem', fontSize: '.72rem',
                      cursor: 'pointer',
                    }}
                    title="Read aloud"
                  >
                    {speaking ? '⏹ Stop' : '🔈 Read'}
                  </button>
                </div>
              )}
            </div>

            {/* User avatar */}
            {m.role === 'user' && (
              <div style={{
                width: '30px', height: '30px', borderRadius: '50%',
                background: '#E3F2FD', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '.85rem', flexShrink: 0,
              }}>👤</div>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '.6rem' }}>
            <div style={{
              width: '30px', height: '30px', borderRadius: '50%',
              background: 'linear-gradient(135deg,#1B5E20,#2E7D32)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.85rem',
            }}>🤖</div>
            <div style={{
              background: '#fff', border: '1px solid #E8F0E8',
              borderRadius: '18px 18px 18px 4px',
              padding: '.75rem 1.1rem',
              display: 'flex', gap: '.35rem', alignItems: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,.05)',
            }}>
              {[0, 1, 2].map(d => (
                <span key={d} style={{
                  width: '8px', height: '8px', borderRadius: '50%',
                  background: '#2E7D32', display: 'inline-block',
                  animation: `kmDot 1.2s ease-in-out ${d * 0.2}s infinite`,
                  opacity: 0.7,
                }} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Input Bar ── */}
      <div style={{
        background: '#fff',
        borderTop: '1px solid #E8F0E8',
        padding: '.85rem 1.25rem',
        display: 'flex', gap: '.6rem', alignItems: 'center',
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
            lang === 'hi' ? 'Kuch bhi poochiye — Hinglish ya Hindi mein...' :
            'Ask anything in English or Hinglish...'
          }
          disabled={loading}
          style={{
            flex: 1, padding: '.8rem 1.1rem',
            borderRadius: '12px',
            border: listening ? '2px solid #E53935' : '1.5px solid #D8E8D8',
            background: listening ? '#FFF5F5' : '#F9FBF9',
            fontSize: '.9rem', outline: 'none',
            transition: 'border-color .2s',
            color: '#1A2A1A',
          }}
        />

        {/* Mic button */}
        <button
          onClick={listening ? stopListening : startListening}
          disabled={loading}
          style={{
            background: listening ? '#E53935' : '#E8F5E9',
            color: listening ? '#fff' : '#1B5E20',
            border: `1.5px solid ${listening ? '#E53935' : '#A5D6A7'}`,
            borderRadius: '12px', padding: '.8rem',
            width: '46px', height: '46px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.1rem', cursor: 'pointer',
            transition: 'all .15s',
          }}
          title={listening ? 'Stop voice' : 'Speak (Hindi / Hinglish)'}
        >
          🎤
        </button>

        {/* Send button */}
        <button
          onClick={() => handleSend()}
          disabled={loading || !input.trim()}
          style={{
            background: loading || !input.trim() ? '#E8F5E9' : 'linear-gradient(135deg,#1B5E20,#2E7D32)',
            color: loading || !input.trim() ? '#A5D6A7' : '#fff',
            border: 'none', borderRadius: '12px',
            padding: '.8rem 1.4rem', fontWeight: 800, fontSize: '.9rem',
            cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', gap: '.4rem',
            transition: 'all .2s',
          }}
        >
          {loading ? '⏳' : 'Send ➤'}
        </button>
      </div>

      {/* Typing dot animation */}
      <style>{`
        @keyframes kmDot {
          0%, 100% { transform: translateY(0); opacity: 0.5; }
          50% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
