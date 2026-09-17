import { useState, useEffect } from 'react';
import API from '../../../api/axios';

const BUYER_TYPES = ['All', 'Bulk Buyer', 'Wholesaler', 'Retailer', 'Institutional Buyer'];
const STATUS_OPTIONS = ['All', 'Verified', 'Pending Verification', 'Unverified'];

export default function BuyersAdmin({ toast }) {
  const [buyers, setBuyers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  const fetchBuyers = () => {
    setLoading(true);
    let params = new URLSearchParams();
    if (selectedType !== 'All') params.append('buyerType', selectedType);
    if (selectedStatus !== 'All') params.append('status', selectedStatus);
    if (search) params.append('search', search);

    API.get(`/buyers?${params.toString()}`)
      .then(res => {
        setBuyers(res.data || []);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchBuyers();
  }, [selectedType, selectedStatus]);

  const handleToggleVerification = async (buyer) => {
    const nextStatus = buyer.verificationStatus === 'Verified' ? 'Pending Verification' : 'Verified';
    try {
      await API.put(`/buyers/${buyer.id || buyer._id}/verify`, { verificationStatus: nextStatus });
      toast && toast(`Updated verification for ${buyer.name} to ${nextStatus}`);
      fetchBuyers();
    } catch {
      toast && toast('❌ Failed to update verification status');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.3rem' }}>
            <span style={{ background: '#E3F2FD', color: '#1565C0', padding: '.25rem .75rem', borderRadius: '50px', fontSize: '.75rem', fontWeight: 800 }}>
              🏢 Enterprise Buyer Directory
            </span>
            <span style={{ background: '#E8F5E9', color: '#1B5E20', padding: '.25rem .75rem', borderRadius: '50px', fontSize: '.75rem', fontWeight: 700 }}>
              Tier Classification &amp; KYC
            </span>
          </div>
          <h1 style={{ margin: 0, color: '#0D47A1' }}>Buyer Management &amp; Verification</h1>
          <p style={{ margin: '.25rem 0 0', color: 'var(--text2)' }}>
            Manage commercial buyers across Bulk, Wholesaler, Retailer, and Institutional tiers. Verify GST and KYC credentials.
          </p>
        </div>

        <button
          onClick={fetchBuyers}
          className="btn btn-outline btn-sm"
          style={{ padding: '.5rem 1rem', fontWeight: 700 }}
        >
          🔄 Refresh Directory
        </button>
      </div>

      {/* Filter & Search Controls */}
      <div className="card" style={{ padding: '1.25rem', background: '#fff', borderRadius: '14px', border: '1px solid #E0E0E0', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap', flex: 1, minWidth: '280px' }}>
          <input
            type="text"
            placeholder="🔍 Search by buyer name, business, phone, or location..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchBuyers()}
            style={{ flex: 1, minWidth: '220px', padding: '.55rem .85rem', borderRadius: '8px', border: '1px solid #CFD8DC', fontSize: '.85rem' }}
          />
          <button
            onClick={fetchBuyers}
            className="btn btn-primary btn-sm"
            style={{ background: '#1565C0', border: 'none', fontWeight: 700 }}
          >
            Search
          </button>
        </div>

        <div style={{ display: 'flex', gap: '.6rem', flexWrap: 'wrap' }}>
          <select
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
            style={{ padding: '.5rem .8rem', borderRadius: '8px', border: '1px solid #CFD8DC', fontSize: '.82rem', fontWeight: 600, background: '#FAFAFA' }}
          >
            {BUYER_TYPES.map(bt => <option key={bt} value={bt}>Tier: {bt}</option>)}
          </select>

          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            style={{ padding: '.5rem .8rem', borderRadius: '8px', border: '1px solid #CFD8DC', fontSize: '.82rem', fontWeight: 600, background: '#FAFAFA' }}
          >
            {STATUS_OPTIONS.map(st => <option key={st} value={st}>Status: {st}</option>)}
          </select>
        </div>
      </div>

      {/* Buyers Table Card */}
      <div className="card" style={{ padding: '1.5rem', background: '#fff', borderRadius: '16px', border: '1px solid #E0E0E0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, color: '#0D47A1', fontSize: '1.15rem' }}>
            Registered Commercial Buyers ({buyers.length})
          </h3>
        </div>

        {loading && buyers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text3)' }}>
            Loading buyers...
          </div>
        ) : buyers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text3)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '.75rem' }}>🏢</div>
            <h4>No buyers match current filters</h4>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.85rem' }}>
              <thead>
                <tr style={{ background: '#F5F7FA', textAlign: 'left', borderBottom: '2px solid #CFD8DC' }}>
                  <th style={{ padding: '.75rem 1rem' }}>Buyer ID &amp; Name</th>
                  <th style={{ padding: '.75rem 1rem' }}>Business Entity</th>
                  <th style={{ padding: '.75rem 1rem' }}>Buyer Tier</th>
                  <th style={{ padding: '.75rem 1rem' }}>Location / Hub</th>
                  <th style={{ padding: '.75rem 1rem' }}>GST Number</th>
                  <th style={{ padding: '.75rem 1rem', textAlign: 'center' }}>Verification Status</th>
                  <th style={{ padding: '.75rem 1rem', textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {buyers.map(b => {
                  const isVerified = b.verificationStatus === 'Verified';
                  const tierColor = b.buyerType === 'Bulk Buyer' ? '#1565C0' : b.buyerType === 'Retailer' ? '#E65100' : '#2E7D32';

                  return (
                    <tr key={b._id} style={{ borderBottom: '1px solid #ECEFF1', transition: 'background .2s' }}>
                      <td style={{ padding: '.75rem 1rem' }}>
                        <b style={{ color: '#0D47A1' }}>{b.name}</b>
                        <div style={{ fontSize: '.72rem', color: 'var(--text3)', fontFamily: 'monospace' }}>
                          {b.id || b._id} • 📱 {b.phone}
                        </div>
                      </td>

                      <td style={{ padding: '.75rem 1rem' }}>
                        <b>{b.businessName || b.name}</b>
                        <div style={{ fontSize: '.72rem', color: 'var(--text2)' }}>
                          {b.businessCategory || 'Fruits & Vegetables'}
                        </div>
                      </td>

                      <td style={{ padding: '.75rem 1rem' }}>
                        <span style={{ fontSize: '.75rem', fontWeight: 800, background: '#F0F4F8', color: tierColor, padding: '.2rem .6rem', borderRadius: '50px', border: `1px solid ${tierColor}40` }}>
                          {b.buyerType || 'Wholesaler'}
                        </span>
                      </td>

                      <td style={{ padding: '.75rem 1rem', color: 'var(--text2)' }}>
                        📍 {b.loc || 'Maharashtra'}
                      </td>

                      <td style={{ padding: '.75rem 1rem', fontFamily: 'monospace', fontSize: '.8rem', color: '#37474F' }}>
                        {b.gstNumber || '27AAACR1234F1Z5'}
                      </td>

                      <td style={{ padding: '.75rem 1rem', textAlign: 'center' }}>
                        <span
                          style={{
                            fontSize: '.72rem',
                            fontWeight: 800,
                            padding: '.25rem .65rem',
                            borderRadius: '50px',
                            background: isVerified ? '#E8F5E9' : '#FFF3E0',
                            color: isVerified ? '#2E7D32' : '#E65100'
                          }}
                        >
                          {isVerified ? '✓ Verified' : '⏳ Pending KYC'}
                        </span>
                      </td>

                      <td style={{ padding: '.75rem 1rem', textAlign: 'center' }}>
                        <button
                          onClick={() => handleToggleVerification(b)}
                          className={`btn btn-sm ${isVerified ? 'btn-outline' : 'btn-green'}`}
                          style={{ fontSize: '.75rem', fontWeight: 700, padding: '.3rem .65rem' }}
                        >
                          {isVerified ? 'Revoke KYC' : '✓ Approve KYC'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
