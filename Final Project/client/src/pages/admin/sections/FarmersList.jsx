import { useState, useEffect } from 'react';
import API from '../../../api/axios';

export default function FarmersList({ toast }) {
  const [farmers, setFarmers] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    API.get('/farmers').then(r => { setFarmers(r.data || []); setLoading(false); }).catch(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const handleToggleStatus = async (farmer) => {
    const newStatus = farmer.status === 'Suspended' ? 'Active' : 'Suspended';
    try {
      await API.put(`/farmers/${farmer._id || farmer.id}`, { ...farmer, status: newStatus });
      toast(`Farmer ${farmer.name} marked as ${newStatus} ✅`);
      load();
    } catch { toast('❌ Action failed'); }
  };

  const filtered = farmers.filter(f => {
    const matchSearch = (f.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (f.id || '').toLowerCase().includes(search.toLowerCase()) ||
      (f.loc || '').toLowerCase().includes(search.toLowerCase()) ||
      (f.crop || '').toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'All' || (filter === 'Active' ? (f.status || 'Active') === 'Active' : f.status === filter);
    return matchSearch && matchFilter;
  });

  const statColors = { Active: '#2E7D32', Suspended: '#C62828', Pending: '#E65100' };
  const totalLand = farmers.reduce((s, f) => s + (parseFloat(f.land) || 0), 0);
  const totalIncome = farmers.reduce((s, f) => s + (f.income || 0), 0);

  return (
    <>
      <div className="page-header" style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.3rem' }}>
          <span style={{ background: '#E8F5E9', color: '#1B5E20', padding: '.25rem .75rem', borderRadius: '50px', fontSize: '.75rem', fontWeight: 800 }}>
            👨‍🌾 Farmers Registry
          </span>
        </div>
        <h1 style={{ margin: 0 }}>Registered Farmers Management</h1>
        <p style={{ color: 'var(--text2)', marginTop: '.25rem' }}>View, verify, and manage all onboarded farmers on the platform</p>
      </div>

      {/* KPI Stats */}
      <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="stat-card" style={{ borderLeft: '4px solid #2E7D32' }}>
          <div className="icon-box icon-green">👨‍🌾</div>
          <div className="info"><h3>{farmers.length}</h3><p>Total Registered</p></div>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid #1565C0' }}>
          <div className="icon-box icon-blue">✅</div>
          <div className="info"><h3>{farmers.filter(f => (f.status || 'Active') === 'Active').length}</h3><p>Active Farmers</p></div>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid #F57C00' }}>
          <div className="icon-box icon-orange">🌾</div>
          <div className="info"><h3>{totalLand.toFixed(1)} ac</h3><p>Total Cultivable Land</p></div>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid #7B1FA2' }}>
          <div className="icon-box icon-purple">💰</div>
          <div className="info"><h3>₹{(totalIncome / 1000).toFixed(0)}K</h3><p>Estimated Platform Earnings</p></div>
        </div>
      </div>

      {/* Search + Filter */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, ID, crop, location..."
          type="text"
          style={{ flex: 1, minWidth: '240px', padding: '.6rem 1rem', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '.87rem' }}
        />
        <div style={{ display: 'flex', gap: '.5rem' }}>
          {['All', 'Active', 'Suspended'].map(f => (
            <button key={f}
              className={`tab${filter === f ? ' active' : ''}`}
              onClick={() => setFilter(f)}
              style={{ fontSize: '.8rem' }}
            >
              {f}
              {f !== 'All' && ` (${farmers.filter(fr => f === 'Active' ? (fr.status || 'Active') === 'Active' : fr.status === f).length})`}
            </button>
          ))}
        </div>
        <button className="btn btn-outline btn-sm" onClick={load}>🔄 Refresh</button>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div className="empty-state"><div className="e-icon">⏳</div><p>Loading farmers...</p></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state"><div className="e-icon">👨‍🌾</div><p>No farmers found</p></div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F5F7FA', textAlign: 'left' }}>
                <th style={{ padding: '.65rem 1rem', fontSize: '.8rem', fontWeight: 700, color: 'var(--text2)', borderBottom: '1px solid var(--border)' }}>Farmer ID</th>
                <th style={{ padding: '.65rem 1rem', fontSize: '.8rem', fontWeight: 700, color: 'var(--text2)', borderBottom: '1px solid var(--border)' }}>Name</th>
                <th style={{ padding: '.65rem 1rem', fontSize: '.8rem', fontWeight: 700, color: 'var(--text2)', borderBottom: '1px solid var(--border)' }}>Location</th>
                <th style={{ padding: '.65rem 1rem', fontSize: '.8rem', fontWeight: 700, color: 'var(--text2)', borderBottom: '1px solid var(--border)' }}>Land</th>
                <th style={{ padding: '.65rem 1rem', fontSize: '.8rem', fontWeight: 700, color: 'var(--text2)', borderBottom: '1px solid var(--border)' }}>Primary Crop</th>
                <th style={{ padding: '.65rem 1rem', fontSize: '.8rem', fontWeight: 700, color: 'var(--text2)', borderBottom: '1px solid var(--border)' }}>Income</th>
                <th style={{ padding: '.65rem 1rem', fontSize: '.8rem', fontWeight: 700, color: 'var(--text2)', borderBottom: '1px solid var(--border)' }}>Status</th>
                <th style={{ padding: '.65rem 1rem', fontSize: '.8rem', fontWeight: 700, color: 'var(--text2)', borderBottom: '1px solid var(--border)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((f, i) => (
                <>
                  <tr key={f._id || i}
                    style={{ borderBottom: '1px solid #F0F0F0', cursor: 'pointer', background: expanded === i ? '#F9FBE7' : 'transparent' }}
                    onClick={() => setExpanded(expanded === i ? null : i)}
                  >
                    <td style={{ padding: '.65rem 1rem', fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '.8rem', color: '#1565C0' }}>
                      {f.id || f._id?.toString().slice(-6).toUpperCase()}
                    </td>
                    <td style={{ padding: '.65rem 1rem' }}>
                      <div style={{ fontWeight: 700, fontSize: '.88rem' }}>{f.name}</div>
                      <div style={{ fontSize: '.72rem', color: 'var(--text3)' }}>📱 {f.phone || 'N/A'}</div>
                    </td>
                    <td style={{ padding: '.65rem 1rem', fontSize: '.83rem', color: 'var(--text2)' }}>📍 {f.loc || f.district || '—'}</td>
                    <td style={{ padding: '.65rem 1rem', fontSize: '.83rem', fontWeight: 600 }}>{f.land || '—'} ac</td>
                    <td style={{ padding: '.65rem 1rem' }}>
                      <span style={{ background: '#E8F5E9', color: '#1B5E20', padding: '.15rem .5rem', borderRadius: '50px', fontSize: '.75rem', fontWeight: 700 }}>
                        🌾 {f.crop || 'General'}
                      </span>
                    </td>
                    <td style={{ padding: '.65rem 1rem', fontSize: '.83rem', fontWeight: 700, color: '#2E7D32' }}>
                      ₹{(f.income || 0).toLocaleString()}
                    </td>
                    <td style={{ padding: '.65rem 1rem' }}>
                      <span style={{
                        fontSize: '.72rem', padding: '.2rem .55rem', borderRadius: '50px', fontWeight: 700,
                        background: (f.status || 'Active') === 'Active' ? '#E8F5E9' : '#FFEBEE',
                        color: statColors[f.status || 'Active'] || '#2E7D32'
                      }}>
                        {f.status || 'Active'}
                      </span>
                    </td>
                    <td style={{ padding: '.65rem 1rem' }}>
                      <button
                        className="btn btn-sm"
                        style={{
                          background: (f.status || 'Active') === 'Active' ? '#FFEBEE' : '#E8F5E9',
                          color: (f.status || 'Active') === 'Active' ? '#C62828' : '#2E7D32',
                          border: 'none', fontWeight: 700, fontSize: '.75rem'
                        }}
                        onClick={e => { e.stopPropagation(); handleToggleStatus(f); }}
                      >
                        {(f.status || 'Active') === 'Active' ? '⛔ Suspend' : '✅ Restore'}
                      </button>
                    </td>
                  </tr>
                  {expanded === i && (
                    <tr key={`exp-${i}`} style={{ background: '#FFFDE7' }}>
                      <td colSpan={8} style={{ padding: '1rem 1.5rem', borderBottom: '2px solid #FDD835' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                          <div>
                            <div style={{ fontSize: '.72rem', color: 'var(--text3)', fontWeight: 700, marginBottom: '.2rem', textTransform: 'uppercase' }}>Full Details</div>
                            <div style={{ fontSize: '.84rem' }}><b>Bank A/C:</b> {f.bank || 'Not linked'}</div>
                            <div style={{ fontSize: '.84rem' }}><b>Aadhaar:</b> {f.aadhaar || 'Not linked'}</div>
                            <div style={{ fontSize: '.84rem' }}><b>Category:</b> {f.category || 'General'}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: '.72rem', color: 'var(--text3)', fontWeight: 700, marginBottom: '.2rem', textTransform: 'uppercase' }}>Farm Info</div>
                            <div style={{ fontSize: '.84rem' }}><b>Season:</b> {f.season || 'Kharif'}</div>
                            <div style={{ fontSize: '.84rem' }}><b>Water:</b> {f.water || 'Rainfed'}</div>
                            <div style={{ fontSize: '.84rem' }}><b>Soil:</b> {f.soil || 'Red Laterite'}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: '.72rem', color: 'var(--text3)', fontWeight: 700, marginBottom: '.2rem', textTransform: 'uppercase' }}>Platform Activity</div>
                            <div style={{ fontSize: '.84rem' }}><b>Joined:</b> {f.createdAt ? new Date(f.createdAt).toLocaleDateString('en-IN') : 'N/A'}</div>
                            <div style={{ fontSize: '.84rem' }}><b>Orders:</b> {f.orderCount || 0} completed</div>
                            <div style={{ fontSize: '.84rem' }}><b>Rating:</b> {f.rating ? `⭐ ${f.rating}` : 'Unrated'}</div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div style={{ textAlign: 'right', marginTop: '.5rem', fontSize: '.75rem', color: 'var(--text3)' }}>
        Showing {filtered.length} of {farmers.length} farmers • Click a row to expand details
      </div>
    </>
  );
}
