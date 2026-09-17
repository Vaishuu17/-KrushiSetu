import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import API from '../../../api/axios';

const categories = ['All', 'Vegetables', 'Grains', 'Fruits', 'Pulses', 'Oilseeds', 'Spices', 'Cash Crops'];

export default function BuyerMarket({ toast }) {
  const { currentBuyer } = useAuth();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('All');
  const [buyModal, setBuyModal] = useState(null);
  const [offerPrice, setOfferPrice] = useState('');
  const [offerQty, setOfferQty] = useState(1);
  const [directEscrow, setDirectEscrow] = useState(true);

  // Real market price
  const [marketData, setMarketData] = useState(null);
  const [marketLoading, setMarketLoading] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(new Date());

  const fetchProducts = () => {
    API.get('/products')
      .then(r => {
        setProducts(r.data);
        setLastSyncTime(new Date());
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchProducts();
    const interval = setInterval(fetchProducts, 3500);
    return () => clearInterval(interval);
  }, []);

  const filtered = products.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || (p.farmer || '').toLowerCase().includes(search.toLowerCase());
    const matchCat = cat === 'All' || (p.cat || '').toLowerCase().includes(cat.toLowerCase());
    return matchSearch && matchCat;
  });

  const openOffer = (p) => {
    setBuyModal(p);
    setOfferPrice(String(p.price || p.minPrice || 2000));
    setOfferQty(Math.min(p.qty || 10, 10));
    setDirectEscrow(true);

    // Fetch real market price for this crop from data.gov.in
    setMarketData(null);
    setMarketLoading(true);
    const buyerState = currentBuyer?.state || currentBuyer?.loc?.split(',')[1]?.trim() || 'Maharashtra';
    const params = new URLSearchParams({ commodity: p.name });
    if (buyerState) params.append('state', buyerState);

    API.get(`/prices/govdata/suggest?${params.toString()}`)
      .then(r => { setMarketData(r.data); setMarketLoading(false); })
      .catch(() => { setMarketData(null); setMarketLoading(false); });
  };

  const sendOffer = async () => {
    if (!buyModal) return;
    const op = parseInt(offerPrice);
    if (!op || op <= 0) { toast && toast('⚠️ Enter a valid price'); return; }

    try {
      await API.post('/orders', {
        productId: buyModal._id,
        productName: buyModal.name,
        qty: offerQty,
        price: buyModal.price || op,
        offeredPrice: op,
        directEscrow: directEscrow,
        buyerName: currentBuyer?.name || 'Reliance Retail Agri Procurement',
        buyerId: currentBuyer?.id || 'KB-8821',
        buyerPhone: currentBuyer?.phone || '9988776655',
        buyerLoc: currentBuyer?.loc || 'Vashi APMC, Navi Mumbai',
        sellerName: buyModal.farmer || 'Ramesh Kumar Patel',
        sellerId: buyModal.sellerId || 'KS-1001',
        sellerPhone: buyModal.sellerPhone || '9876543210',
        sellerLoc: buyModal.loc || 'Nashik, Maharashtra',
      });

      if (directEscrow) {
        toast && toast(`🔒 ₹${(op * offerQty).toLocaleString()} Locked in Escrow! Farmer notified for dispatch.`);
      } else {
        toast && toast(`📩 Offer sent! ₹${op}/qtl × ${offerQty} qtl = ₹${(op * offerQty).toLocaleString()} — waiting for farmer.`);
      }
      setBuyModal(null);
    } catch (e) {
      toast && toast('❌ ' + (e.response?.data?.message || 'Failed'));
    }
  };

  return (
    <>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.3rem' }}>
            <span style={{ background: '#E3F2FD', color: '#1565C0', padding: '.2rem .6rem', borderRadius: '50px', fontSize: '.72rem', fontWeight: 800 }}>
              🛒 Live Farmer Produce Directory
            </span>
            <span style={{ background: '#E8F5E9', color: '#1B5E20', padding: '.2rem .6rem', borderRadius: '50px', fontSize: '.72rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '.35rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2E7D32', animation: 'pulse 1.5s infinite' }} />
              Live Sync with Farmers ({lastSyncTime.toLocaleTimeString()})
            </span>
          </div>
          <h1 style={{ margin: 0 }}>🛒 Browse Live Farmer Produce</h1>
          <p style={{ margin: '.25rem 0 0', color: 'var(--text2)' }}>Direct farm procurement with 100% Escrow Protection. 0% broker fee.</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.2rem', flexWrap: 'wrap' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search crops or farmer names..." style={{ flex: 1, minWidth: '200px', padding: '.6rem 1rem', border: '2px solid var(--border)', borderRadius: 'var(--radius2)', fontFamily: 'var(--font-body)' }} />
        <select value={cat} onChange={e => setCat(e.target.value)} style={{ padding: '.6rem 1rem', border: '2px solid var(--border)', borderRadius: 'var(--radius2)', fontFamily: 'var(--font-body)' }}>
          {categories.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text3)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div><h3>No farm products found</h3>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {filtered.map(p => (
            <div key={p._id} className="card" style={{ padding: '1.25rem', transition: 'all .2s', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1.5px solid #E0E0E0' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ margin: '0 0 .2rem', fontFamily: 'var(--font-head)', color: '#1B5E20' }}>{p.name}</h3>
                    <span style={{ background: '#E8F5E9', color: '#2E7D32', padding: '.15rem .5rem', borderRadius: '4px', fontSize: '.68rem', fontWeight: 700 }}>{p.cat || 'Agri'}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    {p.minPrice && p.maxPrice ? (
                      <div style={{ fontFamily: 'var(--font-head)', fontWeight: 800, color: '#1565C0', fontSize: '1rem' }}>
                        ₹{p.minPrice.toLocaleString()} — ₹{p.maxPrice.toLocaleString()}<span style={{ fontSize: '.65rem', fontWeight: 400, color: 'var(--text2)' }}>/qtl</span>
                      </div>
                    ) : (
                      <div style={{ fontFamily: 'var(--font-head)', fontWeight: 800, color: '#1565C0', fontSize: '1.15rem' }}>
                        ₹{(p.price || 0).toLocaleString()}<span style={{ fontSize: '.7rem', fontWeight: 400, color: 'var(--text2)' }}>/qtl</span>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ background: '#FAFAFA', padding: '.75rem', borderRadius: '8px', margin: '.75rem 0', fontSize: '.82rem', border: '1px solid #EEEEEE' }}>
                  <div>👨‍🌾 <b>Farmer:</b> {p.farmer}</div>
                  <div>📍 <b>Location:</b> {p.loc}</div>
                  <div style={{ color: '#2E7D32', fontWeight: 700, marginTop: '.2rem' }}>📦 Available Lot: {p.qty} quintals</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '.5rem', marginTop: '.5rem' }}>
                <button className="btn btn-green btn-sm" style={{ flex: 1, fontWeight: 800 }} onClick={() => openOffer(p)}>
                  🔒 Direct Escrow Buy / Offer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* OFFER / BUY MODAL */}
      {buyModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(4px)' }} onClick={() => setBuyModal(null)}>
          <div style={{ background: '#fff', borderRadius: '16px', maxWidth: '520px', width: '100%', padding: '1.5rem', boxShadow: '0 20px 60px rgba(0,0,0,.2)', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 .3rem', fontFamily: 'var(--font-head)', color: '#0D47A1' }}>
              🔒 Place Escrow Order / Offer
            </h3>
            <p style={{ fontSize: '.85rem', color: 'var(--text2)', margin: '0 0 1rem' }}>
              Procure <b>{buyModal.name}</b> from <b>{buyModal.farmer}</b> ({buyModal.loc})
            </p>

            {/* Price Advisor */}
            <div style={{ background: '#E8F5E9', borderRadius: '10px', padding: '.75rem', marginBottom: '1rem' }}>
              <div style={{ fontSize: '.85rem', fontWeight: 700, color: '#1B5E20', marginBottom: '.3rem' }}>
                👨‍🌾 Farmer's Target Price
              </div>
              {buyModal.minPrice && buyModal.maxPrice ? (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Min: <b style={{ color: '#1565C0' }}>₹{buyModal.minPrice.toLocaleString()}</b></span>
                  <span>Max: <b style={{ color: '#E65100' }}>₹{buyModal.maxPrice.toLocaleString()}</b></span>
                  <span style={{ fontSize: '.75rem', color: 'var(--text3)' }}>/quintal</span>
                </div>
              ) : (
                <b style={{ color: '#2E7D32' }}>₹{(buyModal.price || 0).toLocaleString()}/qtl</b>
              )}
            </div>

            {/* Quantity Slider */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '.82rem', fontWeight: 700, display: 'flex', justifyContent: 'space-between' }}>
                <span>📦 Quantity to Procure (Quintals)</span>
                <span style={{ color: '#1565C0', fontWeight: 800 }}>{offerQty} qtl (out of {buyModal.qty} available)</span>
              </label>
              <input
                type="range"
                min="1"
                max={buyModal.qty || 50}
                value={offerQty}
                onChange={e => setOfferQty(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: '#1565C0', marginTop: '.4rem' }}
              />
            </div>

            {/* Price Input */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '.82rem', fontWeight: 700 }}>💰 Agreed Price (₹/qtl)</label>
              <input
                type="number"
                value={offerPrice}
                onChange={e => setOfferPrice(e.target.value)}
                style={{ width: '100%', padding: '.65rem 1rem', border: '2px solid var(--border)', borderRadius: 'var(--radius2)', fontFamily: 'var(--font-body)', marginTop: '.3rem', fontSize: '1.1rem', fontWeight: 700 }}
              />
            </div>

            {/* Escrow Lock Toggle */}
            <div style={{ background: '#E3F2FD', padding: '.75rem 1rem', borderRadius: '10px', marginBottom: '1rem', border: '1px solid #BBDEFB' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '.6rem', cursor: 'pointer', fontWeight: 700, fontSize: '.85rem', color: '#0D47A1' }}>
                <input
                  type="checkbox"
                  checked={directEscrow}
                  onChange={e => setDirectEscrow(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: '#1565C0' }}
                />
                <span>🔒 Lock 100% Funds in Escrow Immediately (Recommended)</span>
              </label>
              <p style={{ margin: '.3rem 0 0 1.7rem', fontSize: '.72rem', color: 'var(--text2)' }}>
                Funds will be safely held in KrishiSetu Escrow and released only after you verify goods quality at unloading.
              </p>
            </div>

            {/* Total Amount */}
            <div style={{ background: '#F1F8E9', borderRadius: '10px', padding: '.85rem 1rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #C8E6C9' }}>
              <span style={{ fontWeight: 800, color: '#1B5E20' }}>Total Escrow Deposit</span>
              <b style={{ fontSize: '1.35rem', color: '#1B5E20' }}>₹{((parseInt(offerPrice) || 0) * offerQty).toLocaleString()}</b>
            </div>

            <div style={{ display: 'flex', gap: '.5rem' }}>
              <button className="btn btn-outline" onClick={() => setBuyModal(null)}>Cancel</button>
              <button className="btn" style={{ flex: 1, background: '#1565C0', color: '#fff', fontWeight: 800 }} onClick={sendOffer}>
                {directEscrow ? '🔒 Pay & Lock in Escrow' : '📩 Send Offer to Farmer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
