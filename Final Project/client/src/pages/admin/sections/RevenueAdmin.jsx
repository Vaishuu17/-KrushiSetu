import { useState, useEffect } from 'react';
import API from '../../../api/axios';

export default function RevenueAdmin({ toast }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchRevenue = () => {
    setLoading(true);
    API.get('/orders/analytics/revenue')
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchRevenue();
    const interval = setInterval(fetchRevenue, 5000);
    return () => clearInterval(interval);
  }, []);

  const totalGMV = data?.totalGMV || 0;
  const totalRevenue = data?.totalRevenue || 0;
  const buyerComm = data?.totalBuyerCommission || 0;
  const farmerComm = data?.totalFarmerCommission || 0;
  const orders = data?.orders || [];
  const completedOrders = data?.completedOrdersCount || orders.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.3rem' }}>
            <span style={{ background: '#E8F5E9', color: '#1B5E20', padding: '.25rem .75rem', borderRadius: '50px', fontSize: '.75rem', fontWeight: 800 }}>
              💰 Financial Analytics Engine
            </span>
            <span style={{ background: '#E3F2FD', color: '#1565C0', padding: '.25rem .75rem', borderRadius: '50px', fontSize: '.75rem', fontWeight: 700 }}>
              Live Order Ledger
            </span>
          </div>
          <h1 style={{ margin: 0, color: '#1B5E20' }}>Platform Revenue &amp; Commission Ledger</h1>
          <p style={{ margin: '.25rem 0 0', color: 'var(--text2)' }}>
            Real-time Gross Merchandise Value (GMV), dual-sided commission intake, and escrow transaction settlement logs.
          </p>
        </div>

        <button
          onClick={fetchRevenue}
          className="btn btn-outline btn-sm"
          style={{ padding: '.5rem 1rem', fontWeight: 700 }}
        >
          🔄 Refresh Financials
        </button>
      </div>

      {/* KPI Cards */}
      <div className="stats-grid">
        <div className="stat-card" style={{ borderLeft: '4px solid #1565C0' }}>
          <div className="icon-box icon-blue">📦</div>
          <div className="info">
            <h3 style={{ color: '#0D47A1' }}>₹{totalGMV.toLocaleString()}</h3>
            <p>Gross Merchandise Value (GMV)</p>
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #2E7D32' }}>
          <div className="icon-box icon-green">💵</div>
          <div className="info">
            <h3 style={{ color: '#1B5E20' }}>₹{totalRevenue.toLocaleString()}</h3>
            <p>Total Platform Commission Revenue</p>
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #7B1FA2' }}>
          <div className="icon-box icon-purple">🏢</div>
          <div className="info">
            <h3 style={{ color: '#4A148C' }}>₹{buyerComm.toLocaleString()}</h3>
            <p>Buyer Fees (1.0% - 2.0%)</p>
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #E65100' }}>
          <div className="icon-box icon-orange">🌾</div>
          <div className="info">
            <h3 style={{ color: '#E65100' }}>₹{farmerComm.toLocaleString()}</h3>
            <p>Farmer Fees (0% 1st, 2% sub)</p>
          </div>
        </div>
      </div>

      {/* Commission Structure Explanatory Card */}
      <div className="card" style={{ padding: '1.25rem', background: '#F8F9FA', borderRadius: '16px', border: '1px solid #ECEFF1' }}>
        <h4 style={{ margin: '0 0 .6rem', color: '#37474F', fontSize: '.95rem' }}>
          ⚙️ Dual-Sided Platform Commission Logic
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', fontSize: '.82rem' }}>
          <div style={{ background: '#fff', padding: '.85rem', borderRadius: '10px', border: '1px solid #E0E0E0' }}>
            <b style={{ color: '#1565C0', display: 'block', marginBottom: '.3rem' }}>🏢 Buyer Tier Rates:</b>
            <div>• Bulk Buyer: <b>1.0%</b></div>
            <div>• Wholesaler: <b>1.5%</b></div>
            <div>• Retailer: <b>2.0%</b></div>
            <div>• Institutional Buyer: <b>1.5%</b></div>
          </div>
          <div style={{ background: '#fff', padding: '.85rem', borderRadius: '10px', border: '1px solid #E0E0E0' }}>
            <b style={{ color: '#2E7D32', display: 'block', marginBottom: '.3rem' }}>🌾 Farmer Incentives:</b>
            <div>• First Order: <b style={{ color: '#2E7D32' }}>0% Commission (Free)</b></div>
            <div>• Subsequent Orders: <b>2.0%</b> Standard</div>
            <div>• 100% Direct bank transfer on Quality Pass</div>
          </div>
          <div style={{ background: '#fff', padding: '.85rem', borderRadius: '10px', border: '1px solid #E0E0E0' }}>
            <b style={{ color: '#E65100', display: 'block', marginBottom: '.3rem' }}>🛡️ Farmer Welfare Allocation:</b>
            <div>• <b>10% to 12%</b> of total commission revenue is earmarked for the <b>Farmer Welfare Fund</b>.</div>
            <div>• Independent fund supporting rural safety &amp; equipment.</div>
          </div>
        </div>
      </div>

      {/* Transaction Settlement Ledger */}
      <div className="card" style={{ padding: '1.5rem', background: '#fff', borderRadius: '16px', border: '1px solid #E0E0E0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '.5rem' }}>
          <div>
            <h3 style={{ margin: 0, color: '#1B5E20', fontSize: '1.15rem' }}>
              📜 Real-Time Commission Audit Ledger
            </h3>
            <p style={{ margin: '.2rem 0 0', fontSize: '.8rem', color: 'var(--text2)' }}>
              Detailed ledger showing immutable commission snapshots captured at time of order creation.
            </p>
          </div>
          <span style={{ fontSize: '.8rem', background: '#E8F5E9', color: '#2E7D32', padding: '.3rem .75rem', borderRadius: '50px', fontWeight: 800 }}>
            {completedOrders} Total Transactions
          </span>
        </div>

        {loading && orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text3)' }}>
            Loading ledger transactions...
          </div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text3)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '.75rem' }}>📭</div>
            <h4>No settled orders in the ledger yet</h4>
            <p style={{ fontSize: '.85rem' }}>Orders completed through escrow will automatically populate this revenue ledger.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.82rem' }}>
              <thead>
                <tr style={{ background: '#F5F7FA', textAlign: 'left', borderBottom: '2px solid #CFD8DC' }}>
                  <th style={{ padding: '.75rem' }}>Order ID</th>
                  <th style={{ padding: '.75rem' }}>Buyer &amp; Tier</th>
                  <th style={{ padding: '.75rem' }}>Farmer (Seller)</th>
                  <th style={{ padding: '.75rem' }}>Produce</th>
                  <th style={{ padding: '.75rem', textAlign: 'right' }}>Subtotal (₹)</th>
                  <th style={{ padding: '.75rem', textAlign: 'right' }}>Buyer Fee</th>
                  <th style={{ padding: '.75rem', textAlign: 'right' }}>Farmer Fee</th>
                  <th style={{ padding: '.75rem', textAlign: 'right' }}>Platform Cut</th>
                  <th style={{ padding: '.75rem', textAlign: 'right' }}>Farmer Net</th>
                  <th style={{ padding: '.75rem', textAlign: 'center' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o, idx) => {
                  const sub = o.subtotal || ((o.offeredPrice || o.price || 2000) * (o.qty || 1));
                  const bPct = o.buyerCommissionPct !== undefined ? o.buyerCommissionPct : (o.buyerType === 'Bulk Buyer' ? 1.0 : o.buyerType === 'Retailer' ? 2.0 : 1.5);
                  const bAmt = o.buyerCommissionAmount !== undefined ? o.buyerCommissionAmount : Math.round(sub * (bPct / 100));
                  const fPct = o.farmerCommissionPct !== undefined ? o.farmerCommissionPct : 0.0;
                  const fAmt = o.farmerCommissionAmount !== undefined ? o.farmerCommissionAmount : Math.round(sub * (fPct / 100));
                  const platRev = o.platformCommissionRevenue !== undefined ? o.platformCommissionRevenue : (bAmt + fAmt);
                  const fNet = o.farmerNetAmount || (sub - fAmt);

                  return (
                    <tr key={o._id || idx} style={{ borderBottom: '1px solid #ECEFF1', transition: 'background .2s' }}>
                      <td style={{ padding: '.75rem', fontFamily: 'monospace', fontWeight: 700, color: '#37474F' }}>
                        {o.orderId || `ORD-${idx + 1}`}
                      </td>
                      <td style={{ padding: '.75rem' }}>
                        <b>{o.buyerName || 'Buyer'}</b>
                        <div style={{ fontSize: '.72rem', color: '#1565C0', fontWeight: 700 }}>
                          {o.buyerType || 'Wholesaler'} ({bPct}%)
                        </div>
                      </td>
                      <td style={{ padding: '.75rem' }}>
                        <b>👨‍🌾 {o.sellerName || 'Farmer'}</b>
                        <div style={{ fontSize: '.72rem', color: fPct === 0 ? '#2E7D32' : 'var(--text3)', fontWeight: 700 }}>
                          {fPct === 0 ? '🌟 1st Order (0%)' : `Subsequent (${fPct}%)`}
                        </div>
                      </td>
                      <td style={{ padding: '.75rem', fontWeight: 700, color: '#1B5E20' }}>
                        {o.productName} ({o.qty} q)
                      </td>
                      <td style={{ padding: '.75rem', textAlign: 'right', fontWeight: 700 }}>
                        ₹{sub.toLocaleString()}
                      </td>
                      <td style={{ padding: '.75rem', textAlign: 'right', color: '#1565C0', fontWeight: 700 }}>
                        +₹{bAmt.toLocaleString()}
                      </td>
                      <td style={{ padding: '.75rem', textAlign: 'right', color: fAmt > 0 ? '#E65100' : '#2E7D32', fontWeight: 700 }}>
                        {fAmt > 0 ? `+₹${fAmt.toLocaleString()}` : '₹0'}
                      </td>
                      <td style={{ padding: '.75rem', textAlign: 'right', fontWeight: 900, color: '#1B5E20', fontSize: '.9rem' }}>
                        ₹{platRev.toLocaleString()}
                      </td>
                      <td style={{ padding: '.75rem', textAlign: 'right', fontWeight: 800, color: '#2E7D32' }}>
                        ₹{fNet.toLocaleString()}
                      </td>
                      <td style={{ padding: '.75rem', textAlign: 'center' }}>
                        <span style={{ fontSize: '.72rem', background: o.status === 'delivered' ? '#E8F5E9' : '#FFF3E0', color: o.status === 'delivered' ? '#2E7D32' : '#E65100', padding: '.2rem .5rem', borderRadius: '50px', fontWeight: 800 }}>
                          {o.status}
                        </span>
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
