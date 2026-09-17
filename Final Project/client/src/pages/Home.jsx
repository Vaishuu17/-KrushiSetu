import { useNavigate } from 'react-router-dom';
import FloatingChatbot from '../components/FloatingChatbot';

export default function Home() {
  const navigate = useNavigate();

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="page active" id="page-home">
      <FloatingChatbot />
      {/* NAV */}
      <nav className="nav">
        <div className="nav-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>🌾 <span>KrushiSetu</span></div>
        <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <a onClick={() => scrollToSection('workflow-section')} style={{ cursor: 'pointer' }}>Workflow</a>
          <a onClick={() => scrollToSection('features-section')} style={{ cursor: 'pointer' }}>Innovations (USPs)</a>
          <a onClick={() => scrollToSection('impact-section')} style={{ cursor: 'pointer' }}>Impact</a>
          <a className="btn btn-primary" onClick={() => navigate('/register')} style={{ cursor: 'pointer', fontWeight: 800 }}>Portal Login →</a>
        </div>
      </nav>

      {/* HERO */}
      <div className="hero">
        <div className="hero-inner">
          <div className="hero-text">
            <div className="tagline-badge">💡 SMART INDIA HACKATHON 2026 • SIH26132 • AI INOVATORS</div>
            <h1>KrishiSetu AI: <span>Real-Time Price Discovery</span> &amp; Direct Market Linkage 🌾</h1>
            <p>Strengthening market linkages and price discovery for farmers using AI-driven <b>Net Realization Score (NRS)</b>, 7–15 day price forecasting, and 0% middleman direct buyer linkage.</p>
            <div className="hero-btns">
              <button className="btn btn-primary" onClick={() => navigate('/register')}>🚀 Launch Kisan Portal</button>
              <button className="btn btn-outline" onClick={() => scrollToSection('workflow-section')} style={{ color: '#fff', borderColor: 'rgba(255,255,255,.5)' }}>View System Workflow ↓</button>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-card">
              <span className="icon">🎯</span>
              <div>
                <h3>Net Realization Score (NRS)</h3>
                <p>Mandi Rate − Transport Cost − 0% Commission = True Profit</p>
              </div>
            </div>
            <div className="hero-card">
              <span className="icon">🔮</span>
              <div>
                <h3>7–15 Day Price Forecast</h3>
                <p>Prophet &amp; LSTM AI guidance: "Sell Now vs Hold 7D"</p>
              </div>
            </div>
            <div className="hero-card">
              <span className="icon">🤝</span>
              <div>
                <h3>Direct Verified Market Link</h3>
                <p>Connect directly with bulk buyers &amp; FPOs with zero commission</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* STATS BAR */}
      <div className="stats-bar">
        <div className="stats-inner">
          <div className="stat-item"><div className="num">₹8K–15K</div><div className="lbl">Extra Gain per Season</div></div>
          <div className="stat-item"><div className="num">0%</div><div className="lbl">Middlemen Cut (Saved 20–30%)</div></div>
          <div className="stat-item"><div className="num">50+ km</div><div className="lbl">GPS Mandi Radius</div></div>
          <div className="stat-item"><div className="num">10+</div><div className="lbl">Active Govt Schemes</div></div>
          <div className="stat-item"><div className="num">100%</div><div className="lbl">Vernacular Hinglish Voice</div></div>
        </div>
      </div>

      {/* DETAILED SYSTEM WORKFLOW (SLIDE 2 & 3) */}
      <div className="section" id="workflow-section">
        <div className="section-title">
          <h2>⚙️ 4-Stage Detailed System Workflow</h2>
          <p>End-to-end architecture from data ingestion to direct verified linkage</p>
        </div>
        <div className="steps-grid">
          <div className="step">
            <div className="step-num">01</div>
            <h3>Data Ingestion</h3>
            <p>Live Agmarknet &amp; eNAM APIs, GPS Mandi radius (50–100 km), real-time freight and fuel costs.</p>
          </div>
          <div className="step">
            <div className="step-num">02</div>
            <h3>AI Decision Engine</h3>
            <p>Net Realization Score (NRS), freight &amp; commission auto-cut, and LSTM &amp; Prophet time-series price forecast.</p>
          </div>
          <div className="step">
            <div className="step-num">03</div>
            <h3>Actionable Delivery</h3>
            <p>Ranked by True In-Hand Profit, Sell Now vs Hold 7D signal, Hinglish Voice AI + SMS/IVR offline fallback.</p>
          </div>
          <div className="step">
            <div className="step-num">04</div>
            <h3>Direct Linkage</h3>
            <p>Verified bulk buyers &amp; FPOs, zero middlemen cut (0% commission), and secure escrow deal confirmation.</p>
          </div>
        </div>
      </div>

      {/* CORE INNOVATIONS & USPs (SLIDE 2, 3, 5) */}
      <div className="section" id="features-section" style={{ background: 'var(--bg2)', borderRadius: 'var(--radius)', padding: '3rem 2rem' }}>
        <div className="section-title">
          <h2>✨ Core Innovations &amp; USPs</h2>
          <p>Why KrishiSetu AI outperforms traditional mandis &amp; apps</p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>Profit-First Metric (NRS)</h3>
            <p>Calculates actual in-hand farmer revenue after deducting fuel and local charges, unlike portals that show gross rates.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📈</div>
            <h3>7–15 Day Price Forecast</h3>
            <p>Data-driven "Sell Now vs Hold 7D" guidance powered by LSTM &amp; Prophet time-series forecasting.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🤝</div>
            <h3>Direct Verified Market Link</h3>
            <p>Direct deal confirmation with registered buyers and FPOs with 0% middleman brokerage.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🏛️</div>
            <h3>Government Schemes Finder</h3>
            <p>Central &amp; State schemes (PM-KISAN, PMFBY, AIF) with eligibility checkers and step-by-step apply guides.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🗣️</div>
            <h3>Vernacular Hinglish Voice AI</h3>
            <p>Zero digital literacy barrier with conversational Hinglish voice bot (<i>"4aj tamatar bechu??"</i>).</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3>SMS / IVR Fallback</h3>
            <p>Low-bandwidth &amp; feature phone accessibility with daily mandi alerts and automated voice calls.</p>
          </div>
        </div>
      </div>

      {/* IMPACT & BENEFITS (SLIDE 4 & 5) */}
      <div className="section" id="impact-section">
        <div className="section-title">
          <h2>🌱 Real Value for Farmers, Communities &amp; Nation</h2>
          <p>Aligned with Digital India &amp; Doubling Farmers' Income goals</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.2rem' }}>
          <div className="card" style={{ borderTop: '4px solid #2E7D32' }}>
            <h3 style={{ color: '#1B5E20', marginBottom: '.4rem' }}>💰 Economic Impact</h3>
            <p style={{ fontSize: '.88rem', color: 'var(--text2)' }}>Reduces middlemen commission (typically 20–30%) and directly raises farmer in-hand net income.</p>
          </div>
          <div className="card" style={{ borderTop: '4px solid #1565C0' }}>
            <h3 style={{ color: '#1565C0', marginBottom: '.4rem' }}>👥 Social Impact</h3>
            <p style={{ fontSize: '.88rem', color: 'var(--text2)' }}>Benefits small &amp; marginal farmers (~85% of India's farming population) and builds rural digital inclusion.</p>
          </div>
          <div className="card" style={{ borderTop: '4px solid #F57C00' }}>
            <h3 style={{ color: '#E65100', marginBottom: '.4rem' }}>📈 Scalability</h3>
            <p style={{ fontSize: '.88rem', color: 'var(--text2)' }}>Piloting in Maharashtra, expandable pan-India across all state mandis and APMCs.</p>
          </div>
          <div className="card" style={{ borderTop: '4px solid #7B1FA2' }}>
            <h3 style={{ color: '#7B1FA2', marginBottom: '.4rem' }}>🏛️ Government Alignment</h3>
            <p style={{ fontSize: '.88rem', color: 'var(--text2)' }}>Complements eNAM &amp; Agmarknet infrastructure without competing or replacing government systems.</p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="cta-section">
        <h2>🌾 Experience KrishiSetu AI Today!</h2>
        <p>From Data to Better Decisions, for a Stronger Agricultural Future.</p>
        <button className="btn btn-primary" onClick={() => navigate('/register')} style={{ fontSize: '1.05rem', padding: '.8rem 2.2rem' }}>
          Enter Kisan Portal →
        </button>
      </div>

      <footer>
        © 2026 KrishiSetu AI • Smart India Hackathon 2026 (Problem Statement SIH26132) | Team: AI Inovators
      </footer>
    </div>
  );
}
