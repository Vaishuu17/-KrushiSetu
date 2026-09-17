import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import Toast from '../../components/Toast';
import LanguageSelector from '../../components/LanguageSelector';

import BuyerOverview from './sections/BuyerOverview';
import BuyerMarket from './sections/BuyerMarket';
import BuyerMarketPrices from './sections/BuyerMarketPrices';
import PostRequirement from './sections/PostRequirement';
import MyRequirements from './sections/MyRequirements';
import BuyerOrders from './sections/BuyerOrders';
import BuyerProfile from './sections/BuyerProfile';

export default function BuyerDashboard() {
  const navigate = useNavigate();
  const { currentBuyer, logout } = useAuth();
  const { t } = useLanguage();
  const [activeSection, setActiveSection] = useState('b-overview');
  const [toastMsg, setToastMsg] = useState('');
  const [toastShow, setToastShow] = useState(false);

  const toast = (msg) => { setToastMsg(msg); setToastShow(true); };

  const buyerType = currentBuyer?.buyerType || 'Wholesaler';
  const commissionRate = buyerType === 'Bulk Buyer' ? '1.0%' : buyerType === 'Retailer' ? '2.0%' : '1.5%';

  const navItems = [
    { id: 'b-overview', ico: '📊', label: t('nav_overview', 'Overview') },
    { id: 'b-market', ico: '🛒', label: t('nav_browse_market', 'Browse Market & Listings') },
    { id: 'b-prices', ico: '📈', label: t('nav_market_prices', 'Market Prices & Mandis') },
    { id: 'b-post-req', ico: '📢', label: t('nav_post_requirement', 'Post Requirement') },
    { id: 'b-my-reqs', ico: '📋', label: t('nav_my_requirements', 'My Demands & Offers') },
    { id: 'b-orders', ico: '📦', label: t('nav_orders', 'Orders & Escrow') },
    { id: 'b-profile', ico: '👤', label: t('nav_buyer_profile', 'Buyer Business Profile') },
  ];

  const sectionMap = {
    'b-overview': <BuyerOverview toast={toast} onNavigate={(sec) => setActiveSection(sec)} />,
    'b-market': <BuyerMarket toast={toast} />,
    'b-prices': <BuyerMarketPrices onProcureClick={() => setActiveSection('b-market')} />,
    'b-post-req': <PostRequirement toast={toast} onRequirementPosted={() => setActiveSection('b-my-reqs')} />,
    'b-my-reqs': <MyRequirements toast={toast} onNavigateToOrders={() => setActiveSection('b-orders')} />,
    'b-orders': <BuyerOrders toast={toast} />,
    'b-profile': <BuyerProfile />,
  };

  return (
    <div className="page active" id="page-buyer">
      <Toast message={toastMsg} show={toastShow} onHide={() => setToastShow(false)} />

      <nav className="nav" style={{ background: 'linear-gradient(135deg,#0D47A1,#1565C0,#1976D2)' }}>
        <div className="nav-logo" onClick={() => setActiveSection('b-overview')} style={{ cursor: 'pointer' }}>
          🛒 <span>KrushiSetu</span> Buyer Portal
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <LanguageSelector />
          <span style={{ background: 'rgba(255,255,255,.2)', color: '#fff', padding: '.25rem .65rem', borderRadius: '50px', fontSize: '.75rem', fontWeight: 700 }}>
            {buyerType} ({commissionRate} Fee)
          </span>
          <span style={{ color: '#BBDEFB', fontWeight: 700, fontSize: '.9rem' }}>{currentBuyer?.name}</span>
          <button 
            onClick={() => { logout(); navigate('/'); }} 
            style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', padding: '.35rem .75rem', borderRadius: '6px', cursor: 'pointer', fontSize: '.85rem' }}
          >
            {t('btn_logout') || 'Logout'}
          </button>
        </div>
      </nav>

      <div className="dashboard">
        <div className="sidebar" style={{ background: 'linear-gradient(180deg,#0D47A1,#1565C0)' }}>
          <div className="sidebar-brand" style={{ background: 'linear-gradient(135deg,#0D47A1,#1565C0)' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>🛒 KrushiSetu</h3>
            <p style={{ fontSize: '.75rem', opacity: .85 }}>Enterprise Procurement • SIH 2026</p>
          </div>
          <div className="sidebar-menu">
            {navItems.map(item => (
              <a key={item.id}
                className={activeSection === item.id ? 'active' : ''}
                onClick={() => setActiveSection(item.id)}
                style={{ cursor: 'pointer' }}>
                <span className="ico">{item.ico}</span> {item.label}
              </a>
            ))}
          </div>

          <div style={{
            margin: '1.5rem 1rem 0',
            background: 'rgba(255,255,255,0.12)',
            borderRadius: '12px',
            padding: '.85rem',
            color: '#fff',
            fontSize: '.75rem',
          }}>
            <div style={{ fontWeight: 800, marginBottom: '.2rem' }}>🔒 Escrow Security</div>
            <div>Direct farmgate contracts with quality-gated settlement &amp; platform transparency.</div>
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

