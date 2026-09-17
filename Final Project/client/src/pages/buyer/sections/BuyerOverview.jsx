import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import API from '../../../api/axios';

export default function BuyerOverview({ toast, onNavigate }) {
  const { currentBuyer } = useAuth();
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    const id = currentBuyer?.id || currentBuyer?._id;
    const name = currentBuyer?.name;
    let query = '';
    if (id && name) query = `?buyerId=${encodeURIComponent(id)}&buyerName=${encodeURIComponent(name)}`;
    else if (id) query = `?buyerId=${encodeURIComponent(id)}`;

    Promise.all([
      API.get(`/orders${query}`).catch(() => ({ data: [] })),
      API.get('/products').catch(() => ({ data: [] })),
      API.get('/requirements').catch(() => ({ data: [] })),
    ]).then(([ordRes, prodRes, reqRes]) => {
      setOrders(ordRes.data || []);
      setProducts(prodRes.data || []);
      setRequirements(reqRes.data?.filter(r => r.buyerId === id || r.buyerName === name) || []);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [currentBuyer]);

  const heldOrders = orders.filter(o => ['payment-held', 'in-transit', 'unload-pending', 'accepted'].includes(o.status));
  const deliveredOrders = orders.filter(o => o.status === 'delivered' || o.escrow?.status === 'released');
  const totalSpent = deliveredOrders.reduce((s, o) => s + (o.totalAmount || 0), 0);
  const pendingActions = orders.filter(o => o.status === 'accepted' || o.status === 'unload-pending');

  const buyerType = currentBuyer?.buyerType || 'Wholesaler';
  const commissionRate = buyerType === 'Bulk Buyer' ? '1.0' : buyerType === 'Retailer' ? '2.0' : '1.5';

  // Get recent fresh listings
  const freshListings = products.slice(0, 6);

  return (
    <>
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.3rem' }}>
            <span style={{ background: '#E3F2FD', color: '#1565C0', padding: '.2rem .6rem', borderRadius: '50px', fontSize: '.72rem', fontWeight: 800 }}>
              🏢 {buyerType} Portal
            </span>
            <span style={{ background: '#E8F5E9', color: '#2E7D32', padding: '.2rem .6rem', borderRadius: '50px', fontSize: '.72rem', fontWeight: 700 }}>
              Platform Fee: {commissionRate}%
            </span>
          </div>
          <h1 style={{ margin: 0 }}>Namaskar, {currentBuyer?.name || 'Buyer'}! 👋</h1>
          <p style={{ margin: '.25rem 0 0', color: 'var(--text2)' }}>
            Live procurement dashboard — connected in real-time with verified farmers across Maharashtra
          </p>
        </div>
        <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap' }}>
          <button className="btn btn-green btn-sm" onClick={() => onNavigate && onNavigate('b-market')}>
            🛒 Browse Market
          </button>
          <button className="btn btn-outline btn-sm" onClick={() => onNavigate && onNavigate('b-post-req')}>
            📢 Post Requirement
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="stat-card" style={{ borderLeft: '4px solid #1565C0', cursor: 'pointer' }} onClick={() => onNavigate && onNavigate('b-orders')}>
          <div className="icon-box icon-blue">🛒</div>
          <div className="info"><h3>{orders.length}</h3><p>Total Orders</p></div>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid #F57C00', cursor: 'pointer' }} onClick={() => onNavigate && onNavigate('b-orders')}>
          <div className="icon-box icon-orange">🔒</div>
          <div className="info"><h3>{heldOrders.length}</h3><p>Active in Escrow</p></div>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid #2E7D32', cursor: 'pointer' }} onClick={() => onNavigate && onNavigate('b-orders')}>
          <div className="icon-box icon-green">💰</div>
          <div className="info"><h3>₹{(totalSpent / 1000).toFixed(1)}K</h3><p>Total Procured</p></div>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid #7B1FA2', cursor: 'pointer' }} onClick={() => onNavigate && onNavigate('b-market')}>
          <div className="icon-box icon-purple">🌾</div>
          <div className="info"><h3>{products.length}</h3><p>Live Farm Listings</p></div>
        </div>
      </div>

      {/* Action Alert for Pending Orders */}
      {pendingActions.length > 0 && (
        <div className="card" style={{ marginBottom: '1.5rem', border: '2px solid #FF9800', background: '#FFF8E1' }}>
          <div className="card-header">
            <span className="card-title" style={{ color: '#E65100' }}>⚡ Action Required ({pendingActions.length} Orders)</span>
          </div>
          {pendingActions.map(o => (
            <div key={o._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '.75rem', background: '#fff', borderRadius: '8px', marginBottom: '.5rem', border: '1px solid #FFE0B2', flexWrap: 'wrap', gap: '.5rem' }}>
              <div>
                <b>{o.productName}</b> · {o.qty} qtl from 👨‍🌾 {o.sellerName}
                <div style={{ fontSize: '.78rem', color: '#1565C0', fontWeight: 700 }}>
                  ₹{(o.totalAmount || 0).toLocaleString()} • Status: <b style={{ color: '#E65100' }}>{o.status}</b>
                </div>
              </div>
              <button
                className="btn btn-sm"
                style={{ background: '#1565C0', color: '#fff', fontWeight: 700 }}
                onClick={() => onNavigate && onNavigate('b-orders')}
              >
                Go to Order →
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Recent Orders */}
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="card-title">📦 My Recent Orders</span>
            <button className="btn btn-sm btn-outline" style={{ fontSize: '.75rem' }} onClick={() => onNavigate && onNavigate('b-orders')}>
              View All →
            </button>
          </div>
          {orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text3)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '.5rem' }}>📦</div>
              <div style={{ fontSize: '.85rem' }}>No orders yet</div>
              <button className="btn btn-green btn-sm" style={{ marginTop: '.75rem' }} onClick={() => onNavigate && onNavigate('b-market')}>
                Browse & Buy Now →
              </button>
            </div>
          ) : (
            orders.slice(0, 4).map((o, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '.6rem .8rem', background: '#F9FBE7', borderRadius: '8px', marginBottom: '.5rem', border: '1px solid #E6EE9C' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '.88rem' }}>🌾 {o.productName}</div>
                  <div style={{ fontSize: '.75rem', color: 'var(--text2)' }}>{o.qty} qtl • ₹{(o.totalAmount || 0).toLocaleString()}</div>
                </div>
                <span style={{
                  fontSize: '.72rem', padding: '.15rem .5rem', borderRadius: '50px', fontWeight: 700,
                  background: o.status === 'delivered' ? '#E8F5E9' : o.status === 'in-transit' ? '#E3F2FD' : '#FFF3E0',
                  color: o.status === 'delivered' ? '#1B5E20' : o.status === 'in-transit' ? '#1565C0' : '#E65100'
                }}>
                  {o.status}
                </span>
              </div>
            ))
          )}
        </div>

        {/* My Requirements */}
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="card-title">📋 My Posted Requirements</span>
            <button className="btn btn-sm btn-outline" style={{ fontSize: '.75rem' }} onClick={() => onNavigate && onNavigate('b-my-reqs')}>
              View All →
            </button>
          </div>
          {requirements.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text3)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '.5rem' }}>📢</div>
              <div style={{ fontSize: '.85rem' }}>No requirements posted yet</div>
              <button className="btn btn-outline btn-sm" style={{ marginTop: '.75rem' }} onClick={() => onNavigate && onNavigate('b-post-req')}>
                Post Requirement →
              </button>
            </div>
          ) : (
            requirements.slice(0, 4).map((r, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '.6rem .8rem', background: '#F3E5F5', borderRadius: '8px', marginBottom: '.5rem', border: '1px solid #CE93D8' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '.88rem' }}>🌾 {r.crop || r.commodity}</div>
                  <div style={{ fontSize: '.75rem', color: 'var(--text2)' }}>{r.qty} qtl • ₹{r.maxPrice}/qtl max</div>
                </div>
                <span style={{ fontSize: '.72rem', padding: '.15rem .5rem', borderRadius: '50px', fontWeight: 700, background: '#E8EAF6', color: '#311B92' }}>
                  {r.status || 'Active'}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Fresh Crop Listings from Farmers */}
      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="card-title">🌾 Fresh Crop Listings — Available Now</span>
          <button className="btn btn-green btn-sm" onClick={() => onNavigate && onNavigate('b-market')}>
            Browse Full Market →
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
          {loading ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '2rem', color: 'var(--text3)' }}>Loading fresh listings...</div>
          ) : freshListings.length === 0 ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '2rem', color: 'var(--text3)' }}>No listings available right now</div>
          ) : freshListings.map((p, i) => (
            <div key={i} style={{ border: '1px solid var(--border)', borderRadius: '10px', padding: '.85rem', background: '#FAFAFA', cursor: 'pointer' }}
              onClick={() => onNavigate && onNavigate('b-market')}>
              <div style={{ fontSize: '1.5rem', marginBottom: '.3rem' }}>{p.emoji || '🌾'}</div>
              <div style={{ fontWeight: 800, fontSize: '.9rem', color: '#1B5E20' }}>{p.name}</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#1565C0', margin: '.2rem 0' }}>₹{(p.price || 0).toLocaleString()}/qtl</div>
              <div style={{ fontSize: '.75rem', color: 'var(--text2)' }}>📍 {p.loc || 'Maharashtra'}</div>
              <div style={{ fontSize: '.73rem', color: '#2E7D32', fontWeight: 700, marginTop: '.25rem' }}>👨‍🌾 {p.farmer}</div>
              <div style={{ fontSize: '.72rem', color: 'var(--text3)', marginTop: '.1rem' }}>Qty: {p.qty} qtl available</div>
              <button className="btn btn-green btn-sm" style={{ width: '100%', marginTop: '.6rem' }} onClick={e => { e.stopPropagation(); onNavigate && onNavigate('b-market'); }}>
                Procure Now →
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
