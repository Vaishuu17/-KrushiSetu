import { useState, useEffect } from 'react';

export default function DeliveryTrackerModal({ order, onClose }) {
  if (!order) return null;

  const [progress, setProgress] = useState(65);
  const [driverSpeed, setDriverSpeed] = useState(46);

  // Status mapping for progress percentage & state
  const getStatusProgress = (status) => {
    switch (status) {
      case 'offer-pending': return { pct: 15, step: 1, label: 'Offer Pending Acceptance' };
      case 'accepted': return { pct: 30, step: 2, label: 'Payment Held in Escrow' };
      case 'payment-held': return { pct: 45, step: 3, label: 'Produce Loaded at Farm' };
      case 'in-transit': return { pct: 72, step: 4, label: 'In-Transit on Highway' };
      case 'unload-pending': return { pct: 90, step: 5, label: 'Arrived at Mandi Gate — Inspection' };
      case 'delivered': return { pct: 100, step: 6, label: 'Delivered & Unloaded' };
      default: return { pct: 50, step: 3, label: 'Processing' };
    }
  };

  const statusInfo = getStatusProgress(order.status);

  // Animate truck speed slightly for live feel
  useEffect(() => {
    const interval = setInterval(() => {
      if (order.status === 'in-transit') {
        setDriverSpeed(42 + Math.floor(Math.random() * 8));
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [order.status]);

  const transport = order.transportDetails || {
    vehicle: 'MH-15-EG-4482 (Eicher 14ft)',
    driver: 'Ramesh Shinde (+91 98231 44210)',
    fare: 2200,
    bookingId: 'TRK-98214'
  };

  const driverPhone = transport.driver?.match(/\+?\d[\d\s\-]{8,}/)?.[0] || '9823144210';
  const driverName = transport.driver?.split('(')[0]?.trim() || 'Ramesh Shinde';

  const steps = [
    { num: 1, title: 'Order Confirmed', desc: 'Agreed price locked in contract' },
    { num: 2, title: 'Escrow Secured', desc: '100% Funds held in platform wallet' },
    { num: 3, title: 'Loaded at Farmgate', desc: 'Quality checked & weighed at farm' },
    { num: 4, title: 'In-Transit (GPS Live)', desc: 'Vehicle en-route via National Highway' },
    { num: 5, title: 'Mandi Gate Pass', desc: 'Gate entry inspection & unloading' },
    { num: 6, title: 'Escrow Released', desc: 'Payment transferred to farmer account' },
  ];

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)',
      backdropFilter: 'blur(6px)', zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem', animation: 'fadeIn .2s ease-out'
    }} onClick={onClose}>

      <div style={{
        background: '#fff', borderRadius: '24px', width: '100%', maxWidth: '580px',
        maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        border: '1px solid #E2E8F0', overflow: 'hidden'
      }} onClick={e => e.stopPropagation()}>

        {/* ── ZOMATO / BLINKIT BRANDED HEADER ── */}
        <div style={{
          background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 60%, #388E3C 100%)',
          padding: '1.25rem 1.5rem', color: '#fff', position: 'relative'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem' }}>
              <span style={{
                background: '#FFEB3B', color: '#1B5E20', padding: '.25rem .75rem',
                borderRadius: '50px', fontSize: '.75rem', fontWeight: 900, textTransform: 'uppercase'
              }}>
                ⚡ Live Delivery Radar
              </span>
              <span style={{ fontSize: '.78rem', color: 'rgba(255,255,255,0.85)', display: 'flex', alignItems: 'center', gap: '.3rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#69F0AE', animation: 'blink 1.2s infinite' }} />
                GPS Active
              </span>
            </div>
            <button onClick={onClose} style={{
              background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff',
              width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer',
              fontSize: '1rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>✕</button>
          </div>

          <div style={{ marginTop: '1rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 900 }}>
              🌾 {order.productName} ({order.qty} Quintals)
            </h2>
            <div style={{ fontSize: '.82rem', opacity: 0.9, marginTop: '.2rem' }}>
              Order ID: <b style={{ fontFamily: 'monospace', color: '#FFF59D' }}>{order.orderId || 'KMO-LIVE'}</b> · From: {order.sellerLoc || 'Nashik'} ➔ {order.buyerLoc || 'Vashi Mandi'}
            </div>
          </div>

          {/* ETA Card */}
          <div style={{
            background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)',
            borderRadius: '16px', padding: '.85rem 1.1rem', marginTop: '1rem',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <div>
              <div style={{ fontSize: '.72rem', textTransform: 'uppercase', opacity: 0.8, fontWeight: 700 }}>Estimated Arrival</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#FFF' }}>
                {order.status === 'delivered' ? '✅ Delivered' : order.status === 'unload-pending' ? '📍 Arrived at Gate' : '⏱️ 42 Minutes'}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '.72rem', textTransform: 'uppercase', opacity: 0.8, fontWeight: 700 }}>Live Speed</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#69F0AE' }}>
                {order.status === 'delivered' ? '0 km/h' : `${driverSpeed} km/h 🚛`}
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: '1.25rem' }}>

          {/* ── ANIMATED LIVE ROUTE TRACKER ── */}
          <div style={{
            background: '#F8FAFC', borderRadius: '18px', padding: '1.25rem 1rem',
            border: '1px solid #E2E8F0', marginBottom: '1.25rem', position: 'relative'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.78rem', fontWeight: 800, color: '#475569', marginBottom: '.6rem' }}>
              <span>🏡 Farmgate ({order.sellerLoc || 'Nashik'})</span>
              <span style={{ color: '#1E293B', fontWeight: 900 }}>{statusInfo.label}</span>
              <span>🏢 Mandi Gate ({order.buyerLoc || 'Vashi'})</span>
            </div>

            {/* Track Bar Container */}
            <div style={{
              height: '14px', background: '#CBD5E1', borderRadius: '7px',
              position: 'relative', overflow: 'visible', margin: '1.5rem .5rem 1rem'
            }}>
              {/* Progress Fill */}
              <div style={{
                height: '100%', background: 'linear-gradient(90deg, #2E7D32, #4CAF50)',
                width: `${statusInfo.pct}%`, borderRadius: '7px',
                transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)'
              }} />

              {/* Moving Truck Icon */}
              <div style={{
                position: 'absolute', top: '-14px', left: `calc(${statusInfo.pct}% - 18px)`,
                width: '36px', height: '36px', background: '#1565C0', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem',
                boxShadow: '0 4px 12px rgba(21,101,192,0.4)', border: '2px solid #fff',
                transition: 'left 1s cubic-bezier(0.4, 0, 0.2, 1)'
              }}>
                🚚
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.72rem', color: '#64748B', marginTop: '.4rem' }}>
              <span>Loaded: {order.shippedAt ? new Date(order.shippedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '08:30 AM'}</span>
              <span>Distance Covered: {Math.round(statusInfo.pct * 1.8)} km / 180 km</span>
            </div>
          </div>

          {/* ── DRIVER & VEHICLE DETAILS (BLINKIT CARD) ── */}
          <div style={{
            border: '2px solid #E2E8F0', borderRadius: '18px', padding: '1rem 1.1rem',
            marginBottom: '1.25rem', background: '#FFF', display: 'flex',
            alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.85rem' }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '50%',
                background: '#E8F5E9', border: '2px solid #A5D6A7',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.5rem', flexShrink: 0
              }}>
                👨‍✈️
              </div>
              <div>
                <div style={{ fontWeight: 900, fontSize: '1rem', color: '#0F172A' }}>
                  {driverName}
                </div>
                <div style={{ fontSize: '.78rem', color: '#64748B', marginTop: '.1rem' }}>
                  🚛 {transport.vehicle}
                </div>
                <div style={{ fontSize: '.72rem', color: '#166534', fontWeight: 700, marginTop: '.2rem' }}>
                  ⭐ 4.9 Rating • 450+ Successful Trips
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '.5rem' }}>
              <a href={`tel:${driverPhone}`} style={{
                background: '#166534', color: '#fff', textDecoration: 'none',
                padding: '.6rem 1rem', borderRadius: '12px', fontSize: '.82rem',
                fontWeight: 800, display: 'flex', alignItems: 'center', gap: '.4rem',
                boxShadow: '0 4px 12px rgba(22,101,52,0.2)'
              }}>
                📞 Call Driver
              </a>
            </div>
          </div>

          {/* ── GATE PASS OTP & ESCROW SECURITY BADGE ── */}
          <div style={{
            background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '16px',
            padding: '.85rem 1.1rem', marginBottom: '1.25rem', display: 'flex',
            justify: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '.5rem'
          }}>
            <div>
              <div style={{ fontSize: '.72rem', color: '#1E40AF', fontWeight: 800, textTransform: 'uppercase' }}>
                Mandi Gate Security Pass Code
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: 900, fontFamily: 'monospace', color: '#1E3A8A', letterSpacing: '2px' }}>
                GATE-7294-PASS
              </div>
            </div>
            <div style={{
              background: '#DBEAFE', color: '#1E40AF', padding: '.4rem .75rem',
              borderRadius: '10px', fontSize: '.75rem', fontWeight: 800
            }}>
              🔒 Escrow Protected (₹{(order.totalAmount || order.subtotal || 0).toLocaleString()})
            </div>
          </div>

          {/* ── STEP-BY-STEP DELIVERY TIMELINE (ZOMATO STYLE) ── */}
          <div style={{ background: '#FFF', borderRadius: '16px', padding: '.5rem 0' }}>
            <div style={{ fontWeight: 900, fontSize: '.95rem', color: '#0F172A', marginBottom: '1rem' }}>
              📋 Delivery Milestones Timeline
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {steps.map((st) => {
                const isCompleted = statusInfo.step > st.num;
                const isCurrent = statusInfo.step === st.num;

                return (
                  <div key={st.num} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div style={{
                      width: '28px', height: '28px', borderRadius: '50%',
                      background: isCompleted ? '#2E7D32' : isCurrent ? '#1565C0' : '#E2E8F0',
                      color: isCompleted || isCurrent ? '#FFF' : '#64748B',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 900, fontSize: '.8rem', flexShrink: 0,
                      boxShadow: isCurrent ? '0 0 0 4px rgba(21,101,192,0.2)' : 'none'
                    }}>
                      {isCompleted ? '✓' : st.num}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: '.88rem', fontWeight: isCurrent || isCompleted ? 800 : 600,
                        color: isCompleted ? '#1E293B' : isCurrent ? '#1565C0' : '#94A3B8'
                      }}>
                        {st.title} {isCurrent && <span style={{ fontSize: '.7rem', background: '#E0F2FE', color: '#0369A1', padding: '.15rem .45rem', borderRadius: '50px', marginLeft: '.4rem' }}>In Progress</span>}
                      </div>
                      <div style={{ fontSize: '.78rem', color: '#64748B', marginTop: '.1rem' }}>
                        {st.desc}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div style={{ padding: '1rem 1.25rem', background: '#F8FAFC', borderTop: '1px solid #E2E8F0', textAlign: 'right' }}>
          <button onClick={onClose} className="btn btn-outline" style={{ fontWeight: 800 }}>
            Close Tracker
          </button>
        </div>

      </div>

      <style>{`
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.97); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
}
