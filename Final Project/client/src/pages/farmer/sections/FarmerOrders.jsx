import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import API from '../../../api/axios';
import DeliveryTrackerModal from '../../../components/DeliveryTrackerModal';

export default function FarmerOrders({ toast }) {
  const { currentFarmer } = useAuth();
  const { t } = useLanguage();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dispatchModal, setDispatchModal] = useState(null);
  const [trackingModalOrder, setTrackingModalOrder] = useState(null);
  const [dispatchForm, setDispatchForm] = useState({
    vehicle: 'MH-15-EG-4482 (Eicher 14ft)',
    driver: 'Ramesh Shinde (+91 98231 44210)',
    fare: 2200
  });

  const fetchOrders = () => {
    const id = currentFarmer?.id || currentFarmer?._id;
    const name = currentFarmer?.name;
    const phone = currentFarmer?.phone;

    let query = '';
    if (id) query = `?sellerId=${encodeURIComponent(id)}`;
    else if (name) query = `?sellerName=${encodeURIComponent(name)}`;
    if (phone) query += (query ? '&' : '?') + `sellerPhone=${encodeURIComponent(phone)}`;

    API.get(`/orders${query}`)
      .then(res => {
        setOrders(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 4000);
    return () => clearInterval(interval);
  }, [currentFarmer]);

  const handleAcceptOffer = async (orderId) => {
    try {
      await API.put(`/orders/${orderId}/accept`);
      toast && toast('✅ Offer accepted! Buyer notified to lock payment in Escrow.');
      fetchOrders();
    } catch {
      toast && toast('❌ Failed to accept offer');
    }
  };

  const handleRejectOffer = async (orderId) => {
    try {
      await API.put(`/orders/${orderId}/reject`, { reason: 'Price renegotiation requested' });
      toast && toast('Decline recorded.');
      fetchOrders();
    } catch {
      toast && toast('❌ Failed to reject offer');
    }
  };

  const handleDispatch = async (orderId) => {
    try {
      await API.put(`/orders/${orderId}/dispatch`, { transportDetails: dispatchForm });
      toast && toast('🚚 Shipment dispatched! Buyer tracking enabled in real-time.');
      setDispatchModal(null);
      fetchOrders();
    } catch {
      toast && toast('❌ Failed to dispatch');
    }
  };

  const handleVerifyQuality = async (orderId) => {
    try {
      await API.put(`/orders/${orderId}/verify-quality`);
      toast && toast('🔍 Digital quality inspection passed & unloading approved!');
      fetchOrders();
    } catch {
      toast && toast('❌ Quality check failed');
    }
  };

  const handleReleasePayout = async (orderId) => {
    try {
      await API.put(`/orders/${orderId}/release-payout`);
      toast && toast('💰 100% Escrow Payout released directly to your Bank/UPI!');
      fetchOrders();
    } catch {
      toast && toast('❌ Payout release failed');
    }
  };

  // Metrics
  const completedOrders = orders.filter(o => o.status === 'delivered');
  const activeOrders = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled' && o.status !== 'rejected');
  const totalNetEarned = completedOrders.reduce((acc, curr) => acc + (curr.farmerNetAmount || curr.totalAmount || 0), 0);

  return (
    <>
      <div className="page-header" style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', flexWrap: 'wrap' }}>
          <span style={{ background: '#E8F5E9', color: '#2E7D32', padding: '.25rem .75rem', borderRadius: '50px', fontSize: '.75rem', fontWeight: 800 }}>
            🔒 {t('navMyOrders', 'My Orders & Escrow Tracker')}
          </span>
          <span style={{ background: '#E3F2FD', color: '#1565C0', padding: '.25rem .75rem', borderRadius: '50px', fontSize: '.75rem', fontWeight: 700 }}>
            ⚡ 0% 1st Order • 2% Thereafter
          </span>
        </div>
        <h1 style={{ marginTop: '.4rem' }}>📦 {t('navMyOrders', 'Orders & Escrow Lifecycle')}</h1>
        <p>Full transaction transparency with automated commission calculation and guaranteed Escrow payouts.</p>
      </div>

      {/* STATS SUMMARY */}
      <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="stat-card">
          <div className="icon-box icon-green">💰</div>
          <div className="info">
            <h3>₹{totalNetEarned.toLocaleString()}</h3>
            <p>{t('totalEarnings', 'Total Net Earnings')}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="icon-box icon-blue">📋</div>
          <div className="info">
            <h3>{completedOrders.length}</h3>
            <p>{t('completedOrdersCount', 'Completed Deals')}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="icon-box icon-orange">⏳</div>
          <div className="info">
            <h3>{activeOrders.length}</h3>
            <p>{t('myActiveOrders', 'In-Progress Deals')}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="icon-box icon-purple">🎯</div>
          <div className="info">
            <h3>{completedOrders.length === 0 ? '0%' : '2.0%'}</h3>
            <p>Your Active Commission Rate</p>
          </div>
        </div>
      </div>

      {/* COMMISSION TRANSPARENCY BANNER */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1B5E20, #2E7D32)',
          borderRadius: '14px',
          padding: '1rem 1.25rem',
          color: '#fff',
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '.75rem'
        }}
      >
        <div>
          <div style={{ fontWeight: 800, fontSize: '.95rem' }}>
            🌾 Transparent Farmer Commission Policy
          </div>
          <div style={{ fontSize: '.82rem', opacity: .95, marginTop: '.2rem' }}>
            First completed order: <b>0% commission</b>. Subsequent orders: only <b>2.0%</b> platform fee. All deductions are itemized in real-time.
          </div>
        </div>
        <button
          className="btn btn-sm"
          style={{ background: '#fff', color: '#1B5E20', fontWeight: 800 }}
          onClick={() => {
            API.post('/orders/seed-sample', {
              sellerId: currentFarmer?.id || currentFarmer?._id || 'KS-1001',
              sellerName: currentFarmer?.name || 'Ramesh Kumar Patel',
              sellerPhone: currentFarmer?.phone || '9876543210',
              sellerLoc: currentFarmer?.loc || 'Nashik, Maharashtra',
              productName: `${currentFarmer?.crop || 'Tomato'} (Grade A)`,
              qty: 25,
              price: 3450,
              buyerName: 'Reliance Retail Agri Procurement',
              buyerType: 'Bulk Buyer'
            }).then(() => {
              toast && toast('🔒 Demo Escrow contract created!');
              fetchOrders();
            });
          }}
        >
          ➕ Simulate New Deal
        </button>
      </div>

      {/* ORDERS LIST */}
      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
          <p>{t('loading', 'Loading orders and contracts...')}</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text3)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
          <h3>No orders created yet</h3>
          <p style={{ fontSize: '.85rem', maxWidth: '400px', margin: '0 auto 1rem' }}>
            List your crops in the marketplace or respond to buyer requirements to generate direct Escrow contracts.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {orders.map(order => {
            const isOfferPending = order.status === 'offer-pending';
            const isPaid = order.escrow?.buyerPaid || order.status === 'payment-held' || order.status === 'in-transit' || order.status === 'unload-pending' || order.status === 'delivered';
            const isDispatched = order.status === 'in-transit' || order.status === 'unload-pending' || order.status === 'delivered';
            const isVerified = order.status === 'unload-pending' || order.status === 'delivered';
            const isReleased = order.escrow?.status === 'released' || order.status === 'delivered';

            const subtotal = order.subtotal || order.totalAmount || (order.price * order.qty);
            const commPct = order.farmerCommissionPct !== undefined ? order.farmerCommissionPct : (order.farmerOrderNumber === 1 ? 0 : 2);
            const commAmt = order.farmerCommissionAmount !== undefined ? order.farmerCommissionAmount : Math.round(subtotal * (commPct / 100));
            const netAmount = order.farmerNetAmount !== undefined ? order.farmerNetAmount : (subtotal - commAmt);

            return (
              <div
                key={order._id}
                className="card"
                style={{
                  border: isReleased ? '1.5px solid #A5D6A7' : isOfferPending ? '1.5px solid #FFB74D' : '1.5px solid #90CAF9',
                  borderRadius: '14px',
                  padding: '1.25rem',
                  background: isReleased ? '#F1F8E9' : '#fff'
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '.75rem', marginBottom: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: 'monospace', fontWeight: 800, background: '#ECEFF1', padding: '.2rem .5rem', borderRadius: '4px', fontSize: '.75rem' }}>
                        {order.orderId || 'KMO-ORD'}
                      </span>
                      <span
                        style={{
                          background: isReleased ? '#2E7D32' : isVerified ? '#7B1FA2' : isDispatched ? '#E65100' : isOfferPending ? '#F57C00' : '#1565C0',
                          color: '#fff',
                          fontSize: '.72rem',
                          fontWeight: 800,
                          padding: '.2rem .65rem',
                          borderRadius: '50px'
                        }}
                      >
                        {isReleased ? '✓ PAYOUT RELEASED (COMPLETED)' : isVerified ? '🔍 QUALITY PASSED • READY FOR PAYOUT' : isDispatched ? '🚚 IN-TRANSIT (DISPATCHED)' : isOfferPending ? '📩 BUYER OFFER PENDING' : '🔒 FUNDS LOCKED IN ESCROW'}
                      </span>
                    </div>

                    <h3 style={{ margin: '.4rem 0 .2rem', color: '#1B5E20' }}>
                      {order.productName} · {order.qty} Quintals
                    </h3>

                    <div style={{ fontSize: '.82rem', color: 'var(--text2)' }}>
                      Buyer: <b>{order.buyerName}</b> ({order.buyerType || 'Wholesaler'}) · Phone: {order.buyerPhone || '+91 99887 76655'} · 📍 {order.buyerLoc}
                    </div>

                    {order.transportDetails?.vehicle && (
                      <div style={{ fontSize: '.78rem', color: '#1565C0', marginTop: '.35rem', background: '#E3F2FD', padding: '.3rem .6rem', borderRadius: '6px', display: 'inline-block' }}>
                        🚛 Vehicle: <b>{order.transportDetails.vehicle}</b> • Driver: <b>{order.transportDetails.driver}</b>
                      </div>
                    )}
                  </div>

                  {/* Financial Breakdown Box */}
                  <div style={{ background: '#FAFAFA', padding: '.75rem 1rem', borderRadius: '10px', border: '1px solid #E0E0E0', minWidth: '220px', textAlign: 'right' }}>
                    <div style={{ fontSize: '.72rem', color: 'var(--text3)' }}>Gross Deal Value: ₹{subtotal.toLocaleString()}</div>
                    <div style={{ fontSize: '.72rem', color: commAmt === 0 ? '#2E7D32' : '#E65100', fontWeight: 700 }}>
                      Platform Fee ({commPct}%): −₹{commAmt.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '.72rem', color: '#1B5E20', fontWeight: 800, borderTop: '1px dashed #CCC', paddingTop: '.25rem', marginTop: '.25rem' }}>
                      Farmer Net In-Hand:
                    </div>
                    <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#1B5E20' }}>
                      ₹{netAmount.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Progress Pipeline */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '.5rem', margin: '1rem 0', background: '#FAFAFA', padding: '.75rem', borderRadius: '10px', border: '1px solid #EEEEEE' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.1rem' }}>{isPaid ? '✅' : '⚪'}</div>
                    <div style={{ fontSize: '.72rem', fontWeight: 800, color: isPaid ? '#2E7D32' : '#999' }}>1. Escrow Lock</div>
                    <div style={{ fontSize: '.62rem', color: 'var(--text3)' }}>100% Pre-funded</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.1rem' }}>{isDispatched ? '🚚' : '⚪'}</div>
                    <div style={{ fontSize: '.72rem', fontWeight: 800, color: isDispatched ? '#2E7D32' : '#999' }}>2. Dispatched</div>
                    <div style={{ fontSize: '.62rem', color: 'var(--text3)' }}>GPS &amp; Vehicle</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.1rem' }}>{isVerified ? '🔍' : '⚪'}</div>
                    <div style={{ fontSize: '.72rem', fontWeight: 800, color: isVerified ? '#2E7D32' : '#999' }}>3. Quality Check</div>
                    <div style={{ fontSize: '.62rem', color: 'var(--text3)' }}>Gate Pass</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.1rem' }}>{isReleased ? '💰' : '⚪'}</div>
                    <div style={{ fontSize: '.72rem', fontWeight: 800, color: isReleased ? '#2E7D32' : '#999' }}>4. Net Payout</div>
                    <div style={{ fontSize: '.62rem', color: 'var(--text3)' }}>Direct to Bank/UPI</div>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '.6rem', flexWrap: 'wrap', justifyContent: 'flex-end', alignItems: 'center', marginTop: '.75rem' }}>
                  <button
                    className="btn btn-sm"
                    style={{ background: '#166534', color: '#fff', fontWeight: 800, padding: '.45rem .85rem' }}
                    onClick={() => setTrackingModalOrder(order)}
                  >
                    ⚡ Track Live Delivery
                  </button>

                  {isOfferPending && (
                    <>
                      <button className="btn btn-green btn-sm" onClick={() => handleAcceptOffer(order._id)}>
                        ✅ Accept Buyer Offer
                      </button>
                      <button className="btn btn-outline btn-sm" onClick={() => handleRejectOffer(order._id)}>
                        ❌ Decline
                      </button>
                    </>
                  )}

                  {!isOfferPending && !isDispatched && (
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
                      🔍 Simulate Quality Verification Pass
                    </button>
                  )}

                  {isVerified && !isReleased && (
                    <button
                      className="btn btn-green btn-sm"
                      style={{ fontWeight: 800, padding: '.45rem 1rem' }}
                      onClick={() => handleReleasePayout(order._id)}
                    >
                      💰 Release Escrow Payout (₹{netAmount.toLocaleString()})
                    </button>
                  )}

                  {isReleased && (
                    <div style={{ color: '#2E7D32', fontWeight: 800, fontSize: '.85rem' }}>
                      ✓ Payout Settled &amp; Credited to {currentFarmer?.bankUpi || 'kisan@okaxis'}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DISPATCH MODAL */}
      {dispatchModal && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(4px)'
          }}
          onClick={() => setDispatchModal(null)}
        >
          <div style={{ background: '#fff', borderRadius: '16px', maxWidth: '440px', width: '100%', padding: '1.5rem' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 .3rem', color: '#0D47A1' }}>🚚 Dispatch Shipment</h3>
            <p style={{ fontSize: '.85rem', color: 'var(--text2)', margin: '0 0 1rem' }}>
              For <b>{dispatchModal.productName}</b> to <b>{dispatchModal.buyerName}</b>
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '.8rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '.78rem', fontWeight: 700, marginBottom: '.2rem' }}>Vehicle Number &amp; Model</label>
                <input
                  type="text"
                  value={dispatchForm.vehicle}
                  onChange={e => setDispatchForm({ ...dispatchForm, vehicle: e.target.value })}
                  style={{ width: '100%', padding: '.55rem .8rem', borderRadius: '8px', border: '1.5px solid var(--border)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '.78rem', fontWeight: 700, marginBottom: '.2rem' }}>Driver Contact &amp; Name</label>
                <input
                  type="text"
                  value={dispatchForm.driver}
                  onChange={e => setDispatchForm({ ...dispatchForm, driver: e.target.value })}
                  style={{ width: '100%', padding: '.55rem .8rem', borderRadius: '8px', border: '1.5px solid var(--border)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '.78rem', fontWeight: 700, marginBottom: '.2rem' }}>Agreed Freight Fare (₹)</label>
                <input
                  type="number"
                  value={dispatchForm.fare}
                  onChange={e => setDispatchForm({ ...dispatchForm, fare: Number(e.target.value) })}
                  style={{ width: '100%', padding: '.55rem .8rem', borderRadius: '8px', border: '1.5px solid var(--border)' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '.6rem', marginTop: '.5rem' }}>
                <button className="btn btn-outline" onClick={() => setDispatchModal(null)} style={{ flex: 1 }}>Cancel</button>
                <button className="btn" style={{ flex: 2, background: '#1565C0', color: '#fff', fontWeight: 800 }} onClick={() => handleDispatch(dispatchModal._id)}>
                  🚀 Confirm Dispatch
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {trackingModalOrder && (
        <DeliveryTrackerModal
          order={trackingModalOrder}
          onClose={() => setTrackingModalOrder(null)}
        />
      )}
    </>
  );
}
