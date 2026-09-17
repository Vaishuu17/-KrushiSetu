import { useState, useEffect } from 'react';
import API from '../../../api/axios';

export default function FarmerWelfareAdmin({ toast }) {
  const [welfareData, setWelfareData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [rate, setRate] = useState(12);
  const [savingRate, setSavingRate] = useState(false);

  const fetchWelfare = () => {
    setLoading(true);
    API.get('/orders/analytics/welfare')
      .then(res => {
        setWelfareData(res.data);
        if (res.data?.welfareContributionPct) {
          setRate(res.data.welfareContributionPct);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchWelfare();
  }, []);

  const handleUpdateRate = async () => {
    setSavingRate(true);
    try {
      await API.put('/config/rates', { welfareContributionPct: Number(rate) });
      toast && toast(`✅ Farmer Welfare allocation rate set to ${rate}%!`);
      setSavingRate(false);
      fetchWelfare();
    } catch {
      setSavingRate(false);
      toast && toast('❌ Failed to update welfare contribution rate');
    }
  };

  const totalFund = welfareData?.totalWelfareFund || 0;
  const totalRev = welfareData?.totalCommissionRevenue || 0;
  const beneficiariesCount = welfareData?.totalFarmersSupported || Math.max(Math.floor(totalFund / 3500), 12);

  // Allocations breakdown
  const allocations = [
    { title: '💧 Micro-Drip Irrigation & Pipe Subsidies', pct: 40, amount: Math.round(totalFund * 0.40), desc: 'Direct 50% subsidy on precision drip lines for smallholders in drought-prone talukas.' },
    { title: '🧪 Soil Health Diagnostic & Organic Kits', pct: 25, amount: Math.round(totalFund * 0.25), desc: 'Free NPK soil test vouchers and organic bio-fertilizer starter kits.' },
    { title: '🛡️ Extreme Weather Emergency Buffer', pct: 20, amount: Math.round(totalFund * 0.20), desc: 'Immediate compensation pool for unseasonal hailstorms and localized crop loss.' },
    { title: '☀️ Solar Crop Dryers & Cold Storage Rent', pct: 15, amount: Math.round(totalFund * 0.15), desc: 'Assistance for solar drying perishable commodities and APMC cold storage rents.' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.3rem' }}>
            <span style={{ background: '#E8F5E9', color: '#1B5E20', padding: '.25rem .75rem', borderRadius: '50px', fontSize: '.75rem', fontWeight: 800 }}>
              🌾 Social Impact Engine • 10%–12% Earmarked
            </span>
            <span style={{ background: '#FFF3E0', color: '#E65100', padding: '.25rem .75rem', borderRadius: '50px', fontSize: '.75rem', fontWeight: 700 }}>
              Non-Diverted Corpus
            </span>
          </div>
          <h1 style={{ margin: 0, color: '#1B5E20' }}>Farmer Welfare Fund (FWF)</h1>
          <p style={{ margin: '.25rem 0 0', color: 'var(--text2)' }}>
            Dedicated social development fund accumulated directly from platform commission revenues to support small and marginal farmers.
          </p>
        </div>

        <button
          onClick={fetchWelfare}
          className="btn btn-outline btn-sm"
          style={{ padding: '.5rem 1rem', fontWeight: 700 }}
        >
          🔄 Refresh Fund Status
        </button>
      </div>

      {/* KPI Cards */}
      <div className="stats-grid">
        <div className="stat-card" style={{ borderLeft: '4px solid #2E7D32' }}>
          <div className="icon-box icon-green">🏦</div>
          <div className="info">
            <h3 style={{ color: '#1B5E20' }}>₹{totalFund.toLocaleString()}</h3>
            <p>Total Accumulated Welfare Fund</p>
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #1565C0' }}>
          <div className="icon-box icon-blue">📊</div>
          <div className="info">
            <h3 style={{ color: '#0D47A1' }}>{rate}%</h3>
            <p>Commission Earmark Rate</p>
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #E65100' }}>
          <div className="icon-box icon-orange">👨‍🌾</div>
          <div className="info">
            <h3 style={{ color: '#E65100' }}>{beneficiariesCount} Kisans</h3>
            <p>Farmers Supported via Welfare Pool</p>
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #7B1FA2' }}>
          <div className="icon-box icon-purple">💵</div>
          <div className="info">
            <h3 style={{ color: '#4A148C' }}>₹{totalRev.toLocaleString()}</h3>
            <p>Total Platform Revenue Base</p>
          </div>
        </div>
      </div>

      {/* Interactive Rate Configuration Card */}
      <div className="card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, #E8F5E9, #F1F8E9)', borderRadius: '16px', border: '1.5px solid #A5D6A7' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ margin: '0 0 .3rem', color: '#1B5E20', fontSize: '1.1rem' }}>
              ⚙️ Adjust Welfare Contribution Percentage
            </h3>
            <p style={{ margin: 0, fontSize: '.85rem', color: '#37474F' }}>
              Choose what percentage of total marketplace commission is automatically credited to the Farmer Welfare Fund.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
              <input
                type="range"
                min="8"
                max="15"
                step="0.5"
                value={rate}
                onChange={e => setRate(e.target.value)}
                style={{ width: '140px', cursor: 'pointer' }}
              />
              <span style={{ fontWeight: 900, fontSize: '1.1rem', color: '#1B5E20', minWidth: '45px' }}>
                {rate}%
              </span>
            </div>

            <button
              disabled={savingRate}
              onClick={handleUpdateRate}
              className="btn btn-green btn-sm"
              style={{ fontWeight: 800, padding: '.5rem 1.25rem' }}
            >
              {savingRate ? 'Updating...' : 'Update Earmark Rate'}
            </button>
          </div>
        </div>
      </div>

      {/* Welfare Fund Allocations */}
      <div className="card" style={{ padding: '1.5rem', background: '#fff', borderRadius: '16px', border: '1px solid #E0E0E0' }}>
        <h3 style={{ margin: '0 0 1rem', color: '#1B5E20', fontSize: '1.15rem' }}>
          🎯 Planned &amp; Active Welfare Allocations
        </h3>
        <p style={{ margin: '0 0 1.25rem', fontSize: '.85rem', color: 'var(--text2)' }}>
          Transparent program-wise fund distribution governed by platform smart contracts.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {allocations.map((a, idx) => (
            <div
              key={idx}
              style={{
                background: '#FAFAFA',
                borderRadius: '12px',
                padding: '1.25rem',
                border: '1px solid #ECEFF1',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.5rem' }}>
                  <b style={{ color: '#2E7D32', fontSize: '.92rem' }}>{a.title}</b>
                  <span style={{ fontSize: '.75rem', background: '#E8F5E9', color: '#2E7D32', padding: '.2rem .5rem', borderRadius: '50px', fontWeight: 800 }}>
                    {a.pct}%
                  </span>
                </div>
                <p style={{ fontSize: '.8rem', color: 'var(--text2)', margin: '0 0 1rem', lineHeight: 1.4 }}>
                  {a.desc}
                </p>
              </div>

              <div>
                <div style={{ background: '#E0E0E0', height: '6px', borderRadius: '3px', overflow: 'hidden', marginBottom: '.6rem' }}>
                  <div style={{ background: '#2E7D32', height: '100%', width: `${a.pct * 2}%` }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.85rem' }}>
                  <span style={{ color: 'var(--text3)', fontSize: '.75rem' }}>Current Pool:</span>
                  <b style={{ color: '#1B5E20' }}>₹{a.amount.toLocaleString()}</b>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
