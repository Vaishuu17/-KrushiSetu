import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../context/AuthContext';
import API from '../../../api/axios';

export default function Marketplace({ toast }) {
  const { currentFarmer } = useAuth();
  const [activeTab, setActiveTab] = useState('listings'); // 'listings', 'escrow', 'buyers'
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('');
  const [showSell, setShowSell] = useState(false);
  const [selling, setSelling] = useState(false);
  const [sellForm, setSellForm] = useState({
    name: currentFarmer?.crop || '',
    minPrice: '',
    maxPrice: '',
    qty: '',
    cat: 'Vegetables',
    emoji: '🍅',
    loc: currentFarmer?.loc || 'Nashik, Maharashtra'
  });

  // Price advisor state
  const [priceAdvisor, setPriceAdvisor] = useState(null);
  const [advisorLoading, setAdvisorLoading] = useState(false);
  const [showAdvisor, setShowAdvisor] = useState(false);

  // Incoming offers state
  const [offers, setOffers] = useState([]);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  // Escrow Orders state
  const [escrowOrders, setEscrowOrders] = useState([]);
  const [dispatchModal, setDispatchModal] = useState(null);
  const [dispatchForm, setDispatchForm] = useState({
    vehicle: 'MH-15-EG-4482 (Eicher 14ft)',
    driver: 'Ramesh Shinde (+91 98231 44210)',
    fare: 1800
  });

  const [lastSyncTime, setLastSyncTime] = useState(new Date());

  const fetchOffersAndOrders = () => {
    const id = currentFarmer?.id || currentFarmer?._id;
    const name = currentFarmer?.name;
    const phone = currentFarmer?.phone;

    let query = '';
    if (id && name) {
      query = `?sellerId=${encodeURIComponent(id)}&sellerName=${encodeURIComponent(name)}`;
    } else if (id) {
      query = `?sellerId=${encodeURIComponent(id)}`;
    } else if (name) {
      query = `?sellerName=${encodeURIComponent(name)}`;
    }
    if (phone) {
      query += (query ? '&' : '?') + `sellerPhone=${encodeURIComponent(phone)}`;
    }

    API.get(`/orders${query}`)
      .then(r => {
        setOffers(r.data.filter(o => o.status === 'offer-pending'));
        setEscrowOrders(r.data.filter(o => o.status !== 'offer-pending'));
        setLastSyncTime(new Date());
      })
      .catch(() => {});
  };

  const fetchProducts = () => {
    API.get('/products')
      .then(r => {
        setProducts(r.data);
        setLastSyncTime(new Date());
      })
      .catch(() => {});
  };

  // Initial load + Real-time auto-polling every 3.5s
  useEffect(() => {
    fetchProducts();
    fetchOffersAndOrders();

    const interval = setInterval(() => {
      fetchProducts();
      fetchOffersAndOrders();
    }, 3500);

    return () => clearInterval(interval);
  }, [currentFarmer]);

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) &&
    (!cat || p.cat === cat)
  );

  const cropEmojis = {
    'Wheat': '🌾', 'Rice': '🍚', 'Maize': '🌽', 'Onion': '🧅', 'Tomato': '🍅', 'Potato': '🥔', 'Banana': '🍌', 'Mango': '🥭',
    'Grapes': '🍇', 'Orange': '🍊', 'Apple': '🍎', 'Sugarcane': '🎍', 'Cotton': '☁️', 'Soybean': '🫘', 'Chili': '🌶️',
    'Turmeric': '🟡', 'Groundnut': '🥜', 'Garlic': '🧄', 'Ginger': '🫚', 'Coconut': '🥥', 'Cauliflower': '🥦',
    'Cabbage': '🥬', 'Cucumber': '🥒', 'Pumpkin': '🎃', 'Pomegranate': '🔴', 'Papaya': '🟠', 'Guava': '🟢',
  };

  const updateEmoji = (name) => {
    const match = Object.keys(cropEmojis).find(k => name.toLowerCase().includes(k.toLowerCase()));
    return match ? cropEmojis[match] : '🌿';
  };

  // Fetch price suggestion when crop name changes
  const handleCropChange = (cropName) => {
    setSellForm(prev => ({ ...prev, name: cropName, emoji: updateEmoji(cropName) }));
    if (!cropName) {
      setPriceAdvisor(null);
      setShowAdvisor(false);
      return;
    }
    setAdvisorLoading(true);
    setShowAdvisor(true);
    const farmerState = currentFarmer?.loc?.split(',')[1]?.trim() || currentFarmer?.state || '';
    const params = new URLSearchParams({ commodity: cropName });
    if (farmerState) params.append('state', farmerState);

    API.get(`/prices/govdata/suggest?${params.toString()}`)
      .then(r => {
        setPriceAdvisor(r.data);
        setAdvisorLoading(false);
      })
      .catch(() => {
        setPriceAdvisor(null);
        setAdvisorLoading(false);
      });
  };

  const submitSell = async () => {
    if (!sellForm.name || !sellForm.minPrice || !sellForm.maxPrice || !sellForm.qty) {
      toast && toast('❌ Please fill all required fields (crop, min/max price, qty)');
      return;
    }
    if (Number(sellForm.minPrice) > Number(sellForm.maxPrice)) {
      toast && toast('❌ Min price cannot be more than max price');
      return;
    }
    setSelling(true);
    try {
      const mn = Number(sellForm.minPrice);
      const mx = Number(sellForm.maxPrice);
      const payload = {
        name: sellForm.name,
        price: Math.round((mn + mx) / 2),
        minPrice: mn,
        maxPrice: mx,
        qty: Number(sellForm.qty),
        cat: sellForm.cat,
        emoji: sellForm.emoji || updateEmoji(sellForm.name),
        farmer: currentFarmer?.name || 'Farmer',
        sellerId: currentFarmer?.id || currentFarmer?._id || '',
        sellerPhone: currentFarmer?.phone || '',
        loc: sellForm.loc || currentFarmer?.loc || 'Maharashtra',
      };
      const { data } = await API.post('/products', payload);
      setProducts(prev => [data, ...prev]);
      toast && toast('✅ Crop listed! Connected buyers can now make live escrow offers.');
      setShowSell(false);
      setSellForm({ name: '', minPrice: '', maxPrice: '', qty: '', cat: 'Vegetables', emoji: '🍅', loc: '' });
      setPriceAdvisor(null);
      setShowAdvisor(false);
    } catch (e) {
      toast && toast('❌ ' + (e.response?.data?.message || 'Failed to list product'));
    }
    setSelling(false);
  };

  // Seed a sample Escrow Deal for immediate demonstration
  const handleSeedEscrowDemo = async () => {
    try {
      const { data } = await API.post('/orders/seed-sample', {
        sellerId: currentFarmer?.id || currentFarmer?._id || 'KS-1001',
        sellerName: currentFarmer?.name || 'Ramesh Kumar Patel',
        sellerPhone: currentFarmer?.phone || '9876543210',
        sellerLoc: currentFarmer?.loc || 'Nashik, Maharashtra',
        productName: `${currentFarmer?.crop || 'Tomato'} (Grade A)`,
        qty: 25,
        price: 3450,
        buyerName: 'Reliance Retail Agri Procurement'
      });
      toast && toast('🔒 New Escrow Deal created with ₹86,250 locked funds!');
      fetchOffersAndOrders();
      setActiveTab('escrow');
    } catch {
      toast && toast('❌ Failed to create sample deal');
    }
  };

  const handleDispatch = async (orderId) => {
    try {
      await API.put(`/orders/${orderId}/dispatch`, { transportDetails: dispatchForm });
      toast && toast('🚚 Shipment dispatched! Buyer notified in real-time with vehicle tracking.');
      setDispatchModal(null);
      fetchOffersAndOrders();
    } catch {
      toast && toast('❌ Failed to update dispatch');
    }
  };

  const handleVerifyQuality = async (orderId) => {
    try {
      await API.put(`/orders/${orderId}/verify-quality`);
      toast && toast('🔍 Quality inspection passed & unloading approved!');
      fetchOffersAndOrders();
    } catch {
      toast && toast('❌ Verification update failed');
    }
  };

  const handleReleasePayout = async (orderId) => {
    try {
      await API.put(`/orders/${orderId}/release-payout`);
      toast && toast('💰 100% Escrow Payout Released directly to your Bank/UPI! (0% cut)');
      fetchOffersAndOrders();
    } catch {
      toast && toast('❌ Payout release failed');
    }
  };

  const cropOptions = [
    'Tomato', 'Wheat', 'Onion', 'Rice', 'Soybean', 'Cotton', 'Potato', 'Maize', 'Sugarcane', 'Banana',
    'Mango', 'Grapes', 'Orange', 'Apple', 'Chili', 'Turmeric', 'Groundnut', 'Mustard', 'Chana', 'Arhar / Tur',
    'Moong', 'Urad', 'Bajra', 'Jowar', 'Pomegranate', 'Garlic', 'Ginger', 'Coconut'
  ];

  const verifiedBuyers = [
    {
      name: 'Reliance Retail Agri Procurement',
      badge: '🏢 Corporate Bulk Buyer',
      loc: 'Vashi APMC Hub, Navi Mumbai',
      crops: ['Tomato', 'Onion', 'Potato', 'Banana', 'Mango'],
      escrowRating: '99.8% On-Time Payout',
      escrowGuarantee: '100% Pre-funded in Escrow before dispatch',
      minLot: '20 Quintals',
      contact: 'procurement@relianceretail.com'
    },
    {
      name: 'ITC Choupal Fresh / AgroStar FPO',
      badge: '🌾 Verified FPO Network',
      loc: 'Pune / Nashik Logistics Center',
      crops: ['Wheat', 'Soybean', 'Chana', 'Mustard', 'Maize'],
      escrowRating: '100% Instant Bank Transfer',
      escrowGuarantee: 'Direct Mandi-Free Escrow Settlement',
      minLot: '15 Quintals',
      contact: 'kisanconnect@itc.in'
    },
    {
      name: 'BigBasket (Supermarket Grocery)',
      badge: '🛒 Quick Commerce Sourcing',
      loc: 'Thane Sorting Center, Maharashtra',
      crops: ['Tomato', 'Capsicum', 'Cauliflower', 'Green Chili', 'Grapes'],
      escrowRating: '99.5% Verified Inspections',
      escrowGuarantee: '24-Hr Quality Guarantee + Escrow',
      minLot: '10 Quintals',
      contact: 'farmers@bigbasket.com'
    },
    {
      name: 'Mother Dairy Fruit & Vegetable Pvt Ltd',
      badge: '🥛 SAFAL Agri Network',
      loc: 'Delhi NCR / Pan-India Central Hub',
      crops: ['Potato', 'Onion', 'Tomato', 'Apple', 'Orange'],
      escrowRating: '100% Government Backed',
      escrowGuarantee: 'Direct DBTs via Platform Escrow',
      minLot: '25 Quintals',
      contact: 'safalprocure@motherdairy.com'
    },
  ];

  return (
    <>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.3rem' }}>
            <span style={{ background: '#E8F5E9', color: '#2E7D32', padding: '.2rem .6rem', borderRadius: '50px', fontSize: '.72rem', fontWeight: 800 }}>
              🌾 KrishiSetu AI • Direct Market Linkage
            </span>
            <span style={{ background: '#E8F5E9', color: '#1B5E20', padding: '.2rem .6rem', borderRadius: '50px', fontSize: '.72rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '.35rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2E7D32', animation: 'pulse 1.5s infinite' }} />
              Live Connected with Buyer Portal
            </span>
          </div>
          <h1 style={{ margin: 0 }}>🤝 Direct Buyer Connect &amp; Escrow Payments</h1>
          <p style={{ margin: '.25rem 0 0', color: 'var(--text2)' }}>
            Sell directly to verified bulk buyers with 0% middleman cut. Buyer payments are 100% locked in Escrow before dispatch.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '.6rem', flexWrap: 'wrap' }}>
          {offers.length > 0 && (
            <span style={{ background: '#FF5722', color: '#fff', borderRadius: '50px', padding: '.4rem .8rem', display: 'flex', alignItems: 'center', gap: '.4rem', fontWeight: 800, fontSize: '.8rem', animation: 'pulse 1.5s infinite' }}>
              📩 {offers.length} Live Buyer Offers!
            </span>
          )}
          <button className="btn btn-green" onClick={() => { setShowSell(!showSell); setActiveTab('listings'); }}>
            {showSell ? '✕ Close Form' : '📦 List Crop for Sale'}
          </button>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div style={{ display: 'flex', gap: '.6rem', marginBottom: '1.25rem', borderBottom: '2px solid #E0E0E0', paddingBottom: '.5rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '.6rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('listings')}
            style={{
              padding: '.6rem 1.25rem',
              borderRadius: '10px',
              border: 'none',
              background: activeTab === 'listings' ? '#1B5E20' : '#F5F5F5',
              color: activeTab === 'listings' ? '#fff' : 'var(--text2)',
              fontWeight: 800,
              fontSize: '.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '.4rem',
              transition: 'all .2s'
            }}
          >
            🌾 Market Listings ({filtered.length})
          </button>

          <button
            onClick={() => setActiveTab('escrow')}
            style={{
              padding: '.6rem 1.25rem',
              borderRadius: '10px',
              border: 'none',
              background: activeTab === 'escrow' ? '#1565C0' : '#F5F5F5',
              color: activeTab === 'escrow' ? '#fff' : 'var(--text2)',
              fontWeight: 800,
              fontSize: '.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '.4rem',
              transition: 'all .2s'
            }}
          >
            🔒 Escrow Deals &amp; Orders ({escrowOrders.length})
          </button>

          <button
            onClick={() => setActiveTab('buyers')}
            style={{
              padding: '.6rem 1.25rem',
              borderRadius: '10px',
              border: 'none',
              background: activeTab === 'buyers' ? '#7B1FA2' : '#F5F5F5',
              color: activeTab === 'buyers' ? '#fff' : 'var(--text2)',
              fontWeight: 800,
              fontSize: '.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '.4rem',
              transition: 'all .2s'
            }}
          >
            🏢 Institutional Buyers ({verifiedBuyers.length})
          </button>
        </div>

        <div style={{ fontSize: '.72rem', color: 'var(--text3)' }}>
          🔄 Auto-Sync: <b>Active</b> ({lastSyncTime.toLocaleTimeString()})
        </div>
      </div>

      {/* INCOMING OFFERS BANNER */}
      {offers.length > 0 && (
        <div className="card" style={{ marginBottom: '1.5rem', border: '2px solid #FF9800', background: '#FFF8E1' }}>
          <div className="card-header" style={{ background: 'linear-gradient(135deg,#E65100,#FF9800)', color: '#fff', margin: '-1rem -1rem .75rem', padding: '.75rem 1rem', borderRadius: 'var(--radius2) var(--radius2) 0 0' }}>
            <span className="card-title" style={{ color: '#fff' }}>📩 Incoming Buyer Offers ({offers.length}) — Direct Escrow Settlement</span>
          </div>
          {offers.map(o => (
            <div key={o._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '.85rem', background: '#fff', borderRadius: '10px', marginBottom: '.5rem', border: '1px solid #FFE0B2', flexWrap: 'wrap', gap: '.75rem' }}>
              <div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#1B5E20' }}>
                  {o.productName} · {o.qty} quintals
                </div>
                <div style={{ fontSize: '.8rem', color: 'var(--text2)', marginTop: '.2rem' }}>
                  🛒 Buyer: <b>{o.buyerName}</b> · Phone: {o.buyerPhone || '+91 99887 76655'} · 📍 {o.buyerLoc || 'Maharashtra'}
                </div>
                <div style={{ fontSize: '.85rem', marginTop: '.35rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <span style={{ color: 'var(--text3)' }}>Listed: ₹{o.price}/qtl</span>
                  <span style={{ color: '#1565C0', fontWeight: 800 }}>Offer: ₹{o.offeredPrice}/qtl</span>
                  <span style={{ color: '#2E7D32', fontWeight: 900 }}>Total Escrow: ₹{(o.totalAmount || 0).toLocaleString()}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '.5rem' }}>
                <button
                  className="btn btn-green btn-sm"
                  onClick={async () => {
                    try {
                      await API.put(`/orders/${o._id}/accept`);
                      toast && toast('✅ Offer accepted! Buyer can now lock payment in Escrow.');
                      fetchOffersAndOrders();
                      setActiveTab('escrow');
                    } catch {
                      toast && toast('❌ Failed to accept offer');
                    }
                  }}
                >
                  ✅ Accept &amp; Move to Escrow
                </button>
                <button
                  className="btn btn-sm"
                  style={{ background: '#FFEBEE', color: '#C62828', border: '1px solid #EF9A9A' }}
                  onClick={() => setRejectModal(o)}
                >
                  ❌ Decline
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 1: LISTINGS & SELL */}
      {activeTab === 'listings' && (
        <>
          {showSell && (
            <div className="card" style={{ marginBottom: '1.5rem', border: '2px solid var(--primary)', background: '#f0f9f0' }}>
              <div className="card-header"><span className="card-title">📦 List Your Crop for Direct Buyer Sale (Escrow Protected)</span></div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                <div className="reg-field">
                  <label>Crop Name *</label>
                  <select value={sellForm.name} onChange={e => handleCropChange(e.target.value)}>
                    <option value="">Select crop to sell</option>
                    {cropOptions.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="reg-field">
                  <label>Min Price (₹/qtl) *</label>
                  <input value={sellForm.minPrice} onChange={e => setSellForm({ ...sellForm, minPrice: e.target.value })} type="number" placeholder="e.g. 3000" />
                  {priceAdvisor?.found && priceAdvisor?.overallMin && (
                    <div style={{ fontSize: '.68rem', color: '#1565C0', marginTop: '.2rem', fontWeight: 600, cursor: 'pointer' }} onClick={() => setSellForm({ ...sellForm, minPrice: String(priceAdvisor.overallMin) })}>
                      💡 Market min: ₹{priceAdvisor.overallMin.toLocaleString()} (click to use)
                    </div>
                  )}
                </div>
                <div className="reg-field">
                  <label>Max Price (₹/qtl) *</label>
                  <input value={sellForm.maxPrice} onChange={e => setSellForm({ ...sellForm, maxPrice: e.target.value })} type="number" placeholder="e.g. 4000" />
                  {priceAdvisor?.found && priceAdvisor?.overallMax && (
                    <div style={{ fontSize: '.68rem', color: '#E65100', marginTop: '.2rem', fontWeight: 600, cursor: 'pointer' }} onClick={() => setSellForm({ ...sellForm, maxPrice: String(priceAdvisor.overallMax) })}>
                      💡 Market max: ₹{priceAdvisor.overallMax.toLocaleString()} (click to use)
                    </div>
                  )}
                </div>
                <div className="reg-field">
                  <label>Quantity (quintals) *</label>
                  <input value={sellForm.qty} onChange={e => setSellForm({ ...sellForm, qty: e.target.value })} type="number" placeholder="e.g. 25" />
                </div>
                <div className="reg-field">
                  <label>Category</label>
                  <select value={sellForm.cat} onChange={e => setSellForm({ ...sellForm, cat: e.target.value })}>
                    <option>Vegetables</option><option>Grains</option><option>Fruits</option>
                    <option>Pulses</option><option>Spices</option><option>Cash Crops</option><option>Oilseeds</option>
                  </select>
                </div>
                <div className="reg-field">
                  <label>Your Farm Location</label>
                  <input value={sellForm.loc} onChange={e => setSellForm({ ...sellForm, loc: e.target.value })} placeholder={currentFarmer?.loc || 'e.g. Nashik, Maharashtra'} type="text" />
                </div>
              </div>

              {/* Price Advisor Panel */}
              {showAdvisor && (
                <div style={{ marginTop: '1.25rem', padding: '1.25rem', background: 'linear-gradient(135deg, #f8fdf8, #e8f5e9)', borderRadius: '14px', border: '1.5px solid #C8E6C9' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                      <span style={{ fontSize: '1.3rem' }}>💹</span>
                      <span style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1rem', color: '#1B5E20' }}>
                        Live Agmarknet Price Advisor – {sellForm.name}
                      </span>
                      <span style={{ fontSize: '.65rem', color: '#fff', background: '#2E7D32', padding: '.15rem .55rem', borderRadius: '50px', fontWeight: 700 }}>
                        🏛️ data.gov.in Live
                      </span>
                    </div>
                    <button onClick={() => setShowAdvisor(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: '#999' }}>✕</button>
                  </div>

                  {advisorLoading ? (
                    <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text2)', fontSize: '.85rem' }}>
                      Fetching real-time Agmarknet modal prices...
                    </div>
                  ) : priceAdvisor?.found ? (
                    <>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '.65rem', marginBottom: '1rem' }}>
                        <div style={{ background: '#fff', borderRadius: '10px', padding: '.75rem .5rem', textAlign: 'center', border: '1px solid #E8F5E9' }}>
                          <div style={{ fontSize: '.65rem', color: 'var(--text3)', fontWeight: 600 }}>Avg Modal</div>
                          <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1.1rem' }}>₹{priceAdvisor.avgModal.toLocaleString()}</div>
                        </div>
                        <div style={{ background: '#fff', borderRadius: '10px', padding: '.75rem .5rem', textAlign: 'center', border: '1px solid #E3F2FD' }}>
                          <div style={{ fontSize: '.65rem', color: 'var(--text3)', fontWeight: 600 }}>Min Modal</div>
                          <div style={{ fontWeight: 800, color: '#1565C0', fontSize: '1.1rem' }}>₹{priceAdvisor.overallMin.toLocaleString()}</div>
                        </div>
                        <div style={{ background: '#fff', borderRadius: '10px', padding: '.75rem .5rem', textAlign: 'center', border: '1px solid #F3E5F5' }}>
                          <div style={{ fontSize: '.65rem', color: 'var(--text3)', fontWeight: 600 }}>Max Modal</div>
                          <div style={{ fontWeight: 800, color: '#7B1FA2', fontSize: '1.1rem' }}>₹{priceAdvisor.overallMax.toLocaleString()}</div>
                        </div>
                        <div style={{ background: '#fff', borderRadius: '10px', padding: '.75rem .5rem', textAlign: 'center', border: '1px solid #FFF3E0' }}>
                          <div style={{ fontSize: '.65rem', color: 'var(--text3)', fontWeight: 600 }}>Mandis Reporting</div>
                          <div style={{ fontWeight: 800, color: '#E65100', fontSize: '1.1rem' }}>{priceAdvisor.marketCount}</div>
                        </div>
                      </div>

                      <div style={{ background: 'linear-gradient(135deg, #1B5E20, #2E7D32)', borderRadius: '12px', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff', flexWrap: 'wrap', gap: '.75rem' }}>
                        <div>
                          <div style={{ fontSize: '.7rem', opacity: .8, fontWeight: 700 }}>🎯 RECOMMENDED FAIR ESCROW PRICE</div>
                          <div style={{ fontSize: '1.6rem', fontWeight: 900 }}>₹{priceAdvisor.suggestedPrice.toLocaleString()} <span style={{ fontSize: '.8rem', fontWeight: 400 }}>/qtl</span></div>
                        </div>
                        <button
                          onClick={() => setSellForm(prev => ({ ...prev, minPrice: String(priceAdvisor.overallMin || priceAdvisor.suggestedPrice), maxPrice: String(priceAdvisor.overallMax || Math.round(priceAdvisor.suggestedPrice * 1.1)) }))}
                          style={{ background: '#fff', color: '#1B5E20', border: 'none', padding: '.5rem 1rem', borderRadius: '8px', fontWeight: 800, cursor: 'pointer' }}
                        >
                          ✓ Auto-Fill Price Band
                        </button>
                      </div>
                    </>
                  ) : null}
                </div>
              )}

              <button className="btn btn-green" onClick={submitSell} disabled={selling} style={{ marginTop: '1rem', width: '100%' }}>
                {selling ? '⏳ Listing...' : '🚀 Post Crop Listing (Visible to All Buyers)'}
              </button>
            </div>
          )}

          <div className="search-bar" style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem' }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search crops by name..." type="text" style={{ flex: 1 }} />
            <select value={cat} onChange={e => setCat(e.target.value)}>
              <option value="">All Categories</option>
              <option>Vegetables</option><option>Grains</option><option>Fruits</option>
              <option>Pulses</option><option>Spices</option><option>Cash Crops</option><option>Oilseeds</option>
            </select>
          </div>

          <div className="product-grid">
            {filtered.map((p, i) => (
              <div key={i} className="product-card" style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', top: '10px', right: '10px', background: '#E8F5E9', color: '#2E7D32', padding: '.15rem .5rem', borderRadius: '50px', fontSize: '.65rem', fontWeight: 800 }}>
                  🔒 Escrow Ready
                </span>
                <div className="p-emoji">{p.emoji || updateEmoji(p.name)}</div>
                <h4>{p.name}</h4>
                {p.minPrice && p.maxPrice ? (
                  <div className="price" style={{ fontSize: '.95rem' }}>
                    ₹{p.minPrice.toLocaleString()} — ₹{p.maxPrice.toLocaleString()}<span style={{ fontSize: '.72rem', fontWeight: 400, color: 'var(--text2)' }}>/qtl</span>
                  </div>
                ) : (
                  <div className="price">₹{(p.price || 0).toLocaleString()}<span style={{ fontSize: '.72rem', fontWeight: 400, color: 'var(--text2)' }}>/qtl</span></div>
                )}
                <div className="meta">📦 {p.qty} qtl available</div>
                <div className="meta">👨‍🌾 {p.farmer}</div>
                <div className="meta">📍 {p.loc}</div>
                <div className="meta"><span className="badge badge-blue">{p.cat || 'Agri'}</span></div>
                <div className="actions" style={{ marginTop: '.75rem' }}>
                  <button className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={() => toast && toast(`⭐ ${p.name} monitored for buyer interest.`)}>
                    ⭐ Watchlist
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* TAB 2: ESCROW DEALS & LIFECYCLE TRACKER */}
      {activeTab === 'escrow' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ background: 'linear-gradient(135deg, #0D47A1, #1976D2)', color: '#fff', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 6px 20px rgba(25,118,210,.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <span style={{ background: 'rgba(255,255,255,0.2)', padding: '.2rem .6rem', borderRadius: '50px', fontSize: '.72rem', fontWeight: 800 }}>
                  🛡️ 100% Zero-Risk Payment Architecture
                </span>
                <h2 style={{ margin: '.5rem 0 .25rem', color: '#fff' }}>KrishiSetu Escrow Guarantee System</h2>
                <p style={{ margin: 0, opacity: .9, fontSize: '.88rem', maxWidth: '680px' }}>
                  Funds are pre-deposited by verified buyers into an RBI-compliant platform Escrow wallet. Payout is released to your registered UPI / Bank account once digital quality inspection is verified.
                </p>
              </div>
              <button
                className="btn"
                style={{ background: '#fff', color: '#0D47A1', fontWeight: 800, padding: '.65rem 1.25rem', borderRadius: '10px' }}
                onClick={handleSeedEscrowDemo}
              >
                ➕ Simulate New Escrow Deal
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '.75rem', marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
              <div style={{ background: 'rgba(255,255,255,0.1)', padding: '.6rem .75rem', borderRadius: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.2rem' }}>1️⃣ 🤝</div>
                <div style={{ fontSize: '.75rem', fontWeight: 800, marginTop: '.2rem' }}>Deal Agreed</div>
                <div style={{ fontSize: '.65rem', opacity: .8 }}>Price locked</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.2)', padding: '.6rem .75rem', borderRadius: '10px', textAlign: 'center', border: '1px solid #90CAF9' }}>
                <div style={{ fontSize: '1.2rem' }}>2️⃣ 🔒</div>
                <div style={{ fontSize: '.75rem', fontWeight: 800, marginTop: '.2rem' }}>Funds in Escrow</div>
                <div style={{ fontSize: '.65rem', opacity: .8 }}>100% Locked</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.1)', padding: '.6rem .75rem', borderRadius: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.2rem' }}>3️⃣ 🚚</div>
                <div style={{ fontSize: '.75rem', fontWeight: 800, marginTop: '.2rem' }}>Dispatched</div>
                <div style={{ fontSize: '.65rem', opacity: .8 }}>Vehicle Tracked</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.1)', padding: '.6rem .75rem', borderRadius: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.2rem' }}>4️⃣ 🔍</div>
                <div style={{ fontSize: '.75rem', fontWeight: 800, marginTop: '.2rem' }}>Quality Pass</div>
                <div style={{ fontSize: '.65rem', opacity: .8 }}>Gate Inspection</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.2)', padding: '.6rem .75rem', borderRadius: '10px', textAlign: 'center', border: '1px solid #A5D6A7' }}>
                <div style={{ fontSize: '1.2rem' }}>5️⃣ 💰</div>
                <div style={{ fontSize: '.75rem', fontWeight: 800, marginTop: '.2rem' }}>Instant Payout</div>
                <div style={{ fontSize: '.65rem', opacity: .8 }}>Direct to UPI</div>
              </div>
            </div>
          </div>

          {/* ACTIVE ESCROW ORDERS */}
          <div className="card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="card-title">📋 Active Escrow Contracts &amp; Transactions ({escrowOrders.length})</span>
              <button className="btn btn-outline btn-sm" onClick={fetchOffersAndOrders}>🔄 Refresh Now</button>
            </div>

            {escrowOrders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text2)' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '.5rem' }}>🔒</div>
                <h3>No active Escrow orders yet</h3>
                <p style={{ fontSize: '.85rem', color: 'var(--text3)', maxWidth: '400px', margin: '0 auto 1rem' }}>
                  When buyers accept your crop listing or place direct purchases, funds are deposited into Escrow here.
                </p>
                <button className="btn btn-green" onClick={handleSeedEscrowDemo}>
                  🚀 Create Demo Escrow Contract (Test Workflow)
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {escrowOrders.map(order => {
                  const isPaid = order.escrow?.buyerPaid || order.status === 'payment-held' || order.status === 'in-transit' || order.status === 'unload-pending' || order.status === 'delivered';
                  const isDispatched = order.status === 'in-transit' || order.status === 'unload-pending' || order.status === 'delivered';
                  const isVerified = order.status === 'unload-pending' || order.status === 'delivered';
                  const isReleased = order.escrow?.status === 'released' || order.status === 'delivered';

                  return (
                    <div
                      key={order._id}
                      style={{
                        border: isReleased ? '1.5px solid #A5D6A7' : '1.5px solid #90CAF9',
                        borderRadius: '14px',
                        padding: '1.25rem',
                        background: isReleased ? '#F1F8E9' : '#fff',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.04)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '.75rem', marginBottom: '1rem' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                            <span style={{ fontFamily: 'monospace', fontWeight: 800, background: '#ECEFF1', padding: '.15rem .5rem', borderRadius: '4px', fontSize: '.75rem' }}>
                              {order.orderId || 'KME-DEAL-01'}
                            </span>
                            <span style={{
                              background: isReleased ? '#2E7D32' : isVerified ? '#7B1FA2' : isDispatched ? '#E65100' : '#1565C0',
                              color: '#fff',
                              fontSize: '.72rem',
                              fontWeight: 800,
                              padding: '.15rem .6rem',
                              borderRadius: '50px'
                            }}>
                              {isReleased ? '✓ PAYOUT RELEASED (COMPLETED)' : isVerified ? '🔍 QUALITY PASSED • READY FOR PAYOUT' : isDispatched ? '🚚 IN-TRANSIT' : '🔒 FUNDS LOCKED IN ESCROW'}
                            </span>
                          </div>
                          <h3 style={{ margin: '.4rem 0 .2rem', color: '#1B5E20' }}>
                            {order.productName} · {order.qty} Quintals
                          </h3>
                          <div style={{ fontSize: '.8rem', color: 'var(--text2)' }}>
                            Buyer: <b>{order.buyerName}</b> · Phone: {order.buyerPhone || '+91 99887 76655'} · 📍 {order.buyerLoc}
                          </div>
                          {order.transportDetails?.vehicle && (
                            <div style={{ fontSize: '.78rem', color: '#1565C0', marginTop: '.3rem', background: '#E3F2FD', padding: '.3rem .6rem', borderRadius: '6px', display: 'inline-block' }}>
                              🚛 Vehicle: <b>{order.transportDetails.vehicle}</b> • Driver: <b>{order.transportDetails.driver}</b>
                            </div>
                          )}
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '.75rem', color: 'var(--text3)' }}>Escrow Protected Amount</div>
                          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#1B5E20' }}>
                            ₹{(order.totalAmount || (order.price * order.qty)).toLocaleString()}
                          </div>
                          <div style={{ fontSize: '.72rem', color: '#1565C0', fontWeight: 700 }}>
                            @ ₹{order.offeredPrice || order.price}/qtl (0% Commission)
                          </div>
                        </div>
                      </div>

                      {/* Step Progress Bar */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '.5rem', margin: '1rem 0', background: '#FAFAFA', padding: '.75rem', borderRadius: '10px', border: '1px solid #EEEEEE' }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '1rem', color: isPaid ? '#2E7D32' : '#999' }}>{isPaid ? '✅' : '⚪'}</div>
                          <div style={{ fontSize: '.72rem', fontWeight: 800, color: isPaid ? '#2E7D32' : '#999' }}>Funds Locked</div>
                          <div style={{ fontSize: '.65rem', color: 'var(--text3)' }}>100% in Escrow</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '1rem', color: isDispatched ? '#2E7D32' : '#999' }}>{isDispatched ? '🚚' : '⚪'}</div>
                          <div style={{ fontSize: '.72rem', fontWeight: 800, color: isDispatched ? '#2E7D32' : '#999' }}>Dispatched</div>
                          <div style={{ fontSize: '.65rem', color: 'var(--text3)' }}>Vehicle Tracked</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '1rem', color: isVerified ? '#2E7D32' : '#999' }}>{isVerified ? '🔍' : '⚪'}</div>
                          <div style={{ fontSize: '.72rem', fontWeight: 800, color: isVerified ? '#2E7D32' : '#999' }}>Quality Check</div>
                          <div style={{ fontSize: '.65rem', color: 'var(--text3)' }}>Grade Approved</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '1rem', color: isReleased ? '#2E7D32' : '#999' }}>{isReleased ? '💰' : '⚪'}</div>
                          <div style={{ fontSize: '.72rem', fontWeight: 800, color: isReleased ? '#2E7D32' : '#999' }}>Payout Sent</div>
                          <div style={{ fontSize: '.65rem', color: 'var(--text3)' }}>Direct to Bank/UPI</div>
                        </div>
                      </div>

                      {/* Action Triggers for Escrow Lifecycle */}
                      <div style={{ display: 'flex', gap: '.6rem', flexWrap: 'wrap', justifyContent: 'flex-end', marginTop: '.75rem' }}>
                        {!isDispatched && (
                          <button
                            className="btn btn-sm"
                            style={{ background: '#1565C0', color: '#fff', fontWeight: 700 }}
                            onClick={() => setDispatchModal(order)}
                          >
                            🚚 Mark Shipment Dispatched
                          </button>
                        )}

                        {isDispatched && !isVerified && (
                          <button
                            className="btn btn-sm"
                            style={{ background: '#7B1FA2', color: '#fff', fontWeight: 700 }}
                            onClick={() => handleVerifyQuality(order._id)}
                          >
                            🔍 Simulate Digital Quality Pass
                          </button>
                        )}

                        {isVerified && !isReleased && (
                          <button
                            className="btn btn-green btn-sm"
                            style={{ fontWeight: 800, padding: '.45rem 1rem' }}
                            onClick={() => handleReleasePayout(order._id)}
                          >
                            💰 Release Escrow Payout (₹{(order.totalAmount || 0).toLocaleString()})
                          </button>
                        )}

                        {isReleased && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem', color: '#2E7D32', fontWeight: 800, fontSize: '.85rem' }}>
                            ✓ Transaction Settled &amp; Deposited to {currentFarmer?.bankUpi || 'kisan@okaxis'}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: VERIFIED INSTITUTIONAL BUYERS */}
      {activeTab === 'buyers' && (
        <div>
          <div style={{ background: '#EDE7F6', padding: '1rem 1.25rem', borderRadius: '12px', marginBottom: '1.25rem', border: '1px solid #D1C4E9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '.75rem' }}>
            <div>
              <h3 style={{ margin: 0, color: '#4A148C' }}>🏢 Verified Institutional Bulk Buyers &amp; FPOs</h3>
              <p style={{ margin: '.2rem 0 0', fontSize: '.82rem', color: 'var(--text2)' }}>
                All corporate buyers on KrishiSetu sign binding smart escrow agreements guaranteeing 100% pre-funded deposits before transport dispatch.
              </p>
            </div>
            <span style={{ background: '#7B1FA2', color: '#fff', padding: '.25rem .75rem', borderRadius: '50px', fontSize: '.75rem', fontWeight: 800 }}>
              0% Farmer Commission
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
            {verifiedBuyers.map((buyer, idx) => (
              <div key={idx} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1.5px solid #E0E0E0' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '.5rem' }}>
                    <span style={{ background: '#F3E5F5', color: '#7B1FA2', fontSize: '.7rem', padding: '.2rem .6rem', borderRadius: '50px', fontWeight: 800 }}>
                      {buyer.badge}
                    </span>
                    <span style={{ color: '#2E7D32', fontSize: '.72rem', fontWeight: 700 }}>
                      ✓ KYC Verified
                    </span>
                  </div>
                  <h3 style={{ margin: '.4rem 0 .2rem', color: '#1B5E20' }}>{buyer.name}</h3>
                  <div style={{ fontSize: '.78rem', color: 'var(--text2)', marginBottom: '.75rem' }}>
                    📍 {buyer.loc}
                  </div>

                  <div style={{ background: '#FAFAFA', padding: '.75rem', borderRadius: '8px', fontSize: '.78rem', marginBottom: '.75rem', border: '1px solid #EEEEEE' }}>
                    <div style={{ marginBottom: '.3rem' }}>
                      <b>Buying Crops:</b> {buyer.crops.join(', ')}
                    </div>
                    <div style={{ marginBottom: '.3rem' }}>
                      <b>Minimum Lot:</b> {buyer.minLot}
                    </div>
                    <div style={{ color: '#1565C0', fontWeight: 700 }}>
                      🔒 Escrow Guarantee: {buyer.escrowGuarantee}
                    </div>
                  </div>
                </div>

                <button
                  className="btn btn-green btn-sm"
                  style={{ width: '100%' }}
                  onClick={() => {
                    handleSeedEscrowDemo();
                    toast && toast(`🤝 Direct contract initiated with ${buyer.name}! Escrow wallet opened.`);
                  }}
                >
                  🤝 Direct Escrow Contract Request
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DISPATCH LOGISTICS MODAL */}
      {dispatchModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(4px)' }} onClick={() => setDispatchModal(null)}>
          <div style={{ background: '#fff', borderRadius: '16px', maxWidth: '440px', width: '100%', padding: '1.5rem', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 .5rem', color: '#1565C0' }}>🚚 Confirm Shipment Dispatch</h3>
            <p style={{ fontSize: '.82rem', color: 'var(--text2)', margin: '0 0 1rem' }}>
              Assign transport details for {dispatchModal.productName} ({dispatchModal.qty} qtl) to {dispatchModal.buyerName}.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
              <div className="reg-field">
                <label>Vehicle Number &amp; Type</label>
                <input value={dispatchForm.vehicle} onChange={e => setDispatchForm({ ...dispatchForm, vehicle: e.target.value })} type="text" />
              </div>
              <div className="reg-field">
                <label>Driver Name &amp; Contact</label>
                <input value={dispatchForm.driver} onChange={e => setDispatchForm({ ...dispatchForm, driver: e.target.value })} type="text" />
              </div>
              <div className="reg-field">
                <label>Agreed Transport Fare (₹)</label>
                <input value={dispatchForm.fare} onChange={e => setDispatchForm({ ...dispatchForm, fare: e.target.value })} type="number" />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '.75rem', marginTop: '1.25rem' }}>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setDispatchModal(null)}>
                Cancel
              </button>
              <button className="btn" style={{ flex: 1, background: '#1565C0', color: '#fff', fontWeight: 800 }} onClick={() => handleDispatch(dispatchModal._id)}>
                🚀 Confirm &amp; Dispatch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT OFFER MODAL */}
      {rejectModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(4px)' }} onClick={() => setRejectModal(null)}>
          <div style={{ background: '#fff', borderRadius: '16px', maxWidth: '420px', width: '100%', padding: '1.5rem' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 .5rem', color: '#C62828' }}>❌ Decline Offer</h3>
            <p style={{ fontSize: '.85rem', color: 'var(--text2)' }}>{rejectModal.productName} · ₹{rejectModal.offeredPrice}/qtl from {rejectModal.buyerName}</p>
            <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Reason (optional) — price too low, already sold..." rows={2} style={{ width: '100%', padding: '.6rem', border: '2px solid var(--border)', borderRadius: '8px', fontFamily: 'var(--font-body)', marginTop: '.5rem' }} />
            <div style={{ display: 'flex', gap: '.5rem', marginTop: '1rem' }}>
              <button className="btn btn-outline" onClick={() => { setRejectModal(null); setRejectReason(''); }}>Cancel</button>
              <button className="btn" style={{ flex: 1, background: '#C62828', color: '#fff' }} onClick={async () => {
                try {
                  await API.put(`/orders/${rejectModal._id}/reject`, { reason: rejectReason });
                  toast && toast('❌ Offer declined. Buyer notified.');
                  setRejectModal(null);
                  setRejectReason('');
                  fetchOffersAndOrders();
                } catch {
                  toast && toast('❌ Failed');
                }
              }}>❌ Confirm Decline</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
