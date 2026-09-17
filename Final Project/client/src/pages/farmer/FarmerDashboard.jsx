import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import Toast from '../../components/Toast';
import FloatingChatbot from '../../components/FloatingChatbot';
import GovPortal from '../../components/GovPortal';
import LanguageSelector from '../../components/LanguageSelector';
import API from '../../api/axios';

// Section imports
import Overview from './sections/Overview';
import Profile from './sections/Profile';
import FarmerMarketPrices from './sections/FarmerMarketPrices';
import SmartSellDecision from './sections/SmartSellDecision';
import Marketplace from './sections/Marketplace';
import FarmerRequirements from './sections/FarmerRequirements';
import FarmerOrders from './sections/FarmerOrders';
import Schemes from './sections/Schemes';
import Loans from './sections/Loans';
import ChatbotSection from './sections/ChatbotSection';

export default function FarmerDashboard() {
  const navigate = useNavigate();
  const { currentFarmer, loginFarmer, logout, token } = useAuth();
  const { t } = useLanguage();
  const [activeSection, setActiveSection] = useState('f-overview');
  const [toastMsg, setToastMsg] = useState('');
  const [toastShow, setToastShow] = useState(false);
  const [govPortalOpen, setGovPortalOpen] = useState(false);
  const [govScheme, setGovScheme] = useState(null);

  // Search terms for sections (set by chatbot auto-navigation)
  const [sectionSearch, setSectionSearch] = useState({});

  const toast = (msg) => {
    setToastMsg(msg);
    setToastShow(true);
  };
  window.__toast = toast;
  window.__openGovPortal = (scheme) => { setGovScheme(scheme); setGovPortalOpen(true); };

  // Expose navigation functions globally for FloatingChatbot
  window.__setActiveSection = useCallback((section) => {
    setActiveSection(section);
  }, []);

  window.__setSectionSearch = useCallback((section, searchTerm) => {
    setSectionSearch(prev => ({ ...prev, [section]: searchTerm }));
  }, []);

  // Clear search term when user manually navigates away
  const handleNavClick = (sectionId) => {
    setActiveSection(sectionId);
  };

  const navItems = [
    { id: 'f-overview', ico: '📊', label: t('nav_overview', 'Dashboard Overview') },
    { id: 'f-prices', ico: '📈', label: t('nav_market_prices', 'Market Prices & NRS') },
    { id: 'f-decision', ico: '🧠', label: t('nav_smart_sell', 'Smart Sell (AI Decision)') },
    { id: 'f-marketplace', ico: '🌾', label: t('nav_sell_crop', 'Sell Crop & Listings') },
    { id: 'f-requirements', ico: '📋', label: t('nav_requirements', 'Buyer Requirements') },
    { id: 'f-orders', ico: '📦', label: t('nav_orders', 'My Orders & Escrow') },
    { id: 'f-schemes', ico: '🏛️', label: t('nav_schemes', 'Government Schemes') },
    { id: 'f-chatbot', ico: '🤖', label: t('nav_chatbot', 'KrushiSetu Voice Assistant') },
    { id: 'f-profile', ico: '👤', label: t('nav_profile', 'Farmer Profile') },
  ];

  // Multi-crop list from farmer context
  const farmerCrops = (currentFarmer?.crops && currentFarmer.crops.length > 0)
    ? currentFarmer.crops
    : [{ name: currentFarmer?.crop || 'Tomato', season: 'Kharif', acreage: currentFarmer?.land || 3 }];

  const activeCropName = currentFarmer?.crop || farmerCrops[0]?.name || 'Tomato';

  const handleQuickCropSwitch = async (cropObj) => {
    const rawName = typeof cropObj === 'string' ? cropObj : cropObj.name;
    const cleanName = rawName.split('(')[0].trim();
    if (cleanName.toLowerCase() === activeCropName.toLowerCase()) return;

    try {
      const updatedCrops = farmerCrops.map(c => ({
        ...c,
        status: (c.name.toLowerCase().includes(cleanName.toLowerCase())) ? 'Active' : 'Standby'
      }));

      const payload = {
        ...currentFarmer,
        crop: cleanName,
        crops: updatedCrops,
      };

      const { data } = await API.put(`/farmers/${currentFarmer?.id || currentFarmer?._id}`, payload);
      loginFarmer(data, token || localStorage.getItem('km_token'));
      toast(`🎯 Active Focus switched to ${cleanName}! Live prices & NRS recalculated.`);
    } catch {
      // Fallback local update
      loginFarmer({ ...currentFarmer, crop: cleanName }, token || localStorage.getItem('km_token'));
      toast(`🎯 Active Focus switched to ${cleanName}!`);
    }
  };

  const sectionMap = {
    'f-overview': <Overview toast={toast} key={`ov-${activeCropName}`} />,
    'f-prices': <FarmerMarketPrices initialCrop={activeCropName} key={`pr-${activeCropName}`} />,
    'f-decision': <SmartSellDecision initialCrop={activeCropName} key={`dec-${activeCropName}`} />,
    'f-marketplace': <Marketplace toast={toast} key={`mkt-${activeCropName}`} />,
    'f-requirements': <FarmerRequirements toast={toast} key={`req-${activeCropName}`} />,
    'f-orders': <FarmerOrders toast={toast} key="farmer-orders" />,
    'f-schemes': <Schemes toast={toast} key="farmer-schemes" />,
    'f-chatbot': <ChatbotSection key="farmer-chat" />,
    'f-profile': <Profile toast={toast} key="farmer-profile" />,
  };

  return (
    <div className="page active" id="page-farmer">
      <FloatingChatbot hide={activeSection === 'f-chatbot'} />
      <Toast message={toastMsg} show={toastShow} onHide={() => setToastShow(false)} />
      {govPortalOpen && <GovPortal scheme={govScheme} onClose={() => setGovPortalOpen(false)} toast={toast} />}

      <nav className="nav">
        <div className="nav-logo" onClick={() => setActiveSection('f-overview')} style={{ cursor: 'pointer' }}>
          🌾 <span>KrushiSetu</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <LanguageSelector />
          <span style={{ background: 'rgba(255,255,255,.2)', color: '#fff', padding: '.25rem .65rem', borderRadius: '50px', fontSize: '.75rem', fontWeight: 700 }}>
            SIH26132 • AI Innovators
          </span>
          <span id="farmer-nav-name" style={{ color: '#a5d6a7', fontWeight: '700', fontSize: '.9rem' }}>
            {currentFarmer?.name || 'Kisan Bhai'}
          </span>
          <a onClick={() => { logout(); navigate('/'); }} style={{ color: '#c8e6c9', cursor: 'pointer', fontSize: '.9rem' }}>{t('btn_logout') || 'Logout'}</a>
        </div>
      </nav>

      <div className="dashboard">
        <div className="sidebar">
          <div className="sidebar-brand">
            <h3>🌾 KrushiSetu</h3>
            <p>Kisan Portal • SIH 2026</p>
          </div>
          <div className="sidebar-menu">
            {navItems.map(item => (
              <a key={item.id}
                className={activeSection === item.id ? 'active' : ''}
                onClick={() => handleNavClick(item.id)}
                style={{ cursor: 'pointer' }}>
                <span className="ico">{item.ico}</span> {item.label}
              </a>
            ))}
          </div>

          <div style={{
            margin: '1.5rem 1rem 0',
            background: 'linear-gradient(135deg, #1B5E20, #2E7D32)',
            borderRadius: '12px',
            padding: '.85rem',
            color: '#fff',
            fontSize: '.75rem',
          }}>
            <div style={{ fontWeight: 800, marginBottom: '.2rem' }}>🎯 Net Realization Score</div>
            <div>Zero middleman cut (0% commission) with verified bulk buyers &amp; Escrow protection.</div>
          </div>
        </div>

        <div className="main-content">
          {/* QUICK MULTI-CROP SWITCHER BAR */}
          <div style={{
            background: '#fff',
            borderRadius: '14px',
            padding: '.75rem 1.25rem',
            marginBottom: '1.25rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            border: '1px solid #E8F5E9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '.75rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '.82rem', fontWeight: 800, color: '#1B5E20', display: 'flex', alignItems: 'center', gap: '.3rem' }}>
                🌱 Active Focus:
              </span>
              {farmerCrops.map((c, i) => {
                const cName = typeof c === 'string' ? c : c.name;
                const clean = cName.split('(')[0].trim();
                const isActive = clean.toLowerCase() === activeCropName.toLowerCase() || cName.toLowerCase().includes(activeCropName.toLowerCase());
                return (
                  <button
                    key={i}
                    onClick={() => handleQuickCropSwitch(c)}
                    style={{
                      border: isActive ? '2px solid #2E7D32' : '1px solid #E0E0E0',
                      background: isActive ? '#E8F5E9' : '#FAFAFA',
                      color: isActive ? '#1B5E20' : 'var(--text2)',
                      fontWeight: isActive ? 800 : 600,
                      fontSize: '.8rem',
                      padding: '.35rem .75rem',
                      borderRadius: '50px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '.35rem',
                      transition: 'all .2s'
                    }}
                  >
                    {isActive ? '🌟' : '🌾'} {clean}
                    {c.acreage && <span style={{ fontSize: '.68rem', opacity: .8 }}>({c.acreage} ac)</span>}
                  </button>
                );
              })}
              <button
                onClick={() => setActiveSection('f-profile')}
                style={{
                  border: '1px dashed #2E7D32',
                  background: '#fff',
                  color: '#2E7D32',
                  fontSize: '.75rem',
                  fontWeight: 700,
                  padding: '.35rem .65rem',
                  borderRadius: '50px',
                  cursor: 'pointer'
                }}
              >
                ➕ Add / Manage Crops
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', fontSize: '.75rem', color: '#2E7D32', fontWeight: 700, background: '#F1F8E9', padding: '.25rem .65rem', borderRadius: '50px' }}>
              🔒 Escrow Protected • 0% Cut
            </div>
          </div>

          {Object.entries(sectionMap).map(([id, comp]) => (
            <div key={id} className={`dashboard-section${activeSection === id ? ' active' : ''}`} id={id}>
              {activeSection === id ? comp : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
