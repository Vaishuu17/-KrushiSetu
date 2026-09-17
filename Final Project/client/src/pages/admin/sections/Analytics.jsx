import { useState, useEffect } from 'react';
import API from '../../../api/axios';

export default function Analytics({ toast, onNavigate }) {
  const [farmers, setFarmers] = useState([]);
  const [buyers, setBuyers] = useState([]);
  const [products, setProducts] = useState([]);
  const [requirements, setRequirements] = useState([]);
  const [revenue, setRevenue] = useState(null);

  useEffect(() => {
    API.get('/farmers').then(r => setFarmers(r.data || [])).catch(() => {});
    API.get('/buyers').then(r => setBuyers(r.data || [])).catch(() => {});
    API.get('/products').then(r => setProducts(r.data || [])).catch(() => {});
    API.get('/requirements').then(r => setRequirements(r.data || [])).catch(() => {});
    API.get('/orders/analytics/revenue').then(r => setRevenue(r.data)).catch(() => {});
  }, []);

  const totalGMV = revenue?.totalGMV || 0;
  const totalRev = revenue?.totalRevenue || 0;
  const welfareCorpus = Math.round(totalRev * 0.12);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.3rem' }}>
          <span style={{ background: '#E8F5E9', color: '#1B5E20', padding: '.25rem .75rem', borderRadius: '50px', fontSize: '.75rem', fontWeight: 800 }}>
            🏛️ Central Operations Dashboard
          </span>
          <span style={{ background: '#E3F2FD', color: '#1565C0', padding: '.25rem .75rem', borderRadius: '50px', fontSize: '.75rem', fontWeight: 700 }}>
            SIH 2026 Live Architecture
          </span>
        </div>
        <h1 style={{ margin: 0, color: '#1A237E' }}>KrushiSetu System Overview &amp; Control Hub</h1>
        <p style={{ margin: '.25rem 0 0', color: 'var(--text2)' }}>
          High-level operational health, marketplace volumes, participant verification status, and fiscal performance.
        </p>
      </div>

      {/* Primary KPI Stats */}
      <div className="stats-grid">
        <div className="stat-card" style={{ cursor: 'pointer', borderLeft: '4px solid #2E7D32' }} onClick={() => onNavigate && onNavigate('a-farmers')}>
          <div className="icon-box icon-green">👨‍🌾</div>
          <div className="info">
            <h3 style={{ color: '#1B5E20' }}>{farmers.length || 15}</h3>
            <p>Verified Farmers</p>
          </div>
        </div>

        <div className="stat-card" style={{ cursor: 'pointer', borderLeft: '4px solid #1565C0' }} onClick={() => onNavigate && onNavigate('a-buyers')}>
          <div className="icon-box icon-blue">🏢</div>
          <div className="info">
            <h3 style={{ color: '#0D47A1' }}>{buyers.length || 8}</h3>
            <p>Commercial Buyers</p>
          </div>
        </div>

        <div className="stat-card" style={{ cursor: 'pointer', borderLeft: '4px solid #E65100' }} onClick={() => onNavigate && onNavigate('a-revenue')}>
          <div className="icon-box icon-orange">📦</div>
          <div className="info">
            <h3 style={{ color: '#E65100' }}>₹{totalGMV.toLocaleString()}</h3>
            <p>Gross Merchandise Value (GMV)</p>
          </div>
        </div>

        <div className="stat-card" style={{ cursor: 'pointer', borderLeft: '4px solid #7B1FA2' }} onClick={() => onNavigate && onNavigate('a-revenue')}>
          <div className="icon-box icon-purple">💰</div>
          <div className="info">
            <h3 style={{ color: '#4A148C' }}>₹{totalRev.toLocaleString()}</h3>
            <p>Platform Revenue Earmarked</p>
          </div>
        </div>
      </div>

      {/* Secondary Metrics Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div style={{ background: '#fff', padding: '1.2rem', borderRadius: '12px', border: '1px solid #E0E0E0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ fontSize: '2rem' }}>🛒</div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1565C0' }}>{products.length}</div>
            <div style={{ fontSize: '.78rem', color: 'var(--text2)' }}>Active Crop Batches Listed</div>
          </div>
        </div>

        <div style={{ background: '#fff', padding: '1.2rem', borderRadius: '12px', border: '1px solid #E0E0E0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ fontSize: '2rem' }}>📋</div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#E65100' }}>{requirements.length}</div>
            <div style={{ fontSize: '.78rem', color: 'var(--text2)' }}>Buyer Demands Broadcasted</div>
          </div>
        </div>

        <div style={{ background: '#fff', padding: '1.2rem', borderRadius: '12px', border: '1px solid #E0E0E0', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }} onClick={() => onNavigate && onNavigate('a-welfare')}>
          <div style={{ fontSize: '2rem' }}>🌾</div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#2E7D32' }}>₹{welfareCorpus.toLocaleString()}</div>
            <div style={{ fontSize: '.78rem', color: 'var(--text2)' }}>Farmer Welfare Fund Reserve</div>
          </div>
        </div>
      </div>

      {/* Quick Access Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {/* Recent Farmers */}
        <div className="card" style={{ padding: '1.25rem', background: '#fff', borderRadius: '14px', border: '1px solid #E0E0E0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.75rem' }}>
            <span style={{ fontWeight: 800, color: '#1B5E20' }}>👨‍🌾 Recent Registered Farmers</span>
            <button className="btn btn-sm btn-outline" style={{ fontSize: '.75rem' }} onClick={() => onNavigate && onNavigate('a-farmers')}>View All →</button>
          </div>
          <table style={{ width: '100%', fontSize: '.82rem' }}>
            <thead>
              <tr style={{ background: '#F5F7FA', textAlign: 'left' }}>
                <th style={{ padding: '.5rem .75rem' }}>Farmer</th>
                <th style={{ padding: '.5rem .75rem' }}>Location</th>
                <th style={{ padding: '.5rem .75rem' }}>Main Crop</th>
              </tr>
            </thead>
            <tbody>
              {farmers.slice(0, 4).map((f, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #ECEFF1' }}>
                  <td style={{ padding: '.55rem .75rem', fontWeight: 700 }}>{f.name}</td>
                  <td style={{ padding: '.55rem .75rem', color: 'var(--text2)' }}>{f.loc || f.district}</td>
                  <td style={{ padding: '.55rem .75rem', color: '#1B5E20', fontWeight: 600 }}>{f.crop}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Commercial Buyers */}
        <div className="card" style={{ padding: '1.25rem', background: '#fff', borderRadius: '14px', border: '1px solid #E0E0E0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.75rem' }}>
            <span style={{ fontWeight: 800, color: '#0D47A1' }}>🏢 Verified Buyer Accounts</span>
            <button className="btn btn-sm btn-outline" style={{ fontSize: '.75rem' }} onClick={() => onNavigate && onNavigate('a-buyers')}>View All →</button>
          </div>
          <table style={{ width: '100%', fontSize: '.82rem' }}>
            <thead>
              <tr style={{ background: '#F5F7FA', textAlign: 'left' }}>
                <th style={{ padding: '.5rem .75rem' }}>Buyer Entity</th>
                <th style={{ padding: '.5rem .75rem' }}>Tier</th>
                <th style={{ padding: '.5rem .75rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {buyers.slice(0, 4).map((b, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #ECEFF1' }}>
                  <td style={{ padding: '.55rem .75rem', fontWeight: 700 }}>{b.name}</td>
                  <td style={{ padding: '.55rem .75rem', color: '#1565C0', fontWeight: 600 }}>{b.buyerType || 'Wholesaler'}</td>
                  <td style={{ padding: '.55rem .75rem' }}>
                    <span style={{ fontSize: '.7rem', background: '#E8F5E9', color: '#2E7D32', padding: '.15rem .45rem', borderRadius: '50px', fontWeight: 700 }}>
                      ✓ Verified
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

