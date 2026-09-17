import { useState, useEffect } from 'react';
import API from '../../../api/axios';

export default function ProfitLossAdmin({ toast }) {
  const [pnl, setPnl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingExpenses, setEditingExpenses] = useState(false);
  const [expenses, setExpenses] = useState({
    serverHosting: 12000,
    smsIvrGateway: 6500,
    fieldOperations: 18000,
    paymentGatewayFees: 8500,
    customerSupport: 15000,
  });

  const fetchPnL = () => {
    setLoading(true);
    API.get('/orders/analytics/pnl')
      .then(res => {
        setPnl(res.data);
        if (res.data?.expenses) {
          setExpenses(res.data.expenses);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPnL();
  }, []);

  const handleExpenseChange = (key, val) => {
    setExpenses(prev => ({ ...prev, [key]: Number(val) || 0 }));
  };

  const handleSaveExpenses = async () => {
    setSaving(true);
    try {
      await API.put('/config/expenses', { operationalExpenses: expenses });
      toast && toast('✅ Operational expenses updated! P&L re-calculated.');
      setSaving(false);
      setEditingExpenses(false);
      fetchPnL();
    } catch {
      setSaving(false);
      toast && toast('❌ Failed to update operational expenses');
    }
  };

  const grossRevenue = pnl?.grossRevenue || 0;
  const totalExpenses = Object.values(expenses).reduce((a, b) => a + b, 0);
  const netProfit = grossRevenue - totalExpenses;
  const isProfitable = netProfit >= 0;
  const marginPct = grossRevenue > 0 ? ((netProfit / grossRevenue) * 100).toFixed(1) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.3rem' }}>
            <span style={{ background: '#E8F5E9', color: '#1B5E20', padding: '.25rem .75rem', borderRadius: '50px', fontSize: '.75rem', fontWeight: 800 }}>
              📈 Platform Economics
            </span>
            <span style={{ background: '#E3F2FD', color: '#1565C0', padding: '.25rem .75rem', borderRadius: '50px', fontSize: '.75rem', fontWeight: 700 }}>
              Real-Time Audit
            </span>
          </div>
          <h1 style={{ margin: 0, color: '#1B5E20' }}>Profit &amp; Loss (P&amp;L) Analysis</h1>
          <p style={{ margin: '.25rem 0 0', color: 'var(--text2)' }}>
            Transparent financial accounting comparing platform commission revenues against operational overheads.
          </p>
        </div>

        <button
          onClick={() => setEditingExpenses(!editingExpenses)}
          className="btn btn-primary btn-sm"
          style={{ background: 'linear-gradient(135deg, #1B5E20, #2E7D32)', border: 'none', fontWeight: 800 }}
        >
          {editingExpenses ? '✕ Close Editor' : '⚙️ Adjust Operating Expenses'}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="stats-grid">
        <div className="stat-card" style={{ borderLeft: '4px solid #1565C0' }}>
          <div className="icon-box icon-blue">💰</div>
          <div className="info">
            <h3 style={{ color: '#0D47A1' }}>₹{grossRevenue.toLocaleString()}</h3>
            <p>Gross Commission Revenue</p>
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #C62828' }}>
          <div className="icon-box icon-red">📉</div>
          <div className="info">
            <h3 style={{ color: '#C62828' }}>₹{totalExpenses.toLocaleString()}</h3>
            <p>Total Operational Expenses</p>
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: `4px solid ${isProfitable ? '#2E7D32' : '#C62828'}` }}>
          <div className="icon-box" style={{ background: isProfitable ? '#E8F5E9' : '#FFEBEE', color: isProfitable ? '#2E7D32' : '#C62828' }}>
            {isProfitable ? '✨' : '⚠️'}
          </div>
          <div className="info">
            <h3 style={{ color: isProfitable ? '#1B5E20' : '#C62828' }}>
              {isProfitable ? '+' : ''}₹{netProfit.toLocaleString()}
            </h3>
            <p>Net Platform {isProfitable ? 'Profit (Surplus)' : 'Deficit'}</p>
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #7B1FA2' }}>
          <div className="icon-box icon-purple">🎯</div>
          <div className="info">
            <h3 style={{ color: '#4A148C' }}>{marginPct}%</h3>
            <p>Net Profit Margin</p>
          </div>
        </div>
      </div>

      {/* Expense Configuration Drawer / Form */}
      {editingExpenses && (
        <div className="card" style={{ padding: '1.5rem', background: '#FFFDE7', borderRadius: '16px', border: '2px solid #FBC02D' }}>
          <h3 style={{ margin: '0 0 .5rem', color: '#F57F17' }}>⚙️ Configure Monthly Operating Expenses</h3>
          <p style={{ fontSize: '.85rem', color: 'var(--text2)', marginBottom: '1.25rem' }}>
            Update server, telecom, and ground operational expenditure to simulate platform unit economics.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '.8rem', fontWeight: 700, marginBottom: '.3rem' }}>
                ☁️ Cloud &amp; Server Hosting (₹/mo)
              </label>
              <input
                type="number"
                value={expenses.serverHosting}
                onChange={e => handleExpenseChange('serverHosting', e.target.value)}
                style={{ width: '100%', padding: '.6rem .8rem', borderRadius: '8px', border: '1px solid #CFD8DC', fontWeight: 700 }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '.8rem', fontWeight: 700, marginBottom: '.3rem' }}>
                📱 SMS &amp; IVR Gateway (₹/mo)
              </label>
              <input
                type="number"
                value={expenses.smsIvrGateway}
                onChange={e => handleExpenseChange('smsIvrGateway', e.target.value)}
                style={{ width: '100%', padding: '.6rem .8rem', borderRadius: '8px', border: '1px solid #CFD8DC', fontWeight: 700 }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '.8rem', fontWeight: 700, marginBottom: '.3rem' }}>
                🚜 Quality &amp; Field Ops (₹/mo)
              </label>
              <input
                type="number"
                value={expenses.fieldOperations}
                onChange={e => handleExpenseChange('fieldOperations', e.target.value)}
                style={{ width: '100%', padding: '.6rem .8rem', borderRadius: '8px', border: '1px solid #CFD8DC', fontWeight: 700 }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '.8rem', fontWeight: 700, marginBottom: '.3rem' }}>
                🔒 Escrow &amp; Bank Fees (₹/mo)
              </label>
              <input
                type="number"
                value={expenses.paymentGatewayFees}
                onChange={e => handleExpenseChange('paymentGatewayFees', e.target.value)}
                style={{ width: '100%', padding: '.6rem .8rem', borderRadius: '8px', border: '1px solid #CFD8DC', fontWeight: 700 }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '.8rem', fontWeight: 700, marginBottom: '.3rem' }}>
                🎧 Support &amp; Customer Success (₹/mo)
              </label>
              <input
                type="number"
                value={expenses.customerSupport}
                onChange={e => handleExpenseChange('customerSupport', e.target.value)}
                style={{ width: '100%', padding: '.6rem .8rem', borderRadius: '8px', border: '1px solid #CFD8DC', fontWeight: 700 }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '.75rem', justifyContent: 'flex-end' }}>
            <button
              onClick={() => setEditingExpenses(false)}
              className="btn btn-outline btn-sm"
            >
              Cancel
            </button>
            <button
              disabled={saving}
              onClick={handleSaveExpenses}
              className="btn btn-primary btn-sm"
              style={{ background: '#F57F17', border: 'none', color: '#fff', fontWeight: 800 }}
            >
              {saving ? 'Saving...' : '💾 Save & Recalculate'}
            </button>
          </div>
        </div>
      )}

      {/* P&L Statement Breakdown Table */}
      <div className="card" style={{ padding: '1.5rem', background: '#fff', borderRadius: '16px', border: '1px solid #E0E0E0' }}>
        <h3 style={{ margin: '0 0 1rem', color: '#1B5E20', fontSize: '1.15rem' }}>
          📑 Financial Statement Breakdown
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.88rem' }}>
            <thead>
              <tr style={{ background: '#F5F7FA', textAlign: 'left', borderBottom: '2px solid #CFD8DC' }}>
                <th style={{ padding: '.8rem 1rem' }}>Line Item</th>
                <th style={{ padding: '.8rem 1rem' }}>Classification</th>
                <th style={{ padding: '.8rem 1rem', textAlign: 'right' }}>Amount (₹)</th>
                <th style={{ padding: '.8rem 1rem', textAlign: 'right' }}>% of Revenue</th>
              </tr>
            </thead>
            <tbody>
              {/* REVENUE SECTION */}
              <tr style={{ background: '#E8F5E9', fontWeight: 800, color: '#1B5E20' }}>
                <td style={{ padding: '.8rem 1rem' }}>🟢 Gross Commission Revenue</td>
                <td style={{ padding: '.8rem 1rem' }}>Operating Inflow</td>
                <td style={{ padding: '.8rem 1rem', textAlign: 'right', fontSize: '1rem' }}>₹{grossRevenue.toLocaleString()}</td>
                <td style={{ padding: '.8rem 1rem', textAlign: 'right' }}>100.0%</td>
              </tr>

              {/* EXPENSE ITEMS */}
              <tr style={{ borderBottom: '1px solid #ECEFF1' }}>
                <td style={{ padding: '.75rem 1rem', paddingLeft: '2rem' }}>☁️ Cloud Hosting &amp; AI GPU Inference</td>
                <td style={{ padding: '.75rem 1rem', color: 'var(--text2)' }}>Technology Infrastructure</td>
                <td style={{ padding: '.75rem 1rem', textAlign: 'right', color: '#C62828', fontWeight: 700 }}>−₹{(expenses.serverHosting || 0).toLocaleString()}</td>
                <td style={{ padding: '.75rem 1rem', textAlign: 'right', color: 'var(--text2)' }}>
                  {grossRevenue > 0 ? ((expenses.serverHosting / grossRevenue) * 100).toFixed(1) : 0}%
                </td>
              </tr>

              <tr style={{ borderBottom: '1px solid #ECEFF1' }}>
                <td style={{ padding: '.75rem 1rem', paddingLeft: '2rem' }}>📱 SMS Notifications &amp; IVR Voice Calls</td>
                <td style={{ padding: '.75rem 1rem', color: 'var(--text2)' }}>Farmer Outreach Telecom</td>
                <td style={{ padding: '.75rem 1rem', textAlign: 'right', color: '#C62828', fontWeight: 700 }}>−₹{(expenses.smsIvrGateway || 0).toLocaleString()}</td>
                <td style={{ padding: '.75rem 1rem', textAlign: 'right', color: 'var(--text2)' }}>
                  {grossRevenue > 0 ? ((expenses.smsIvrGateway / grossRevenue) * 100).toFixed(1) : 0}%
                </td>
              </tr>

              <tr style={{ borderBottom: '1px solid #ECEFF1' }}>
                <td style={{ padding: '.75rem 1rem', paddingLeft: '2rem' }}>🚜 Ground Quality Assaying &amp; Field Verification</td>
                <td style={{ padding: '.75rem 1rem', color: 'var(--text2)' }}>Field Operations</td>
                <td style={{ padding: '.75rem 1rem', textAlign: 'right', color: '#C62828', fontWeight: 700 }}>−₹{(expenses.fieldOperations || 0).toLocaleString()}</td>
                <td style={{ padding: '.75rem 1rem', textAlign: 'right', color: 'var(--text2)' }}>
                  {grossRevenue > 0 ? ((expenses.fieldOperations / grossRevenue) * 100).toFixed(1) : 0}%
                </td>
              </tr>

              <tr style={{ borderBottom: '1px solid #ECEFF1' }}>
                <td style={{ padding: '.75rem 1rem', paddingLeft: '2rem' }}>🔒 Escrow Payment Gateway &amp; Banking Charges</td>
                <td style={{ padding: '.75rem 1rem', color: 'var(--text2)' }}>Financial Processing</td>
                <td style={{ padding: '.75rem 1rem', textAlign: 'right', color: '#C62828', fontWeight: 700 }}>−₹{(expenses.paymentGatewayFees || 0).toLocaleString()}</td>
                <td style={{ padding: '.75rem 1rem', textAlign: 'right', color: 'var(--text2)' }}>
                  {grossRevenue > 0 ? ((expenses.paymentGatewayFees / grossRevenue) * 100).toFixed(1) : 0}%
                </td>
              </tr>

              <tr style={{ borderBottom: '2px solid #B0BEC5' }}>
                <td style={{ padding: '.75rem 1rem', paddingLeft: '2rem' }}>🎧 Regional Support &amp; Dispute Arbitration</td>
                <td style={{ padding: '.75rem 1rem', color: 'var(--text2)' }}>Customer Success</td>
                <td style={{ padding: '.75rem 1rem', textAlign: 'right', color: '#C62828', fontWeight: 700 }}>−₹{(expenses.customerSupport || 0).toLocaleString()}</td>
                <td style={{ padding: '.75rem 1rem', textAlign: 'right', color: 'var(--text2)' }}>
                  {grossRevenue > 0 ? ((expenses.customerSupport / grossRevenue) * 100).toFixed(1) : 0}%
                </td>
              </tr>

              {/* TOTAL EXPENSES */}
              <tr style={{ background: '#FFEBEE', fontWeight: 800, color: '#C62828' }}>
                <td style={{ padding: '.8rem 1rem' }}>🔴 Total Operating Expenses</td>
                <td style={{ padding: '.8rem 1rem' }}>Overhead Outflow</td>
                <td style={{ padding: '.8rem 1rem', textAlign: 'right', fontSize: '1rem' }}>−₹{totalExpenses.toLocaleString()}</td>
                <td style={{ padding: '.8rem 1rem', textAlign: 'right' }}>
                  {grossRevenue > 0 ? ((totalExpenses / grossRevenue) * 100).toFixed(1) : 0}%
                </td>
              </tr>

              {/* NET BOTTOM LINE */}
              <tr style={{ background: isProfitable ? '#C8E6C9' : '#FFCDD2', fontWeight: 900, color: isProfitable ? '#1B5E20' : '#B71C1C', borderTop: '2px solid #37474F' }}>
                <td style={{ padding: '1rem' }}>{isProfitable ? '💎 NET PLATFORM PROFIT (SURPLUS)' : '⚠️ NET DEFICIT'}</td>
                <td style={{ padding: '1rem' }}>Bottom Line</td>
                <td style={{ padding: '1rem', textAlign: 'right', fontSize: '1.2rem' }}>
                  {isProfitable ? '+' : ''}₹{netProfit.toLocaleString()}
                </td>
                <td style={{ padding: '1rem', textAlign: 'right', fontSize: '1.05rem' }}>{marginPct}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
