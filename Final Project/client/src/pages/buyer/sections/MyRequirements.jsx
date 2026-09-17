import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import API from '../../../api/axios';

export default function MyRequirements({ toast, onNavigateToOrders }) {
  const { currentBuyer } = useAuth();
  const { t } = useLanguage();
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedReq, setSelectedReq] = useState(null);
  const [offersModalOpen, setOffersModalOpen] = useState(false);
  const [processingOfferId, setProcessingOfferId] = useState(null);

  const fetchMyRequirements = () => {
    setLoading(true);
    const buyerId = currentBuyer?.id || currentBuyer?._id;
    API.get(`/requirements?buyerId=${encodeURIComponent(buyerId || '')}`)
      .then(res => {
        setRequirements(res.data || []);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchMyRequirements();
    const interval = setInterval(fetchMyRequirements, 4000);
    return () => clearInterval(interval);
  }, [currentBuyer]);

  const openOffers = (req) => {
    setSelectedReq(req);
    setOffersModalOpen(true);
  };

  const handleAcceptOffer = async (req, offer) => {
    setProcessingOfferId(offer._id);
    try {
      // 1. Update offer status to Accepted on backend
      await API.put(`/requirements/${req._id}/offer/${offer._id}/status`, { status: 'Accepted' });

      // 2. Create the escrow order directly
      const qty = offer.offeredQuantity || req.quantity;
      const price = offer.offeredPrice || req.targetPrice;

      await API.post('/orders', {
        productName: req.commodity,
        qty: qty,
        price: price,
        offeredPrice: price,
        directEscrow: true,
        buyerName: currentBuyer?.name || req.buyerName || 'Buyer',
        buyerId: currentBuyer?.id || req.buyerId || 'KB-001',
        buyerPhone: currentBuyer?.phone || req.buyerPhone || '9988776655',
        buyerType: currentBuyer?.buyerType || req.buyerType || 'Wholesaler',
        buyerLoc: req.deliveryLocation || currentBuyer?.loc || 'Maharashtra',
        sellerName: offer.farmerName,
        sellerId: offer.farmerId,
        sellerPhone: offer.farmerPhone || '9876543210',
        sellerLoc: offer.farmerVillage ? `${offer.farmerVillage}, ${offer.farmerDistrict}` : offer.farmerDistrict || 'Maharashtra',
      });

      toast && toast(`🎉 Offer accepted! Escrow order created for ₹${(qty * price).toLocaleString()} with ${offer.farmerName}.`);
      setProcessingOfferId(null);
      setOffersModalOpen(false);
      fetchMyRequirements();
      if (onNavigateToOrders) onNavigateToOrders();
    } catch (err) {
      setProcessingOfferId(null);
      toast && toast('❌ ' + (err.response?.data?.message || 'Failed to accept offer'));
    }
  };

  const handleRejectOffer = async (req, offer) => {
    setProcessingOfferId(offer._id);
    try {
      await API.put(`/requirements/${req._id}/offer/${offer._id}/status`, { status: 'Rejected' });
      toast && toast('Offer declined.');
      setProcessingOfferId(null);
      fetchMyRequirements();
      // Update local modal data
      setSelectedReq(prev => ({
        ...prev,
        offers: prev.offers.map(o => o._id === offer._id ? { ...o, status: 'Rejected' } : o)
      }));
    } catch (err) {
      setProcessingOfferId(null);
      toast && toast('❌ ' + (err.response?.data?.message || 'Failed to reject offer'));
    }
  };

  const handleCloseRequirement = async (reqId) => {
    try {
      await API.put(`/requirements/${reqId}/status`, { status: 'Fulfilled' });
      toast && toast('Requirement marked as fulfilled/closed.');
      fetchMyRequirements();
    } catch {
      toast && toast('❌ Failed to update requirement');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.3rem' }}>
            <span style={{ background: '#E3F2FD', color: '#1565C0', padding: '.25rem .75rem', borderRadius: '50px', fontSize: '.75rem', fontWeight: 800 }}>
              📢 Active Demands &amp; Inbound Farmer Offers
            </span>
            <span style={{ background: '#E8F5E9', color: '#1B5E20', padding: '.25rem .75rem', borderRadius: '50px', fontSize: '.75rem', fontWeight: 700 }}>
              Live Synchronization
            </span>
          </div>
          <h1 style={{ margin: 0, color: '#0D47A1' }}>{t('my_requirements_title') || 'My Posted Requirements & Offers'}</h1>
          <p style={{ margin: '.25rem 0 0', color: 'var(--text2)' }}>
            Review proposals submitted by farmers, compare offered rates, and accept offers directly into Escrow.
          </p>
        </div>

        <button
          onClick={() => window.location.hash = '#b-post-req'}
          className="btn btn-primary"
          style={{ background: 'linear-gradient(135deg, #1565C0, #0D47A1)', border: 'none', fontWeight: 800, padding: '.65rem 1.25rem', borderRadius: '10px' }}
        >
          ➕ Post New Requirement
        </button>
      </div>

      {loading && requirements.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text3)' }}>
          Loading your procurement requirements...
        </div>
      ) : requirements.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem', background: '#fff', borderRadius: '16px', border: '1px solid #E0E0E0' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>📋</div>
          <h3 style={{ margin: '0 0 .5rem', color: '#37474F' }}>No Requirements Posted Yet</h3>
          <p style={{ color: 'var(--text2)', maxWidth: '480px', margin: '0 auto 1.5rem', fontSize: '.9rem' }}>
            Post a bulk crop demand with your desired quantity and target price. Registered farmers will receive your demand and send supply offers.
          </p>
          <button
            onClick={() => window.location.hash = '#b-post-req'}
            className="btn btn-primary"
            style={{ background: 'linear-gradient(135deg, #1565C0, #0D47A1)', border: 'none', fontWeight: 700 }}
          >
            Post Your First Requirement →
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.25rem' }}>
          {requirements.map(req => {
            const pendingOffersCount = (req.offers || []).filter(o => o.status === 'Pending').length;
            const totalOffersCount = (req.offers || []).length;
            const isClosed = req.status === 'Fulfilled' || req.status === 'Closed';

            return (
              <div
                key={req._id}
                className="card"
                style={{
                  background: '#fff',
                  borderRadius: '16px',
                  border: pendingOffersCount > 0 ? '2px solid #2E7D32' : '1px solid #E0E0E0',
                  padding: '1.4rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: pendingOffersCount > 0 ? '0 4px 16px rgba(46,125,50,0.1)' : '0 2px 8px rgba(0,0,0,0.04)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '.6rem' }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#1B5E20' }}>
                        🌾 {req.commodity}
                      </h3>
                      {req.variety && (
                        <div style={{ fontSize: '.8rem', color: 'var(--text2)', marginTop: '.15rem' }}>
                          Variety: <b>{req.variety}</b>
                        </div>
                      )}
                    </div>

                    <span
                      style={{
                        background: isClosed ? '#ECEFF1' : '#E8F5E9',
                        color: isClosed ? '#546E7A' : '#2E7D32',
                        fontSize: '.75rem',
                        fontWeight: 800,
                        padding: '.25rem .65rem',
                        borderRadius: '50px'
                      }}
                    >
                      {req.status}
                    </span>
                  </div>

                  {/* Demand Details Grid */}
                  <div style={{ background: '#F8F9FA', borderRadius: '10px', padding: '.85rem', marginBottom: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.6rem', fontSize: '.82rem' }}>
                    <div>
                      <span style={{ color: 'var(--text3)', display: 'block', fontSize: '.72rem' }}>REQUIRED QTY</span>
                      <b style={{ color: '#0D47A1' }}>{req.quantity} {req.unit || 'Quintals'}</b>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text3)', display: 'block', fontSize: '.72rem' }}>TARGET PRICE</span>
                      <b style={{ color: '#1B5E20' }}>₹{req.targetPrice}/qtl</b>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text3)', display: 'block', fontSize: '.72rem' }}>GRADE</span>
                      <b>{req.qualityGrade?.split('(')[0] || 'Standard'}</b>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text3)', display: 'block', fontSize: '.72rem' }}>TARGET DATE</span>
                      <b>{new Date(req.expectedDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</b>
                    </div>
                  </div>

                  <div style={{ fontSize: '.78rem', color: 'var(--text2)', marginBottom: '1rem' }}>
                    📍 <b>Destination:</b> {req.deliveryLocation}
                  </div>
                </div>

                {/* Offer Status & Action Button */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '.65rem .85rem', background: pendingOffersCount > 0 ? '#E8F5E9' : '#F5F5F5', borderRadius: '10px', marginBottom: '.85rem' }}>
                    <div style={{ fontSize: '.82rem', fontWeight: 700, color: pendingOffersCount > 0 ? '#1B5E20' : '#616161' }}>
                      📬 {totalOffersCount} Offers ({pendingOffersCount} Pending)
                    </div>
                    {pendingOffersCount > 0 && (
                      <span style={{ fontSize: '.72rem', background: '#2E7D32', color: '#fff', padding: '.15rem .5rem', borderRadius: '50px', fontWeight: 800 }}>
                        Action Required
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '.5rem' }}>
                    <button
                      onClick={() => openOffers(req)}
                      className="btn btn-sm"
                      style={{
                        flex: 1,
                        background: totalOffersCount > 0 ? '#1565C0' : '#90CAF9',
                        color: '#fff',
                        fontWeight: 700,
                        padding: '.55rem',
                        borderRadius: '8px'
                      }}
                    >
                      🔍 View Offers ({totalOffersCount})
                    </button>
                    {!isClosed && (
                      <button
                        onClick={() => handleCloseRequirement(req._id)}
                        className="btn btn-sm btn-outline"
                        style={{ padding: '.55rem .75rem', fontSize: '.75rem' }}
                        title="Close Requirement"
                      >
                        ✓ Close
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* OFFERS INSPECTION & ACCEPTANCE MODAL */}
      {offersModalOpen && selectedReq && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,.6)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            backdropFilter: 'blur(4px)'
          }}
          onClick={() => setOffersModalOpen(false)}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '20px',
              maxWidth: '650px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '1.75rem',
              boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #ECEFF1', paddingBottom: '.75rem' }}>
              <div>
                <h2 style={{ margin: 0, color: '#0D47A1', fontSize: '1.25rem' }}>
                  📬 Offers for {selectedReq.commodity}
                </h2>
                <p style={{ margin: '.2rem 0 0', fontSize: '.8rem', color: 'var(--text2)' }}>
                  Demand: <b>{selectedReq.quantity} {selectedReq.unit || 'Quintals'}</b> @ <b>₹{selectedReq.targetPrice}/qtl</b>
                </p>
              </div>
              <button
                onClick={() => setOffersModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#90A4AE' }}
              >
                ✕
              </button>
            </div>

            {(selectedReq.offers || []).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text3)' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '.75rem' }}>⏳</div>
                <h4>No farmer offers submitted yet</h4>
                <p style={{ fontSize: '.85rem' }}>Farmers browsing the requirement feed will send direct offers soon.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {selectedReq.offers.map(offer => {
                  const isAccepted = offer.status === 'Accepted';
                  const isRejected = offer.status === 'Rejected';
                  const isPending = offer.status === 'Pending';
                  const isProcessing = processingOfferId === offer._id;

                  return (
                    <div
                      key={offer._id}
                      style={{
                        background: isAccepted ? '#E8F5E9' : isRejected ? '#FFEBEE' : '#F8F9FA',
                        border: isAccepted ? '2px solid #2E7D32' : '1px solid #CFD8DC',
                        borderRadius: '12px',
                        padding: '1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '.75rem'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '.5rem' }}>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '1rem', color: '#1B5E20' }}>
                            👨‍🌾 {offer.farmerName}
                          </div>
                          <div style={{ fontSize: '.8rem', color: 'var(--text2)', marginTop: '.15rem' }}>
                            📍 {offer.farmerVillage ? `${offer.farmerVillage}, ` : ''}{offer.farmerDistrict || 'Maharashtra'} • 📱 {offer.farmerPhone}
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 900, fontSize: '1.15rem', color: '#0D47A1' }}>
                            ₹{offer.offeredPrice}/qtl
                          </div>
                          <span
                            style={{
                              fontSize: '.72rem',
                              fontWeight: 800,
                              background: isAccepted ? '#2E7D32' : isRejected ? '#C62828' : '#FFA000',
                              color: '#fff',
                              padding: '.15rem .5rem',
                              borderRadius: '50px'
                            }}
                          >
                            {offer.status}
                          </span>
                        </div>
                      </div>

                      <div style={{ background: '#fff', padding: '.65rem .85rem', borderRadius: '8px', fontSize: '.82rem', display: 'flex', justifyContent: 'space-between' }}>
                        <span>Supply Quantity: <b>{offer.offeredQuantity} {selectedReq.unit || 'Quintals'}</b></span>
                        <span>Total Deal: <b>₹{((offer.offeredQuantity || 0) * (offer.offeredPrice || 0)).toLocaleString()}</b></span>
                      </div>

                      {offer.comments && (
                        <div style={{ fontSize: '.8rem', color: '#37474F', fontStyle: 'italic', background: 'rgba(0,0,0,0.02)', padding: '.4rem .6rem', borderRadius: '6px' }}>
                          💬 &ldquo;{offer.comments}&rdquo;
                        </div>
                      )}

                      {isPending && (
                        <div style={{ display: 'flex', gap: '.6rem', marginTop: '.25rem' }}>
                          <button
                            disabled={isProcessing}
                            onClick={() => handleAcceptOffer(selectedReq, offer)}
                            className="btn btn-green btn-sm"
                            style={{ flex: 2, fontWeight: 800 }}
                          >
                            {isProcessing ? 'Securing Escrow...' : '🔒 Accept & Lock Escrow'}
                          </button>
                          <button
                            disabled={isProcessing}
                            onClick={() => handleRejectOffer(selectedReq, offer)}
                            className="btn btn-sm"
                            style={{ flex: 1, background: '#FFEBEE', color: '#C62828', border: '1px solid #EF9A9A' }}
                          >
                            Decline
                          </button>
                        </div>
                      )}

                      {isAccepted && (
                        <div style={{ fontSize: '.82rem', color: '#2E7D32', fontWeight: 800 }}>
                          ✓ Offer Accepted! Escrow Order created in your Orders tab.
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
