import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import API from '../../../api/axios';

export default function Overview({ toast }) {
  const { currentFarmer } = useAuth();
  const [weather, setWeather] = useState(null);
  const [schemes, setSchemes] = useState([]);
  const [forecast, setForecast] = useState(null);
  const [nrsSummary, setNrsSummary] = useState(null);

  const farmerCrop = currentFarmer?.crop || 'Tomato';
  const farmerDistrict = currentFarmer?.district || 'Nashik';
  const farmerCity = currentFarmer?.district || currentFarmer?.loc?.split(',')[0]?.trim() || 'Nashik';

  useEffect(() => {
    API.get('/weather?city=' + encodeURIComponent(farmerCity)).then(r => setWeather(r.data)).catch(() => {});
    API.get('/schemes').then(r => setSchemes(r.data)).catch(() => {});
    API.get(`/prices/forecast?commodity=${encodeURIComponent(farmerCrop)}`).then(r => setForecast(r.data)).catch(() => {});
    API.get(`/prices/nrs?commodity=${encodeURIComponent(farmerCrop)}&farmerDistrict=${encodeURIComponent(farmerDistrict)}`).then(r => setNrsSummary(r.data)).catch(() => {});
  }, [farmerCrop, farmerDistrict, farmerCity]);

  const f = currentFarmer;
  const bestMandi = nrsSummary?.bestRecommendation;

  return (
    <>
      <div className="page-header" style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', flexWrap: 'wrap' }}>
          <span style={{ background: '#E8F5E9', color: '#2E7D32', padding: '.25rem .75rem', borderRadius: '50px', fontSize: '.75rem', fontWeight: 800 }}>
            🌾 KrishiSetu AI • SIH26132
          </span>
          <span style={{ fontSize: '.8rem', color: 'var(--text2)' }}>
            Real-Time Price Discovery &amp; Direct Market Linkage
          </span>
        </div>
        <h1 style={{ marginTop: '.4rem' }}>Namaskar, {f?.name || 'Kisan Bhai'}! 🙏</h1>
        <p>Here is your daily market intelligence, true profit realization, and price forecast.</p>
      </div>

      {/* KPI Stats Bar */}
      <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => window.__setActiveSection && window.__setActiveSection('f-prices')}>
          <div className="icon-box icon-green">🎯</div>
          <div className="info">
            <h3>₹{bestMandi ? bestMandi.nrsScore.toLocaleString() : '3,420'}/q</h3>
            <p>Best In-Hand NRS ({farmerCrop})</p>
          </div>
        </div>

        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => window.__setActiveSection && window.__setActiveSection('f-prices')}>
          <div className="icon-box icon-orange">🔮</div>
          <div className="info">
            <h3>{forecast?.decision === 'SELL_NOW' ? 'Sell Now' : 'Hold 7D (+14%)'}</h3>
            <p>AI Price Signal</p>
          </div>
        </div>

        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => window.__setActiveSection && window.__setActiveSection('f-marketplace')}>
          <div className="icon-box icon-blue">🤝</div>
          <div className="info">
            <h3>0% Cut</h3>
            <p>Direct Buyer Linkage</p>
          </div>
        </div>

        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => window.__setActiveSection && window.__setActiveSection('f-schemes')}>
          <div className="icon-box icon-purple">🏛️</div>
          <div className="info">
            <h3>{schemes.length || 11} Schemes</h3>
            <p>Available for You</p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
        {/* Net Realization Score Card */}
        <div className="card" style={{ borderLeft: '4px solid #2E7D32' }}>
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="card-title">🎯 Net Realization Score (NRS)</span>
            <span style={{ fontSize: '.72rem', background: '#E8F5E9', color: '#2E7D32', padding: '.2rem .6rem', borderRadius: '50px', fontWeight: 700 }}>
              0% Middleman Cut
            </span>
          </div>

          {bestMandi ? (
            <div>
              <div style={{ fontSize: '.84rem', color: 'var(--text2)', marginBottom: '.4rem' }}>
                Top Ranked Mandi for <b>{farmerCrop}</b> near <b>{farmerDistrict}</b>:
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F9FBE7', padding: '.8rem 1rem', borderRadius: '10px', border: '1px solid #E6EE9C', marginBottom: '.8rem' }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1.05rem', color: '#1B5E20' }}>
                    {bestMandi.market}
                  </div>
                  <div style={{ fontSize: '.78rem', color: 'var(--text2)' }}>
                    Distance: {bestMandi.distanceKm} km • Freight: −₹{bestMandi.transportCost}/q
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#1B5E20' }}>
                    ₹{bestMandi.nrsScore}
                  </div>
                  <div style={{ fontSize: '.68rem', color: '#2E7D32', fontWeight: 700 }}>Net in hand / qtl</div>
                </div>
              </div>

              <div style={{ fontSize: '.8rem', color: '#2E7D32', fontWeight: 700, marginBottom: '.8rem' }}>
                💰 You save ₹{bestMandi.commissionSaved}/qtl by bypassing traditional middleman brokers!
              </div>

              <button className="btn btn-green btn-sm" style={{ width: '100%' }} onClick={() => window.__setActiveSection && window.__setActiveSection('f-prices')}>
                Explore Full Mandi Rankings →
              </button>
            </div>
          ) : (
            <p style={{ color: 'var(--text3)' }}>Loading Net Realization Score data...</p>
          )}
        </div>

        {/* 7-15 Day Forecast Card */}
        <div className="card" style={{ borderLeft: '4px solid #F57C00' }}>
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="card-title">🔮 7–15 Day Price Trend Forecast</span>
            <span style={{ fontSize: '.72rem', background: '#FFF3E0', color: '#E65100', padding: '.2rem .6rem', borderRadius: '50px', fontWeight: 700 }}>
              Prophet / LSTM
            </span>
          </div>

          {forecast ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', marginBottom: '.6rem' }}>
                <span style={{
                  background: forecast.decision === 'HOLD_7D' ? '#F57C00' : '#2E7D32',
                  color: '#fff', padding: '.25rem .75rem', borderRadius: '50px', fontSize: '.75rem', fontWeight: 800
                }}>
                  {forecast.decisionBadge}
                </span>
                <span style={{ fontSize: '.85rem', fontWeight: 700 }}>{forecast.decisionTitle}</span>
              </div>

              <p style={{ fontSize: '.82rem', color: 'var(--text2)', lineHeight: 1.5, marginBottom: '.8rem' }}>
                {forecast.reason}
              </p>

              <button className="btn btn-outline btn-sm" style={{ width: '100%' }} onClick={() => window.__setActiveSection && window.__setActiveSection('f-prices')}>
                View 15-Day Price Curve →
              </button>
            </div>
          ) : (
            <p style={{ color: 'var(--text3)' }}>Loading AI Price Forecast...</p>
          )}
        </div>
      </div>

      {/* Schemes Section preview */}
      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="card-title">🏛️ Active Government Schemes for You</span>
          <button className="btn btn-outline btn-sm" onClick={() => window.__setActiveSection && window.__setActiveSection('f-schemes')}>
            View All ({schemes.length}) →
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {schemes.slice(0, 3).map((s, i) => (
            <div key={i} style={{ border: '1px solid var(--border)', borderRadius: '10px', padding: '.9rem', background: '#FAFAFA' }}>
              <div style={{ fontWeight: 800, fontSize: '.9rem', color: '#1B5E20', marginBottom: '.2rem' }}>{s.name}</div>
              <div style={{ fontSize: '.78rem', color: '#1565C0', fontWeight: 700, marginBottom: '.4rem' }}>💰 {s.benefit}</div>
              <div style={{ fontSize: '.78rem', color: 'var(--text2)', marginBottom: '.6rem', lineHeight: 1.4 }}>{s.desc?.substring(0, 85)}...</div>
              <button className="btn btn-green btn-sm" style={{ width: '100%' }} onClick={() => window.__setActiveSection && window.__setActiveSection('f-schemes')}>
                Check Eligibility &amp; Apply
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
