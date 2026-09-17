import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import API from '../../../api/axios';

export default function FarmerRequirements({ toast }) {
  const { currentFarmer } = useAuth();
  const { t } = useLanguage();

  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cropFilter, setCropFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [offerModal, setOfferModal] = useState(null);
  const [offeredQty, setOfferedQty] = useState('');
  const [offeredPrice, setOfferedPrice] = useState('');
  const [offerNotes, setOfferNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchRequirements = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (cropFilter) params.append('crop', cropFilter);
    if (locationFilter) params.append('location', locationFilter);

    API.get(`/requirements?${params.toString()}`)
      .then(res => {
        setRequirements(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchRequirements();
  }, [cropFilter, locationFilter]);

  const openOfferModal = (req) => {
    setOfferModal(req);
    setOfferedQty(String(req.quantity));
    setOfferedPrice(String(req.expectedPriceMax || req.expectedPriceMin));
    setOfferNotes(`Available from ${currentFarmer?.loc || 'farm'} with ready stock.`);
  };

  const handleSendOffer = async () => {
    if (!offerModal || !offeredQty || !offeredPrice) {
      toast && toast('❌ Please enter quantity and price.');
      return;
    }
    setSubmitting(true);
    try {
      await API.post(`/requirements/${offerModal._id}/offer`, {
        farmerId: currentFarmer?.id || currentFarmer?._id || 'KS-1001',
        farmerName: currentFarmer?.name || 'Ramesh Kumar Patel',
        farmerPhone: currentFarmer?.phone || '+91 98765 43210',
        farmerLoc: currentFarmer?.loc || 'Nashik, Maharashtra',
        offeredQty: Number(offeredQty),
        offeredPrice: Number(offeredPrice),
        notes: offerNotes
      });
      toast && toast(`✅ Offer of ₹${offeredPrice}/qtl sent to ${offerModal.buyerName}!`);
      setOfferModal(null);
      fetchRequirements();
    } catch (e) {
      toast && toast('❌ ' + (e.response?.data?.message || 'Failed to submit offer'));
    }
    setSubmitting(false);
  };

  const cropOptions = ['All Crops', 'Tomato', 'Onion', 'Wheat', 'Soybean', 'Potato', 'Pomegranate', 'Cotton', 'Maize', 'Turmeric'];

  return (
    <>
      <div className="page-header" style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', flexWrap: 'wrap' }}>
          <span style={{ background: '#E3F2FD', color: '#1565C0', padding: '.25rem .75rem', borderRadius: '50px', fontSize: '.75rem', fontWeight: 800 }}>
            🏢 {t('navBuyerRequirements', 'Buyer Demand Portal')}
          </span>
          <span style={{ background: '#E8F5E9', color: '#2E7D32', padding: '.25rem .75rem', borderRadius: '50px', fontSize: '.75rem', fontWeight: 700 }}>
            🔒 {t('escrowProtected', '100% Escrow Protected')}
          </span>
        </div>
        <h1 style={{ marginTop: '.4rem' }}>🤝 {t('navBuyerRequirements', 'Buyer Requirements')}</h1>
        <p>Verified institutional buyers, wholesalers, and retail chains actively looking to procure crops directly from farmers.</p>
      </div>

      {/* FILTER BAR */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: '1 1 200px' }}>
            <label style={{ display: 'block', fontSize: '.75rem', fontWeight: 700, marginBottom: '.2rem' }}>
              {t('filterByCrop', 'Filter by Crop')}
            </label>
            <select
              value={cropFilter}
              onChange={e => setCropFilter(e.target.value === 'All Crops' ? '' : e.target.value)}
              style={{ width: '100%', padding: '.55rem .8rem', borderRadius: '8px', border: '1.5px solid var(--border)', fontWeight: 600 }}
            >
              {cropOptions.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div style={{ flex: '1 1 200px' }}>
            <label style={{ display: 'block', fontSize: '.75rem', fontWeight: 700, marginBottom: '.2rem' }}>
              {t('filterByLocation', 'Filter by Delivery Region')}
            </label>
            <input
              type="text"
              value={locationFilter}
              onChange={e => setLocationFilter(e.target.value)}
              placeholder="e.g. Vashi, Pune, Nashik"
              style={{ width: '100%', padding: '.55rem .8rem', borderRadius: '8px', border: '1.5px solid var(--border)', fontWeight: 600 }}
            />
          </div>

          <button
            className="btn btn-outline btn-sm"
            onClick={() => { setCropFilter(''); setLocationFilter(''); }}
            style={{ marginTop: '1.2rem', padding: '.55rem 1rem' }}
          >
            ✕ Reset Filters
          </button>
        </div>
      </div>

      {/* REQUIREMENTS LIST */}
      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
          <p>{t('loading', 'Loading active buyer requirements...')}</p>
        </div>
      ) : requirements.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text3)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
          <h3>{t('noDataFound', 'No buyer requirements found for current filter.')}</h3>
          <p style={{ fontSize: '.85rem' }}>Check back soon as new corporate and wholesale buyers post daily demand.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {requirements.map(req => {
            const hasMyOffer = req.offers?.some(o => o.farmerId === (currentFarmer?.id || currentFarmer?._id));

            return (
              <div
                key={req._id}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  border: '1.5px solid #E0E0E0',
                  borderRadius: '14px',
                  padding: '1.25rem',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.04)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '.6rem' }}>
                    <span style={{
                      background: req.buyerType === 'Bulk Buyer' ? '#E8F5E9' : req.buyerType === 'Retailer' ? '#FFF3E0' : '#E3F2FD',
                      color: req.buyerType === 'Bulk Buyer' ? '#1B5E20' : req.buyerType === 'Retailer' ? '#E65100' : '#0D47A1',
                      padding: '.2rem .6rem',
                      borderRadius: '50px',
                      fontSize: '.72rem',
                      fontWeight: 800
                    }}>
                      🏢 {req.buyerType || 'Wholesaler'}
                    </span>

                    <span style={{
                      background: req.status === 'Active' ? '#E8F5E9' : '#ECEFF1',
                      color: req.status === 'Active' ? '#2E7D32' : '#546E7A',
                      padding: '.15rem .5rem',
                      borderRadius: '4px',
                      fontSize: '.68rem',
                      fontWeight: 700
                    }}>
                      {req.status}
                    </span>
                  </div>

                  <h3 style={{ margin: '0 0 .3rem', color: '#1B5E20', fontFamily: 'var(--font-head)' }}>
                    {req.crop}
                  </h3>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.75rem', flexWrap: 'wrap' }}>
                    <span style={{ background: '#F5F5F5', padding: '.2rem .5rem', borderRadius: '4px', fontSize: '.75rem', fontWeight: 700 }}>
                      📦 {req.quantity} {req.unit || 'quintals'}
                    </span>
                    <span style={{ background: '#EDE7F6', color: '#4A148C', padding: '.2rem .5rem', borderRadius: '4px', fontSize: '.75rem', fontWeight: 700 }}>
                      ⭐ {req.quality || 'Grade A'}
                    </span>
                  </div>

                  <div style={{ background: '#FAFAFA', padding: '.75rem', borderRadius: '10px', marginBottom: '.75rem', fontSize: '.82rem', border: '1px solid #EEEEEE' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.25rem' }}>
                      <span style={{ color: 'var(--text2)' }}>Target Price Range:</span>
                      <b style={{ color: '#1565C0' }}>₹{req.expectedPriceMin} — ₹{req.expectedPriceMax}/qtl</b>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.25rem' }}>
                      <span style={{ color: 'var(--text2)' }}>Buyer:</span>
                      <b>{req.buyerName}</b>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.25rem' }}>
                      <span style={{ color: 'var(--text2)' }}>Delivery Hub:</span>
                      <span>📍 {req.deliveryLocation}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text2)' }}>Required By:</span>
                      <span>📅 {new Date(req.requiredByDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>

                  {req.notes && (
                    <div style={{ fontSize: '.75rem', color: 'var(--text2)', fontStyle: 'italic', marginBottom: '.75rem', lineHeight: 1.4 }}>
                      "{req.notes}"
                    </div>
                  )}
                </div>

                <div style={{ borderTop: '1px solid #EEEEEE', paddingTop: '.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '.72rem', color: 'var(--text3)' }}>
                    📩 {req.offers?.length || 0} offers received
                  </span>

                  {hasMyOffer ? (
                    <span style={{ background: '#E8F5E9', color: '#2E7D32', padding: '.3rem .75rem', borderRadius: '50px', fontSize: '.75rem', fontWeight: 800 }}>
                      ✓ Offer Sent
                    </span>
                  ) : (
                    <button
                      className="btn btn-green btn-sm"
                      style={{ fontWeight: 800 }}
                      onClick={() => openOfferModal(req)}
                    >
                      🤝 {t('sendOffer', 'Send Offer')}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* OFFER SUBMISSION MODAL */}
      {offerModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,.5)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            backdropFilter: 'blur(4px)'
          }}
          onClick={() => setOfferModal(null)}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '16px',
              maxWidth: '480px',
              width: '100%',
              padding: '1.5rem',
              boxShadow: '0 20px 60px rgba(0,0,0,.2)'
            }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 .3rem', color: '#1B5E20' }}>
              🤝 Send Direct Offer to {offerModal.buyerName}
            </h3>
            <p style={{ fontSize: '.85rem', color: 'var(--text2)', margin: '0 0 1rem' }}>
              For <b>{offerModal.crop}</b> ({offerModal.quality}) • Target: ₹{offerModal.expectedPriceMin}–₹{offerModal.expectedPriceMax}/qtl
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '.9rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '.8rem', fontWeight: 700, marginBottom: '.3rem' }}>
                  📦 Quantity You Can Supply (Quintals) *
                </label>
                <input
                  type="number"
                  value={offeredQty}
                  onChange={e => setOfferedQty(e.target.value)}
                  style={{ width: '100%', padding: '.6rem .8rem', borderRadius: '8px', border: '1.5px solid var(--border)', fontWeight: 700 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '.8rem', fontWeight: 700, marginBottom: '.3rem' }}>
                  💰 Your Offered Price (₹/Quintal) *
                </label>
                <input
                  type="number"
                  value={offeredPrice}
                  onChange={e => setOfferedPrice(e.target.value)}
                  style={{ width: '100%', padding: '.6rem .8rem', borderRadius: '8px', border: '1.5px solid var(--border)', fontWeight: 700, fontSize: '1.1rem', color: '#1565C0' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '.8rem', fontWeight: 700, marginBottom: '.3rem' }}>
                  📝 Note to Buyer (Quality details, harvest date, location)
                </label>
                <textarea
                  value={offerNotes}
                  onChange={e => setOfferNotes(e.target.value)}
                  rows={3}
                  style={{ width: '100%', padding: '.6rem .8rem', borderRadius: '8px', border: '1.5px solid var(--border)', fontFamily: 'var(--font-body)' }}
                />
              </div>

              <div style={{ background: '#F1F8E9', padding: '.75rem 1rem', borderRadius: '10px', border: '1px solid #C8E6C9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, color: '#1B5E20' }}>
                  <span>Total Proposed Escrow Deal:</span>
                  <span>₹{((Number(offeredQty) || 0) * (Number(offeredPrice) || 0)).toLocaleString()}</span>
                </div>
                <div style={{ fontSize: '.72rem', color: '#2E7D32', marginTop: '.2rem' }}>
                  🔒 0% Platform Commission on 1st Order • 2% on subsequent orders
                </div>
              </div>

              <div style={{ display: 'flex', gap: '.6rem', marginTop: '.5rem' }}>
                <button className="btn btn-outline" onClick={() => setOfferModal(null)} style={{ flex: 1 }}>
                  Cancel
                </button>
                <button
                  className="btn btn-green"
                  onClick={handleSendOffer}
                  disabled={submitting}
                  style={{ flex: 2, fontWeight: 800 }}
                >
                  {submitting ? 'Sending...' : '🚀 Submit Official Offer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
