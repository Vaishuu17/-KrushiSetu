import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import API from '../../../api/axios';

export default function SmartSellDecision() {
  const { currentFarmer } = useAuth();
  const { t } = useLanguage();

  const [crop, setCrop] = useState(currentFarmer?.crop?.split('(')[0]?.trim() || 'Tomato');
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);

  const cropList = [
    'Tomato', 'Onion', 'Wheat', 'Soybean', 'Cotton', 'Potato',
    'Chili', 'Pomegranate', 'Maize', 'Turmeric', 'Mustard', 'Groundnut'
  ];

  const fetchForecast = () => {
    setLoading(true);
    API.get(`/prices/forecast?commodity=${encodeURIComponent(crop)}`)
      .then(res => {
        setForecast(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchForecast();
  }, [crop]);

  return (
    <>
      <div className="page-header" style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', flexWrap: 'wrap' }}>
          <span style={{ background: '#FFF3E0', color: '#E65100', padding: '.25rem .75rem', borderRadius: '50px', fontSize: '.75rem', fontWeight: 800 }}>
            🔮 {t('aiDecisionTitle', 'Decision Support')}
          </span>
          <span style={{ background: '#E8F5E9', color: '#2E7D32', padding: '.25rem .75rem', borderRadius: '50px', fontSize: '.75rem', fontWeight: 700 }}>
            {t('recommendationReason', 'Rule-Based Analytics Engine')}
          </span>
        </div>
        <h1 style={{ marginTop: '.4rem' }}>🔮 {t('aiDecisionTitle', 'Smart Sell Decision Support')}</h1>
        <p>{t('aiDecisionSubtitle', 'Actionable recommendation: whether to Sell Immediately or Wait 7–15 Days based on market arrivals and price momentum.')}</p>
      </div>

      {/* CROP SELECTOR */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <label style={{ fontSize: '.88rem', fontWeight: 800, color: '#1B5E20' }}>
            🌾 {t('cropSelector', 'Select Crop for AI Advisory')}:
          </label>
          <div style={{ display: 'flex', gap: '.4rem', flexWrap: 'wrap' }}>
            {cropList.map(c => (
              <button
                key={c}
                onClick={() => setCrop(c)}
                style={{
                  padding: '.45rem .85rem',
                  borderRadius: '50px',
                  border: crop === c ? '2px solid #2E7D32' : '1px solid #E0E0E0',
                  background: crop === c ? '#E8F5E9' : '#FAFAFA',
                  color: crop === c ? '#1B5E20' : 'var(--text2)',
                  fontWeight: crop === c ? 800 : 600,
                  fontSize: '.8rem',
                  cursor: 'pointer',
                  transition: 'all .15s'
                }}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤖</div>
          <p>{t('loading', 'Analyzing arrivals & running price momentum calculations...')}</p>
        </div>
      ) : forecast ? (
        <>
          {/* PRIMARY RECOMMENDATION BANNER */}
          <div
            style={{
              background: forecast.decision === 'HOLD_7D' ? 'linear-gradient(135deg, #FFF8E1, #FFF3E0)' : 'linear-gradient(135deg, #E8F5E9, #C8E6C9)',
              border: `2px solid ${forecast.decision === 'HOLD_7D' ? '#FFB300' : '#43A047'}`,
              borderRadius: '16px',
              padding: '1.5rem',
              marginBottom: '1.5rem',
              boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <span
                  style={{
                    background: forecast.decision === 'HOLD_7D' ? '#E65100' : '#2E7D32',
                    color: '#fff',
                    padding: '.35rem .9rem',
                    borderRadius: '50px',
                    fontSize: '.82rem',
                    fontWeight: 900
                  }}
                >
                  {forecast.decision === 'HOLD_7D' ? '🟡 ' + t('waitHold', 'WAIT / HOLD 7 DAYS') : '🟢 ' + t('sellNow', 'SELL NOW')}
                </span>
                <h2 style={{ margin: '.6rem 0 .3rem', fontFamily: 'var(--font-head)', color: '#1B5E20' }}>
                  {forecast.decisionTitle}
                </h2>
                <p style={{ margin: '0 0 .5rem', fontSize: '.9rem', color: 'var(--text1)', maxWidth: '680px', lineHeight: 1.55 }}>
                  {forecast.reason}
                </p>
              </div>

              <div style={{ background: '#fff', padding: '.9rem 1.3rem', borderRadius: '12px', textAlign: 'center', border: '1px solid #E0E0E0' }}>
                <div style={{ fontSize: '.72rem', color: 'var(--text3)', fontWeight: 700 }}>{t('confidenceScore', 'CONFIDENCE')}</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#1B5E20' }}>{forecast.confidenceScore}%</div>
                <div style={{ fontSize: '.68rem', color: 'var(--text3)' }}>Ensemble Decision</div>
              </div>
            </div>

            {/* Decision Factors Bar */}
            <div
              style={{
                marginTop: '1.25rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: '.75rem',
                background: '#fff',
                padding: '.85rem 1rem',
                borderRadius: '12px',
                border: '1px solid #E0E0E0'
              }}
            >
              <div>
                <div style={{ fontSize: '.7rem', color: 'var(--text3)', fontWeight: 700 }}>{t('currentPrice', 'CURRENT PRICE')}</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#1B5E20' }}>₹{forecast.currentPrice}/qtl</div>
              </div>
              <div>
                <div style={{ fontSize: '.7rem', color: 'var(--text3)', fontWeight: 700 }}>{t('sevenDayTrend', '7-DAY EXPECTED GAIN')}</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 900, color: forecast.expectedGain7d >= 0 ? '#2E7D32' : '#C62828' }}>
                  {forecast.expectedGain7d >= 0 ? '+' : ''}₹{forecast.expectedGain7d}/qtl ({forecast.expectedGain7dPct}%)
                </div>
              </div>
              <div>
                <div style={{ fontSize: '.7rem', color: 'var(--text3)', fontWeight: 700 }}>{t('demandLevel', 'BUYER DEMAND')}</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1565C0' }}>🔥 {t('highDemand', 'High Demand')}</div>
              </div>
              <div>
                <div style={{ fontSize: '.7rem', color: 'var(--text3)', fontWeight: 700 }}>{t('weatherRisk', 'WEATHER RISK')}</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#F57C00' }}>⛅ {t('moderateDemand', 'Low-Medium')}</div>
              </div>
            </div>
          </div>

          {/* 15-DAY FORWARD PRICE CURVE */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="card-title">🔮 15-Day Projected Forward Curve for {crop} (₹/qtl)</span>
              <span style={{ fontSize: '.75rem', color: '#1565C0', fontWeight: 700 }}>Forward Horizon</span>
            </div>

            <div style={{ display: 'flex', gap: '6px', padding: '1.5rem .5rem 1rem', overflowX: 'auto', alignItems: 'flex-end', minHeight: '220px' }}>
              {forecast.forecast.slice(0, 10).map((f, idx) => (
                <div key={idx} style={{ flex: 1, minWidth: '42px', textAlign: 'center' }}>
                  <div style={{ fontSize: '.68rem', fontWeight: 800, color: '#2E7D32', marginBottom: '4px' }}>
                    ₹{f.predictedPrice}
                  </div>
                  <div
                    style={{
                      height: `${Math.max(30, (f.predictedPrice / 6000) * 140)}px`,
                      background: 'linear-gradient(to top, #2E7D32, #66BB6A)',
                      borderRadius: '4px 4px 0 0',
                      border: '1px dashed #1B5E20'
                    }}
                    title={`Day ${f.day} (${f.date}): Expected ₹${f.predictedPrice}`}
                  />
                  <div style={{ fontSize: '.62rem', color: 'var(--text2)', fontWeight: 700, marginTop: '4px' }}>
                    {f.date}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ padding: '.75rem', background: '#FAFAFA', borderRadius: '8px', fontSize: '.78rem', color: 'var(--text2)', lineHeight: 1.4, margin: '.5rem 0 0' }}>
              💡 <b>Decision Rationale:</b> When arrival supply drops across regional APMC mandis, prices typically rise by 8–15% over a 7-day window. If you have on-farm storage, holding can significantly increase in-hand profit.
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}
