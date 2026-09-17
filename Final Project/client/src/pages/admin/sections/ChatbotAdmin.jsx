import { useState, useEffect } from 'react';
import API from '../../../api/axios';
import Modal from '../../../components/Modal';

export default function ChatbotAdmin({ toast }) {
  const [qas, setQas] = useState([]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ keywords: '', answer: '' });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    API.get('/chat').then(r => { setQas(r.data || []); setLoading(false); }).catch(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    try {
      const data = {
        keywords: form.keywords.split(',').map(k => k.trim().toLowerCase()).filter(Boolean),
        answer: form.answer,
        category: form.category || 'General',
        lang: form.lang || 'hi+mr+en'
      };
      if (modal === 'edit' && form._id) {
        await API.put('/chat/' + form._id, data);
        toast('Q&A updated ✅');
      } else {
        await API.post('/chat', data);
        toast('Q&A added ✅');
      }
      setModal(null);
      load();
    } catch { toast('❌ Save failed'); }
  };

  const del = async (id) => {
    if (!confirm('Delete this Q&A pair?')) return;
    await API.delete('/chat/' + id);
    toast('Deleted 🗑️');
    load();
  };

  const filtered = qas.filter(q =>
    (q.keywords || []).some(k => k.includes(search.toLowerCase())) ||
    (q.answer || '').toLowerCase().includes(search.toLowerCase()) ||
    (q.category || '').toLowerCase().includes(search.toLowerCase())
  );

  // Simulated usage stats
  const stats = {
    totalQueries: 4832,
    resolvedRate: '87.3%',
    avgResponseTime: '1.2s',
    topTopic: 'Market Prices',
  };

  const categories = ['General', 'Market Prices', 'Weather', 'Schemes', 'Loans', 'Transport', 'Orders', 'Registration'];

  return (
    <>
      <div className="page-header" style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.3rem' }}>
          <span style={{ background: '#E8EAF6', color: '#311B92', padding: '.25rem .75rem', borderRadius: '50px', fontSize: '.75rem', fontWeight: 800 }}>
            🤖 KrishiSetu AI Chatbot Engine
          </span>
        </div>
        <h1 style={{ margin: 0 }}>Chatbot Q&A Knowledge Base</h1>
        <p style={{ color: 'var(--text2)', marginTop: '.25rem' }}>
          Manage the multilingual farmer chatbot knowledge base — keyword-matched responses in Hindi, Marathi, and English
        </p>
      </div>

      {/* Usage Stats */}
      <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="stat-card" style={{ borderLeft: '4px solid #311B92' }}>
          <div className="icon-box" style={{ background: '#E8EAF6', color: '#311B92' }}>🤖</div>
          <div className="info"><h3>{qas.length}</h3><p>Knowledge Base Entries</p></div>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid #2E7D32' }}>
          <div className="icon-box icon-green">💬</div>
          <div className="info"><h3>{stats.totalQueries.toLocaleString()}</h3><p>Total Queries (30d)</p></div>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid #1565C0' }}>
          <div className="icon-box icon-blue">✅</div>
          <div className="info"><h3>{stats.resolvedRate}</h3><p>Resolution Rate</p></div>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid #F57C00' }}>
          <div className="icon-box icon-orange">⚡</div>
          <div className="info"><h3>{stats.avgResponseTime}</h3><p>Avg Response Time</p></div>
        </div>
      </div>

      {/* Popular Topics */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
        <div style={{ fontWeight: 800, marginBottom: '.65rem', color: '#311B92' }}>🔥 Top Farmer Query Topics (Last 30 Days)</div>
        <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
          {[
            { label: 'Market Prices', pct: 32, color: '#1565C0' },
            { label: 'Weather Advisory', pct: 18, color: '#00897B' },
            { label: 'Government Schemes', pct: 16, color: '#2E7D32' },
            { label: 'Loan Application', pct: 12, color: '#7B1FA2' },
            { label: 'Mandi Location', pct: 10, color: '#E65100' },
            { label: 'Transport Booking', pct: 7, color: '#1565C0' },
            { label: 'Order Status', pct: 5, color: '#C62828' },
          ].map(t => (
            <div key={t.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.25rem', minWidth: '80px' }}>
              <div style={{ width: '60px', height: '6px', borderRadius: '3px', background: '#F0F0F0', overflow: 'hidden' }}>
                <div style={{ width: t.pct + '%', height: '100%', background: t.color, borderRadius: '3px' }} />
              </div>
              <span style={{ fontSize: '.72rem', fontWeight: 700, color: t.color }}>{t.pct}%</span>
              <span style={{ fontSize: '.68rem', color: 'var(--text3)', textAlign: 'center' }}>{t.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Search + Add */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search keywords or answers..."
          type="text"
          style={{ flex: 1, minWidth: '220px', padding: '.6rem 1rem', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '.87rem' }}
        />
        <button className="btn btn-green btn-sm" onClick={() => { setForm({ keywords: '', answer: '', category: 'General', lang: 'hi+mr+en' }); setModal('add'); }}>
          + Add Q&A
        </button>
        <button className="btn btn-outline btn-sm" onClick={load}>🔄 Refresh</button>
      </div>

      {/* Q&A Table */}
      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div className="empty-state"><div className="e-icon">⏳</div><p>Loading knowledge base...</p></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state"><div className="e-icon">🤖</div><p>No Q&A entries found</p></div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F5F7FA', textAlign: 'left' }}>
                {['Keywords / Triggers', 'Category', 'Answer Preview', 'Languages', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '.65rem 1rem', fontSize: '.8rem', fontWeight: 700, color: 'var(--text2)', borderBottom: '1px solid var(--border)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((q, i) => (
                <tr key={q._id || i} style={{ borderBottom: '1px solid #F0F0F0' }}>
                  <td style={{ padding: '.65rem 1rem', maxWidth: '200px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.2rem' }}>
                      {(q.keywords || []).slice(0, 4).map((k, j) => (
                        <span key={j} style={{ background: '#E8EAF6', color: '#311B92', padding: '.1rem .4rem', borderRadius: '50px', fontSize: '.72rem', fontWeight: 700 }}>
                          {k}
                        </span>
                      ))}
                      {(q.keywords || []).length > 4 && (
                        <span style={{ fontSize: '.72rem', color: 'var(--text3)' }}>+{q.keywords.length - 4} more</span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '.65rem 1rem' }}>
                    <span style={{ background: '#F3E5F5', color: '#7B1FA2', padding: '.15rem .5rem', borderRadius: '50px', fontSize: '.75rem', fontWeight: 700 }}>
                      {q.category || 'General'}
                    </span>
                  </td>
                  <td style={{ padding: '.65rem 1rem', fontSize: '.82rem', color: 'var(--text2)', maxWidth: '300px' }}>
                    {(q.answer || '').substring(0, 90)}{(q.answer || '').length > 90 ? '...' : ''}
                  </td>
                  <td style={{ padding: '.65rem 1rem', fontSize: '.77rem', color: '#1565C0', fontWeight: 700 }}>
                    {q.lang || 'hi+mr+en'}
                  </td>
                  <td style={{ padding: '.65rem 1rem' }}>
                    <div style={{ display: 'flex', gap: '.4rem' }}>
                      <button className="btn btn-warn btn-sm" onClick={() => { setForm({ ...q, keywords: (q.keywords || []).join(', ') }); setModal('edit'); }}>✏️</button>
                      <button className="btn btn-danger btn-sm" onClick={() => del(q._id)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal open={!!modal} title={modal === 'edit' ? '✏️ Edit Q&A Entry' : '🤖 Add Chatbot Q&A'} onClose={() => setModal(null)}>
        <div className="form-row">
          <div className="form-group">
            <label>Category</label>
            <select value={form.category || 'General'} onChange={e => setForm({ ...form, category: e.target.value })}>
              {categories.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Languages</label>
            <select value={form.lang || 'hi+mr+en'} onChange={e => setForm({ ...form, lang: e.target.value })}>
              <option value="hi+mr+en">Hindi + Marathi + English</option>
              <option value="hi">Hindi Only</option>
              <option value="mr">Marathi Only</option>
              <option value="en">English Only</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label>Trigger Keywords (comma-separated, will match farmer queries)</label>
          <input
            value={form.keywords}
            onChange={e => setForm({ ...form, keywords: e.target.value })}
            type="text"
            placeholder="e.g. bhav, price, keemat, mandi, market"
          />
          <small style={{ color: 'var(--text3)', fontSize: '.75rem' }}>Use common farmer words in Hindi/Marathi too</small>
        </div>
        <div className="form-group">
          <label>Answer (shown to farmer when keywords match)</label>
          <textarea
            value={form.answer}
            onChange={e => setForm({ ...form, answer: e.target.value })}
            rows="5"
            placeholder="Write a helpful, farmer-friendly answer in the farmer's language..."
          />
        </div>
        <button className="btn btn-green" onClick={save} style={{ width: '100%', marginTop: '.5rem' }}>
          {modal === 'edit' ? '✅ Update Q&A' : '🤖 Add to Knowledge Base'}
        </button>
      </Modal>
    </>
  );
}
