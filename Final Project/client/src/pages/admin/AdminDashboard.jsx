import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import Toast from '../../components/Toast';
import LanguageSelector from '../../components/LanguageSelector';

// Existing Sections
import Analytics from './sections/Analytics';
import FarmersList from './sections/FarmersList';
import MarketplaceAdmin from './sections/MarketplaceAdmin';
import SchemesAdmin from './sections/SchemesAdmin';
import WeatherAdmin from './sections/WeatherAdmin';
import GIAdmin from './sections/GIAdmin';
import ChatbotAdmin from './sections/ChatbotAdmin';
import PricesAdmin from './sections/PricesAdmin';
import LoansAdmin from './sections/LoansAdmin';
import TransportAdmin from './sections/TransportAdmin';

// New Enhanced Sections
import RevenueAdmin from './sections/RevenueAdmin';
import ProfitLossAdmin from './sections/ProfitLossAdmin';
import FarmerWelfareAdmin from './sections/FarmerWelfareAdmin';
import CommissionsAdmin from './sections/CommissionsAdmin';
import BuyersAdmin from './sections/BuyersAdmin';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { adminUser, logout } = useAuth();
  const { t } = useLanguage();
  const [activeSection, setActiveSection] = useState('a-analytics');
  const [toastMsg, setToastMsg] = useState('');
  const [toastShow, setToastShow] = useState(false);

  const toast = (msg) => { setToastMsg(msg); setToastShow(true); };

  const navItems = [
    { id: 'a-analytics', ico: '📊', label: 'Platform Overview' },
    { id: 'a-revenue', ico: '💰', label: 'Revenue & Commission' },
    { id: 'a-pnl', ico: '📑', label: 'Profit & Loss (P&L)' },
    { id: 'a-welfare', ico: '🌾', label: 'Farmer Welfare Fund' },
    { id: 'a-commissions', ico: '⚙️', label: 'Commission Rates' },
    { id: 'a-buyers', ico: '🏢', label: 'Buyers & KYC' },
    { id: 'a-farmers', ico: '👨‍🌾', label: 'Farmers Registry' },
    { id: 'a-marketplace', ico: '🛒', label: 'Marketplace' },
    { id: 'a-schemes', ico: '🏛️', label: 'Govt Schemes' },
    { id: 'a-prices', ico: '📈', label: 'Market Prices' },
    { id: 'a-loans', ico: '💳', label: 'Loans & Finance' },
    { id: 'a-transport', ico: '🚚', label: 'Transport & Fleet' },
    { id: 'a-gi', ico: '🔗', label: 'GI Products' },
    { id: 'a-chatbot', ico: '🤖', label: 'Chatbot Q&A' },
    { id: 'a-weather', ico: '🌤️', label: 'Weather Radar' },
  ];

  const sectionMap = {
    'a-analytics': <Analytics toast={toast} onNavigate={(sec) => setActiveSection(sec)} />,
    'a-revenue': <RevenueAdmin toast={toast} />,
    'a-pnl': <ProfitLossAdmin toast={toast} />,
    'a-welfare': <FarmerWelfareAdmin toast={toast} />,
    'a-commissions': <CommissionsAdmin toast={toast} />,
    'a-buyers': <BuyersAdmin toast={toast} />,
    'a-farmers': <FarmersList toast={toast} />,
    'a-marketplace': <MarketplaceAdmin toast={toast} />,
    'a-schemes': <SchemesAdmin toast={toast} />,
    'a-prices': <PricesAdmin toast={toast} />,
    'a-loans': <LoansAdmin toast={toast} />,
    'a-transport': <TransportAdmin toast={toast} />,
    'a-gi': <GIAdmin toast={toast} />,
    'a-chatbot': <ChatbotAdmin toast={toast} />,
    'a-weather': <WeatherAdmin toast={toast} />,
  };


  return (
    <div className="page active" id="page-admin">
      <Toast message={toastMsg} show={toastShow} onHide={() => setToastShow(false)} />
      
      <nav className="nav" style={{ background: 'linear-gradient(135deg,#1a1a2e,#16213e)' }}>
        <div className="nav-logo" onClick={() => setActiveSection('a-analytics')} style={{ cursor: 'pointer' }}>
          🏛️ <span>KrushiSetu</span> Admin Command Center
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <LanguageSelector />
          <span style={{ background: 'rgba(255,255,255,.15)', color: '#fff', padding: '.25rem .65rem', borderRadius: '50px', fontSize: '.75rem', fontWeight: 700 }}>
            Super Admin
          </span>
          <span style={{ color: '#a5d6a7', fontWeight: 700, fontSize: '.9rem' }}>{adminUser?.name || 'Administrator'}</span>
          <button 
            onClick={() => { logout(); navigate('/'); }} 
            style={{ background: 'rgba(239,154,154,0.2)', border: '1px solid rgba(239,154,154,0.4)', color: '#ef9a9a', padding: '.35rem .75rem', borderRadius: '6px', cursor: 'pointer', fontSize: '.85rem' }}
          >
            {t('btn_logout') || 'Logout'}
          </button>
        </div>
      </nav>

      <div className="dashboard">
        <div className="sidebar admin-sidebar">
          <div className="sidebar-brand" style={{ background: 'linear-gradient(135deg,#1a1a2e,#16213e)' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>🏛️ Admin Panel</h3>
            <p style={{ fontSize: '.75rem', opacity: .85 }}>KrushiSetu Platform Control</p>
          </div>
          <div className="sidebar-menu">
            {navItems.map(item => (
              <a 
                key={item.id} 
                className={activeSection === item.id ? 'active' : ''} 
                onClick={() => setActiveSection(item.id)} 
                style={{ cursor: 'pointer' }}
              >
                <span className="ico">{item.ico}</span> {item.label}
              </a>
            ))}
          </div>

          <div style={{
            margin: '1.5rem 1rem 0',
            background: 'rgba(255,255,255,0.08)',
            borderRadius: '12px',
            padding: '.85rem',
            color: '#a5d6a7',
            fontSize: '.75rem',
          }}>
            <div style={{ fontWeight: 800, marginBottom: '.2rem', color: '#fff' }}>🛡️ Governance Live</div>
            <div>Automated Escrow arbitration, commission audits, and welfare allocations active.</div>
          </div>
        </div>

        <div className="main-content">
          {Object.entries(sectionMap).map(([id, comp]) => (
            <div key={id} className={`dashboard-section${activeSection === id ? ' active' : ''}`}>
              {activeSection === id ? comp : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

