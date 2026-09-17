import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import API from '../../../api/axios';
import DeliveryTrackerModal from '../../../components/DeliveryTrackerModal';

export default function BuyerOrders({ toast }) {
  const { currentBuyer } = useAuth();
  const { t } = useLanguage();
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState('active');
  const [disputeModal, setDisputeModal] = useState(null);
  const [trackingModalOrder, setTrackingModalOrder] = useState(null);
  const [disputeReason, setDisputeReason] = useState('');
  const [lastSyncTime, setLastSyncTime] = useState(new Date());

  const fetchOrders = () => {
    const id = currentBuyer?.id || currentBuyer?._id;
    const name = currentBuyer?.name;
    const phone = currentBuyer?.phone;

    let query = '';
    if (id && name) {
      query = `?buyerId=${encodeURIComponent(id)}&buyerName=${encodeURIComponent(name)}`;
    } else if (id) {
      query = `?buyerId=${encodeURIComponent(id)}`;
    } else if (name) {
      query = `?buyerName=${encodeURIComponent(name)}`;
    }
    if (phone) {
      query += (query ? '&' : '?') + `buyerPhone=${encodeURIComponent(phone)}`;
    }

    API.get(`/orders${query}`)
      .then(r => {
        setOrders(r.data);
        setLastSyncTime(new Date());
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 3500);
    return () => clearInterval(interval);
  }, [currentBuyer]);

  // ── Load Razorpay script dynamically ──
  const loadRazorpayScript = () => new Promise((resolve) => {
    if (document.getElementById('rzp-script')) return resolve(true);
    const s = document.createElement('script');
    s.id = 'rzp-script';
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });

  const payToEscrow = async (order) => {
    const amount = order.buyerTotalAmount || order.totalAmount;
    if (!amount) { toast && toast('❌ Order amount not found'); return; }

    toast && toast('⏳ Initializing secure payment gateway...');

    // 1. Load Razorpay SDK
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      toast && toast('❌ Payment gateway could not load. Check internet connection.');
      return;
    }

    try {
      // 2. Create Razorpay order on backend
      const { data } = await API.post('/payment/create-order', {
        orderId: order._id,
        amount,
      });

      const { rzpOrderId, keyId, demoMode } = data;

      // 3. If demo mode (no real Razorpay keys) — use simulated flow
      if (demoMode || !window.Razorpay) {
        // Show demo payment modal instead with direct link option
        const proceed = window.confirm(
          `🔒 SECURE ESCROW PAYMENT\n\n` +
          `Order: ${order.orderId}\n` +
          `Product: ${order.productName}\n` +
          `Amount: ₹${amount.toLocaleString()}\n\n` +
          `Direct Razorpay Link: https://rzp.io/rzp/eMuqtymy\n\n` +
          `Click OK to simulate successful payment & lock funds in escrow.`
        );
        if (!proceed) return;

        await API.post('/payment/verify', {
          orderId: order._id,
          rzpPaymentId: `pay_DEMO_${Date.now().toString(36).toUpperCase()}`,
          rzpOrderId,
          rzpSignature: 'demo_signature',
          demoMode: true,
        });
        toast && toast('✅ Payment successful! ₹' + amount.toLocaleString() + ' locked in escrow. Farmer can now dispatch.');
        fetchOrders();
        return;
      }

      // 4. Open real Razorpay TEST checkout modal
      const options = {
        key: keyId,
        amount: data.amount,          // in paise
        currency: data.currency || 'INR',
        name: 'KrishiSetu AI',
        description: `Escrow: ${order.productName} from ${order.sellerName}`,
        image: 'https://i.ibb.co/CzZz7jF/krishi-logo.png',
        order_id: rzpOrderId,
        prefill: {
          name: currentBuyer?.name || '',
          email: currentBuyer?.email || 'buyer@krishisetu.in',
          contact: currentBuyer?.phone || '',
        },
        notes: {
          krishiSetuOrderId: order._id,
          productName: order.productName,
          sellerName: order.sellerName,
        },
        theme: { color: '#1B5E20' },
        modal: {
          ondismiss: () => toast && toast('⚠️ Payment cancelled. Funds not transferred.'),
        },
        handler: async (response) => {
          // 5. Verify payment signature on backend
          try {
            await API.post('/payment/verify', {
              orderId: order._id,
              rzpPaymentId: response.razorpay_payment_id,
              rzpOrderId: response.razorpay_order_id,
              rzpSignature: response.razorpay_signature,
            });
            toast && toast('✅ Payment verified! ₹' + amount.toLocaleString() + ' secured in escrow. Farmer notified.');
            fetchOrders();
          } catch {
            toast && toast('❌ Payment captured but verification failed. Contact support with Payment ID: ' + response.razorpay_payment_id);
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (resp) => {
        toast && toast('❌ Payment failed: ' + (resp.error?.description || 'Unknown error'));
      });
      rzp.open();
    } catch (err) {
      toast && toast('❌ Could not initialize payment: ' + (err?.response?.data?.error || err.message));
    }
  };

  const confirmReceived = async (id) => {
    try {
      await API.put(`/orders/${id}/escrow/confirm-received`);
      toast && toast('✅ You confirmed quality inspection passed! Escrow payment released to farmer.');
      fetchOrders();
    } catch {
      toast && toast('❌ Failed to confirm delivery');
    }
  };

  const raiseDispute = async (id) => {
    if (!disputeReason) { toast && toast('⚠️ Please enter dispute reason'); return; }
    try {
      await API.put(`/orders/${id}/escrow/dispute`, { role: 'buyer', reason: disputeReason });
      toast && toast('⚠️ Dispute raised. Payment frozen for admin arbitration.');
      setDisputeModal(null);
      setDisputeReason('');
      fetchOrders();
    } catch {
      toast && toast('❌ Failed to submit dispute');
    }
  };

  const active = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled' && o.status !== 'rejected');
  const completed = orders.filter(o => o.status === 'delivered' || o.status === 'rejected' || o.status === 'cancelled');
  const display = tab === 'active' ? active : completed;

  const statusMeta = {
    'offer-pending': { icon: '📩', label: 'Offer Sent — Waiting for Farmer Acceptance', bg: '#FFF3E0', c: '#E65100' },
    'accepted': { icon: '✅', label: 'Accepted by Farmer — Lock Funds in Escrow', bg: '#E8F5E9', c: '#2E7D32' },
    'rejected': { icon: '❌', label: 'Offer Declined by Farmer', bg: '#FFEBEE', c: '#C62828' },
    'payment-held': { icon: '🔒', label: 'Funds Secured in Escrow (Awaiting Farmer Dispatch)', bg: '#E3F2FD', c: '#1565C0' },
    'in-transit': { icon: '🚛', label: 'Produce Dispatched & In-Transit', bg: '#FFF3E0', c: '#E65100' },
    'unload-pending': { icon: '🔍', label: 'Arrived at Gate — Quality Inspection & Unload', bg: '#F3E5F5', c: '#7B1FA2' },
    'delivered': { icon: '✅', label: 'Delivered & Escrow Settled to Farmer', bg: '#E8F5E9', c: '#2E7D32' },
    'cancelled': { icon: '❌', label: 'Cancelled', bg: '#FFEBEE', c: '#C62828' },
  };

  return (
    <>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.3rem' }}>
            <span style={{ background: '#E3F2FD', color: '#1565C0', padding: '.25rem .75rem', borderRadius: '50px', fontSize: '.75rem', fontWeight: 800 }}>
              📦 Direct Farmer Contracts &amp; Escrow
            </span>
            <span style={{ background: '#E8F5E9', color: '#1B5E20', padding: '.25rem .75rem', borderRadius: '50px', fontSize: '.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '.35rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2E7D32', animation: 'pulse 1.5s infinite' }} />
              Live Connected ({lastSyncTime.toLocaleTimeString()})
            </span>
          </div>
          <h1 style={{ margin: 0, color: '#0D47A1' }}>{t('buyer_orders_title') || 'My Procurement Orders & Escrow Tracking'}</h1>
          <p style={{ margin: '.25rem 0 0', color: 'var(--text2)' }}>
            Track direct farmer purchase contracts, fund escrow accounts, inspect shipments, and verify platform commissions.
          </p>
        </div>
      </div>

      <div className="tabs" style={{ marginBottom: '1.2rem', display: 'flex', gap: '.6rem' }}>
        <button className={`tab${tab === 'active' ? ' active' : ''}`} onClick={() => setTab('active')} style={{ padding: '.55rem 1.1rem', borderRadius: '8px', border: 'none', cursor: 'pointer', background: tab === 'active' ? '#1565C0' : '#f0f0f0', color: tab === 'active' ? '#fff' : 'inherit', fontWeight: 700 }}>
          📋 Active Orders ({active.length})
        </button>
        <button className={`tab${tab === 'completed' ? ' active' : ''}`} onClick={() => setTab('completed')} style={{ padding: '.55rem 1.1rem', borderRadius: '8px', border: 'none', cursor: 'pointer', background: tab === 'completed' ? '#2E7D32' : '#f0f0f0', color: tab === 'completed' ? '#fff' : 'inherit', fontWeight: 700 }}>
          ✅ Completed History ({completed.length})
        </button>
      </div>

      {display.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--text3)', background: '#fff', borderRadius: '16px', border: '1px solid #E0E0E0' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
          <h3>{tab === 'active' ? 'No active procurement orders' : 'No order history'}</h3>
          <p style={{ fontSize: '.85rem' }}>Browse farmgate listings or accept farmer offers on your requirements.</p>
        </div>
      ) : display.map(o => {
        const sm = statusMeta[o.status] || statusMeta['offer-pending'];
        const esc = o.escrow || {};
        const subtotal = o.subtotal || ((o.offeredPrice || o.price || 2000) * (o.qty || 1));
        const commPct = o.buyerCommissionPct !== undefined ? o.buyerCommissionPct : (currentBuyer?.buyerType === 'Bulk Buyer' ? 1.0 : currentBuyer?.buyerType === 'Retailer' ? 2.0 : 1.5);
        const commAmount = o.buyerCommissionAmount !== undefined ? o.buyerCommissionAmount : Math.round(subtotal * (commPct / 100));
        const finalPayable = o.totalAmount || (subtotal + commAmount);

        return (
          <div key={o._id} className="card" style={{ marginBottom: '1.25rem', borderLeft: `5px solid ${sm.c}`, border: '1.5px solid #E0E0E0', borderRadius: '16px', padding: '1.4rem', background: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '.75rem', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem' }}>
                  <b style={{ fontSize: '1.2rem', color: '#1B5E20' }}>🌾 {o.productName}</b>
                  <span style={{ fontSize: '.75rem', fontFamily: 'monospace', background: '#ECEFF1', padding: '.2rem .5rem', borderRadius: '4px', fontWeight: 700 }}>
                    {o.orderId}
                  </span>
                </div>
                <div style={{ fontSize: '.85rem', color: 'var(--text2)', marginTop: '.4rem' }}>
                  👨‍🌾 <b>Farmer / Seller:</b> {o.sellerName} · 📍 {o.sellerLoc} · 📦 <b>{o.qty} quintals</b>
                </div>
                {o.offeredPrice && (
                  <div style={{ fontSize: '.85rem', marginTop: '.2rem' }}>
                    <span style={{ color: '#1565C0', fontWeight: 800 }}>Unit Agreed Price: ₹{o.offeredPrice}/quintal</span>
                  </div>
                )}
                {o.transportDetails?.vehicle && (
                  <div style={{ fontSize: '.8rem', color: '#E65100', marginTop: '.4rem', background: '#FFF3E0', padding: '.35rem .75rem', borderRadius: '8px', display: 'inline-block' }}>
                    🚛 <b>Vehicle:</b> {o.transportDetails.vehicle} • <b>Driver:</b> {o.transportDetails.driver} ({o.transportDetails.phone || 'Contact via logistics'})
                  </div>
                )}
              </div>

              {/* Price & Status Badge */}
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 900, fontSize: '1.4rem', color: '#0D47A1' }}>
                  ₹{finalPayable.toLocaleString()}
                </div>
                <div style={{ fontSize: '.72rem', color: 'var(--text3)', marginBottom: '.3rem' }}>
                  (Includes {commPct}% Platform Fee)
                </div>
                <span style={{ background: sm.bg, color: sm.c, padding: '.3rem .8rem', borderRadius: '50px', fontSize: '.75rem', fontWeight: 800, display: 'inline-block' }}>
                  {sm.icon} {sm.label}
                </span>
              </div>
            </div>

            {/* Itemized Financial Breakdown Bar */}
            <div style={{ background: '#F8F9FA', borderRadius: '10px', padding: '.75rem 1rem', marginTop: '1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '.75rem', fontSize: '.82rem', border: '1px solid #ECEFF1' }}>
              <div>
                <span style={{ color: 'var(--text3)', display: 'block', fontSize: '.7rem' }}>PRODUCE SUBTOTAL</span>
                <b>₹{subtotal.toLocaleString()}</b>
              </div>
              <div>
                <span style={{ color: 'var(--text3)', display: 'block', fontSize: '.7rem' }}>BUYER COMMISSION ({commPct}%)</span>
                <b style={{ color: '#1565C0' }}>+ ₹{commAmount.toLocaleString()}</b>
              </div>
              <div>
                <span style={{ color: 'var(--text3)', display: 'block', fontSize: '.7rem' }}>FARMER NET RECEIVABLE</span>
                <b style={{ color: '#2E7D32' }}>₹{(o.farmerNetAmount || subtotal).toLocaleString()}</b>
              </div>
              <div>
                <span style={{ color: 'var(--text3)', display: 'block', fontSize: '.7rem' }}>ESCROW SECURITY</span>
                <b style={{ color: '#00897B' }}>🔒 100% Protected</b>
              </div>
            </div>

            {/* ESCROW TIMELINE */}
            <div style={{ display: 'flex', gap: '0', marginTop: '1rem', fontSize: '.72rem', fontWeight: 700 }}>
              {['1. Offer', '2. Accepted', '3. Escrow Paid', '4. In-Transit', '5. Quality Pass', '6. Settled'].map((step, i) => {
                const stepsDone = { 'offer-pending': 1, 'accepted': 2, 'payment-held': 3, 'in-transit': 4, 'unload-pending': 5, 'delivered': 6 };
                const done = (stepsDone[o.status] || 0) >= i + 1;
                return (
                  <div key={i} style={{ flex: 1, textAlign: 'center', padding: '.45rem 0', background: done ? '#E8F5E9' : '#f5f5f5', color: done ? '#2E7D32' : '#9E9E9E', borderRight: i < 5 ? '1px solid #e0e0e0' : 'none', borderRadius: i === 0 ? '8px 0 0 8px' : i === 5 ? '0 8px 8px 0' : '' }}>
                    {done ? '✅' : '○'} {step}
                  </div>
                );
              })}
            </div>

            {/* ACTIONS */}
            <div style={{ display: 'flex', gap: '.75rem', marginTop: '1.1rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <button
                className="btn btn-sm"
                style={{ background: '#166534', color: '#fff', fontWeight: 800, padding: '.65rem 1rem' }}
                onClick={() => setTrackingModalOrder(o)}
              >
                ⚡ Track Live Delivery
              </button>

              {o.status === 'accepted' && (
                <>
                  <button
                    className="btn btn-green btn-sm"
                    style={{ flex: 1, fontWeight: 800, padding: '.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.6rem', fontSize: '.9rem', borderRadius: '10px' }}
                    onClick={() => payToEscrow(o)}
                  >
                    <span style={{ fontSize: '1.1rem' }}>🔒</span>
                    <span>Pay ₹{finalPayable.toLocaleString()} — Secure in Escrow</span>
                    <span style={{ background: 'rgba(255,255,255,0.25)', padding: '.15rem .45rem', borderRadius: '4px', fontSize: '.72rem', fontWeight: 700, letterSpacing: '.02em' }}>
                      UPI · Card · NetBanking
                    </span>
                  </button>
                  <a
                    href="https://rzp.io/rzp/eMuqtymy"
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-sm"
                    style={{ background: '#0284C7', color: '#fff', fontWeight: 800, padding: '.75rem 1rem', textDecoration: 'none', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', gap: '.4rem' }}
                  >
                    💳 Direct Razorpay Link
                  </a>
                </>
              )}
              {o.status === 'unload-pending' && !esc.buyerConfirmedReceived && (
                <button className="btn btn-green btn-sm" style={{ flex: 1, fontWeight: 800, padding: '.65rem' }} onClick={() => confirmReceived(o._id)}>
                  ✅ Confirm Quality Pass — Release Escrow Payment to Farmer
                </button>
              )}
              {['in-transit', 'unload-pending'].includes(o.status) && esc.status !== 'disputed' && (
                <button className="btn btn-sm" style={{ background: '#FFEBEE', color: '#C62828', border: '1px solid #EF9A9A', padding: '.65rem 1rem' }} onClick={() => setDisputeModal(o)}>
                  ⚠️ Raise Quality Dispute
                </button>
              )}
              {o.status === 'rejected' && (
                <div style={{ fontSize: '.85rem', color: '#C62828', padding: '.4rem 0' }}>❌ Farmer declined this offer: {o.rejectedReason || 'Price mismatch'}</div>
              )}
              {o.status === 'delivered' && (
                <div style={{ fontSize: '.85rem', color: '#2E7D32', fontWeight: 800, padding: '.4rem 0' }}>✓ Escrow successfully settled directly to farmer bank account.</div>
              )}
            </div>
          </div>
        );
      })}

      {/* Dispute Modal */}
      {disputeModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(4px)' }} onClick={() => setDisputeModal(null)}>
          <div style={{ background: '#fff', borderRadius: '16px', maxWidth: '480px', width: '100%', padding: '1.5rem' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 .5rem', color: '#C62828' }}>⚠️ Raise Quality / Quantity Dispute</h3>
            <p style={{ fontSize: '.85rem', color: 'var(--text2)' }}>Order: <b>{disputeModal.orderId}</b> ({disputeModal.productName})</p>
            <textarea value={disputeReason} onChange={e => setDisputeReason(e.target.value)} placeholder="Describe the quality defect, moisture variation, or weight shortage..." rows={3} style={{ width: '100%', padding: '.65rem 1rem', border: '2px solid var(--border)', borderRadius: 'var(--radius2)', fontFamily: 'var(--font-body)', marginTop: '.5rem' }} />
            <div style={{ display: 'flex', gap: '.5rem', marginTop: '1rem' }}>
              <button className="btn btn-outline" onClick={() => { setDisputeModal(null); setDisputeReason(''); }}>Cancel</button>
              <button className="btn" style={{ flex: 1, background: '#C62828', color: '#fff', fontWeight: 700 }} onClick={() => raiseDispute(disputeModal._id)}>⚠️ Freeze Escrow &amp; Submit Dispute</button>
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

