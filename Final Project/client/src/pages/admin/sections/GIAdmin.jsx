import { useState, useEffect } from 'react';
import API from '../../../api/axios';
import Modal from '../../../components/Modal';

const GI_CATEGORIES = ['Fruit', 'Vegetable', 'Grain', 'Spice', 'Fiber', 'Beverage', 'Handicraft'];

export default function GIAdmin({ toast }) {
  const [gis, setGis] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ name: '', origin: '', farmer: '', desc: '', category: 'Fruit', premiumPct: 15 });
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    API.get('/gi').then(r => { setGis(r.data || []); setLoading(false); }).catch(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const verify = async (id) => {
    try {
      await API.put('/gi/' + id + '/verify');
      toast('GI Product verified ✅ — Premium status granted');
      load();
    } catch { toast('❌ Verification failed'); }
  };

  const del = async (id) => {
    if (!confirm('Remove this GI product? This cannot be undone.')) return;
    try {
      await API.delete('/gi/' + id);
      toast('GI product removed 🗑️');
      load();
    } catch { toast('❌ Delete failed'); }
  };

  const saveGI = async () => {
    try {
      if (modal === 'edit' && form._id) {
        await API.put('/gi/' + form._id, form);
        toast('GI Product updated ✅');
      } else {
        await API.post('/gi', { ...form, status: 'Pending' });
        toast('GI Product registered ✅');
      }
      setModal(null);
      load();
    } catch { toast('❌ Save failed'); }
  };

  const filtered = gis.filter(g => {
    const matchS = (g.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (g.origin || '').toLowerCase().includes(search.toLowerCase()) ||
      (g.farmer || '').toLowerCase().includes(search.toLowerCase());
    const matchF = filter === 'All' || g.status === filter;
    return matchS && matchF;
  });

  const verified = gis.filter(g => g.status === 'Verified').length;
  const pending = gis.filter(g => g.status !== 'Verified').length;

  return (
    <>
      <div className="page-header" style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.3rem' }}>
          <span style={{ background: '#E8EAF6', color: '#283593', padding: '.25rem .75rem', borderRadius: '50px', fontSize: '.75rem', fontWeight: 800 }}>
            🔗 Geographical Indication Registry
          </span>
        </div>
        <h1 style={{ margin: 0 }}>GI Products Management</h1>
        <p style={{ color: 'var(--text2)', marginTop: '.25rem' }}>Track, verify, and manage Geographical Indication tagged agricultural products for premium branding & export</p>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="stat-card" style={{ borderLeft: '4px solid #283593' }}>
          <div className="icon-box" style={{ background: '#E8EAF6', color: '#283593' }}>🔗</div>
          <div className="info"><h3>{gis.length}</h3><p>Total GI Products</p></div>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid #2E7D32' }}>
          <div className="icon-box icon-green">✅</div>
          <div className="info"><h3>{verified}</h3><p>Verified & Certified</p></div>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid #F57C00' }}>
          <div className="icon-box icon-orange">⏳</div>
          <div className="info"><h3>{pending}</h3><p>Pending Verification</p></div>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid #7B1FA2' }}>
          <div className="icon-box icon-purple">📈</div>
          <div className="info"><h3>15–30%</h3><p>Avg Premium Earned</p></div>
        </div>
      </div>

      {/* Search + Actions */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by product, origin, or farmer..."
          type="text"
          style={{ flex: 1, minWidth: '220px', padding: '.6rem 1rem', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '.87rem' }}
        />
        <div style={{ display: 'flex', gap: '.5rem' }}>
          {['All', 'Verified', 'Pending'].map(f => (
            <button key={f} className={`tab${filter === f ? ' active' : ''}`} onClick={() => setFilter(f)} style={{ fontSize: '.8rem' }}>
              {f} ({f === 'All' ? gis.length : f === 'Verified' ? verified : pending})
            </button>
          ))}
        </div>
        <button className="btn btn-green btn-sm" onClick={() => { setForm({ name: '', origin: '', farmer: '', desc: '', category: 'Fruit', premiumPct: 15 }); setModal('add'); }}>
          + Register GI Product
        </button>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div className="empty-state"><div className="e-icon">⏳</div><p>Loading GI products...</p></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state"><div className="e-icon">🔗</div><p>No GI products found</p></div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F5F7FA', textAlign: 'left' }}>
                {['Product Name', 'Category', 'Origin District', 'Farmer/FPO', 'Premium %', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '.65rem 1rem', fontSize: '.8rem', fontWeight: 700, color: 'var(--text2)', borderBottom: '1px solid var(--border)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((g, i) => (
                <tr key={g._id || i} style={{ borderBottom: '1px solid #F0F0F0' }}>
                  <td style={{ padding: '.65rem 1rem' }}>
                    <div style={{ fontWeight: 800, fontSize: '.9rem' }}>🏷️ {g.name}</div>
                    {g.desc && <div style={{ fontSize: '.73rem', color: 'var(--text3)', marginTop: '.1rem' }}>{(g.desc || '').substring(0, 60)}...</div>}
                  </td>
                  <td style={{ padding: '.65rem 1rem' }}>
                    <span style={{ background: '#E8EAF6', color: '#283593', padding: '.15rem .5rem', borderRadius: '50px', fontSize: '.75rem', fontWeight: 700 }}>
                      {g.category || 'Unclassified'}
                    </span>
                  </td>
                  <td style={{ padding: '.65rem 1rem', fontSize: '.84rem' }}>📍 {g.origin}</td>
                  <td style={{ padding: '.65rem 1rem', fontSize: '.84rem', fontWeight: 600 }}>👨‍🌾 {g.farmer}</td>
                  <td style={{ padding: '.65rem 1rem', fontWeight: 800, color: '#2E7D32', fontSize: '.9rem' }}>+{g.premiumPct || 15}%</td>
                  <td style={{ padding: '.65rem 1rem' }}>
                    <span style={{
                      fontSize: '.75rem', padding: '.2rem .55rem', borderRadius: '50px', fontWeight: 700,
                      background: g.status === 'Verified' ? '#E8F5E9' : '#FFF3E0',
                      color: g.status === 'Verified' ? '#1B5E20' : '#E65100'
                    }}>
                      {g.status === 'Verified' ? '✅ Verified' : '⏳ Pending'}
                    </span>
                  </td>
                  <td style={{ padding: '.65rem 1rem' }}>
                    <div style={{ display: 'flex', gap: '.4rem', flexWrap: 'wrap' }}>
                      {g.status !== 'Verified' && (
                        <button className="btn btn-green btn-sm" onClick={() => verify(g._id)}>✅ Certify</button>
                      )}
                      <button className="btn btn-warn btn-sm" onClick={() => { setForm({ ...g }); setModal('edit'); }}>✏️ Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => del(g._id)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal open={!!modal} title={modal === 'edit' ? '✏️ Edit GI Product' : '🔗 Register New GI Product'} onClose={() => setModal(null)}>
        <div className="form-row">
          <div className="form-group">
            <label>Product Name</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Nashik Red Grapes" type="text" />
          </div>
          <div className="form-group">
            <label>Category</label>
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
              {GI_CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Origin District</label>
            <input value={form.origin} onChange={e => setForm({ ...form, origin: e.target.value })} placeholder="e.g. Nashik, Maharashtra" type="text" />
          </div>
          <div className="form-group">
            <label>Farmer / FPO Name</label>
            <input value={form.farmer} onChange={e => setForm({ ...form, farmer: e.target.value })} placeholder="Registered farmer or cooperative" type="text" />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Premium % (over MSP)</label>
            <input value={form.premiumPct} onChange={e => setForm({ ...form, premiumPct: parseInt(e.target.value) || 0 })} type="number" min="0" max="100" />
          </div>
        </div>
        <div className="form-group">
          <label>Description / GI Certificate Note</label>
          <textarea value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} rows="3" placeholder="Product description and GI tag details..." />
        </div>
        <button className="btn btn-green" onClick={saveGI} style={{ width: '100%', marginTop: '.5rem' }}>
          {modal === 'edit' ? '✅ Update GI Product' : '🔗 Register GI Product'}
        </button>
      </Modal>
    </>
  );
}
