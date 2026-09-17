import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import API from '../../../api/axios';

export default function MarketPrices({ initialSearch = '' }) {
  const { currentFarmer } = useAuth();
  const [activeTab, setActiveTab] = useState('nrs'); // 'nrs' | 'forecast' | 'mandi'
  const [commodity, setCommodity] = useState(initialSearch || 'Tomato');
  const [state, setState] = useState(currentFarmer?.state || 'Maharashtra');
  const [district, setDistrict] = useState(currentFarmer?.district || 'Nashik');
  const [radiusKm, setRadiusKm] = useState(150);
  const [quantityQtl, setQuantityQtl] = useState(25);
  const [truckRate, setTruckRate] = useState(3.5);

  // NRS Data
  const [nrsData, setNrsData] = useState(null);
  const [nrsLoading, setNrsLoading] = useState(true);

  // Forecast Data
  const [forecastData, setForecastData] = useState(null);
  const [forecastLoading, setForecastLoading] = useState(false);

  // Live Mandi Data
  const [govData, setGovData] = useState([]);
  const [govLoading, setGovLoading] = useState(false);
  const [govTotal, setGovTotal] = useState(0);

  const commodities = ['Tomato', 'Onion', 'Potato', 'Wheat', 'Rice', 'Soybean', 'Cotton', 'Chili', 'Maize', 'Mustard', 'Turmeric', 'Banana'];
  const states = ['Maharashtra', 'Madhya Pradesh', 'Gujarat', 'Punjab', 'Uttar Pradesh', 'Rajasthan', 'Karnataka', 'Tamil Nadu', 'Andhra Pradesh', 'Bihar', 'Haryana'];

  useEffect(() => {
    if (initialSearch) {
      setCommodity(initialSearch);
    }
  }, [initialSearch]);

  const fetchNRS = () => {
    setNrsLoading(true);
    const params = new URLSearchParams({
      commodity,
      state,
      farmerDistrict: district,
      radiusKm: radiusKm.toString(),
      truckRatePerKm: truckRate.toString(),
    });

    API.get(`/prices/nrs?${params.toString()}`)
      .then(res => {
        setNrsData(res.data);
        setNrsLoading(false);
      })
      .catch(() => setNrsLoading(false));
  };

  const fetchForecast = () => {
    setForecastLoading(true);
    API.get(`/prices/forecast?commodity=${encodeURIComponent(commodity)}`)
      .then(res => {
        setForecastData(res.data);
        setForecastLoading(false);
      })
      .catch(() => setForecastLoading(false));
  };

  const fetchGovData = () => {
    setGovLoading(true);
    const params = new URLSearchParams({ limit: '100' });
    if (state) params.append('state', state);
    if (commodity) params.append('commodity', commodity);
    API.get(`/prices/govdata?${params.toString()}`)
      .then(r => {
        setGovData(r.data.records || []);
        setGovTotal(r.data.total || 0);
        setGovLoading(false);
      })
      .catch(() => { setGovData([]); setGovLoading(false); });
  };

  useEffect(() => {
    fetchNRS();
    fetchForecast();
    fetchGovData();
  }, [commodity, state, district, radiusKm, truckRate]);

  const best = nrsData?.bestRecommendation;
  const totalExtraEarnings = best ? Math.round(best.netExtraProfit * quantityQtl) : 0;
  const totalInHandKrishiSetu = best ? Math.round(best.nrsScore * quantityQtl) : 0;
  const totalTraditionalInHand = best ? Math.round(best.traditionalNet * quantityQtl) : 0;

  return (
    <>
      <div className="page-header" style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', flexWrap: 'wrap' }}>
          <span style={{ background: '#E8F5E9', color: '#2E7D32', padding: '.25rem .75rem', borderRadius: '50px', fontSize: '.75rem', fontWeight: 800 }}>
            🎯 SIH26132 • AI INOVATORS
          </span>
          <span style={{ background: '#E3F2FD', color: '#1565C0', padding: '.25rem .75rem', borderRadius: '50px', fontSize: '.75rem', fontWeight: 700 }}>
            Agmarknet &amp; eNAM Integrated
          </span>
        </div>
        <h1 style={{ marginTop: '.4rem' }}>📈 Price Discovery &amp; Net Realization Score (NRS)</h1>
        <p>Rank mandis by <b>True In-Hand Profit</b> after deducting transportation cost and cutting middleman commission to 0%.</p>
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: '1.25rem' }}>
        <div className={`tab${activeTab === 'nrs' ? ' active' : ''}`} onClick={() => setActiveTab('nrs')}>
          🎯 Net Realization Score (NRS)
        </div>
        <div className={`tab${activeTab === 'forecast' ? ' active' : ''}`} onClick={() => setActiveTab('forecast')}>
          🔮 7–15 Day Price Forecast (Sell vs Hold)
        </div>
        <div className={`tab${activeTab === 'mandi' ? ' active' : ''}`} onClick={() => setActiveTab('mandi')}>
          🏛️ Live Mandi Data Feed
        </div>
      </div>

      {/* Filters Bar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '.75rem', alignItems: 'flex-end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '.78rem', fontWeight: 700, marginBottom: '.3rem' }}>🌾 Crop / Commodity</label>
            <select
              value={commodity}
              onChange={e => setCommodity(e.target.value)}
              style={{ width: '100%', padding: '.6rem .8rem', borderRadius: '8px', border: '1.5px solid var(--border)', fontWeight: 600 }}
            >
              {commodities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '.78rem', fontWeight: 700, marginBottom: '.3rem' }}>📍 Farmer District</label>
            <input
              type="text"
              value={district}
              onChange={e => setDistrict(e.target.value)}
              placeholder="e.g. Nashik"
              style={{ width: '100%', padding: '.6rem .8rem', borderRadius: '8px', border: '1.5px solid var(--border)', fontWeight: 600 }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '.78rem', fontWeight: 700, marginBottom: '.3rem' }}>🗺️ State</label>
            <select
              value={state}
              onChange={e => setState(e.target.value)}
              style={{ width: '100%', padding: '.6rem .8rem', borderRadius: '8px', border: '1.5px solid var(--border)', fontWeight: 600 }}
            >
              {states.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '.78rem', fontWeight: 700, marginBottom: '.3rem' }}>📡 Mandi Radius: <b>{radiusKm} km</b></label>
            <select
              value={radiusKm}
              onChange={e => setRadiusKm(Number(e.target.value))}
              style={{ width: '100%', padding: '.6rem .8rem', borderRadius: '8px', border: '1.5px solid var(--border)', fontWeight: 600 }}
            >
              <option value="50">50 km (Nearby Mandis)</option>
              <option value="100">100 km (Regional)</option>
              <option value="200">200 km (State-wide)</option>
              <option value="500">500 km (Pan-India)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '.78rem', fontWeight: 700, marginBottom: '.3rem' }}>⚖️ Total Crop (Qtl)</label>
            <input
              type="number"
              value={quantityQtl}
              onChange={e => setQuantityQtl(Math.max(1, Number(e.target.value)))}
              style={{ width: '100%', padding: '.6rem .8rem', borderRadius: '8px', border: '1.5px solid var(--border)', fontWeight: 600 }}
            />
          </div>
        </div>
      </div>

      {/* TAB 1: NET REALIZATION SCORE (NRS) */}
      {activeTab === 'nrs' && (
        <>
          {/* Formula Banner */}
          <div style={{
            background: 'linear-gradient(135deg, #1B5E20, #2E7D32)',
            borderRadius: '16px',
            padding: '1.25rem 1.5rem',
            color: '#fff',
            marginBottom: '1.5rem',
            boxShadow: '0 8px 24px rgba(27,94,32,.2)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem'
          }}>
            <div style={{ flex: '1 1 320px' }}>
              <div style={{ fontSize: '.75rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: .9, fontWeight: 700 }}>
                📐 Core Metric (Slide 2 &amp; 3)
              </div>
              <div style={{ fontSize: '1.2rem', fontFamily: 'var(--font-head)', fontWeight: 800, marginTop: '.2rem' }}>
                Net In-Hand Profit = Mandi Rate − Transport Cost − Commission (0%)
              </div>
              <p style={{ margin: '.4rem 0 0', fontSize: '.84rem', opacity: .95 }}>
                Prevents misleading high gross prices that lose money in freight or middleman cuts (20–30%).
              </p>
            </div>
            <div style={{
              background: 'rgba(255,255,255,.15)',
              backdropFilter: 'blur(8px)',
              borderRadius: '12px',
              padding: '.8rem 1.2rem',
              textAlign: 'center',
              border: '1px solid rgba(255,255,255,.25)'
            }}>
              <div style={{ fontSize: '.72rem', textTransform: 'uppercase' }}>Farmer Profit Gain</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#FFEB3B' }}>+20% to 30%</div>
              <div style={{ fontSize: '.72rem' }}>Zero Middleman Cut</div>
            </div>
          </div>

          {nrsLoading ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤖</div>
              <p style={{ color: 'var(--text2)', fontWeight: 600 }}>Calculating Net Realization Scores across mandis...</p>
            </div>
          ) : (
            <>
              {/* Top Recommendation Highlight Card */}
              {best && (
                <div style={{
                  background: 'linear-gradient(135deg, #FFFDE7, #FFF8E1)',
                  border: '2px solid #FFD54F',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  marginBottom: '1.5rem',
                  boxShadow: '0 4px 20px rgba(255,193,7,.15)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <span style={{ background: '#2E7D32', color: '#fff', padding: '.3rem .8rem', borderRadius: '50px', fontSize: '.75rem', fontWeight: 800 }}>
                        🏆 #1 RECOMMENDED MANDI FOR TRUE IN-HAND PROFIT
                      </span>
                      <h2 style={{ margin: '.5rem 0 .2rem', fontFamily: 'var(--font-head)', color: '#1B5E20' }}>
                        {best.market} ({best.district})
                      </h2>
                      <p style={{ margin: 0, fontSize: '.88rem', color: 'var(--text2)' }}>
                        Distance: <b>{best.distanceKm} km</b> • Mandi Headline Rate: <b>₹{best.mandiPrice.toLocaleString()}/qtl</b> • Transport: <b>₹{best.transportCost}/qtl</b>
                      </p>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '.78rem', color: 'var(--text2)', fontWeight: 700 }}>TRUE NET IN-HAND PROFIT</div>
                      <div style={{ fontSize: '2.2rem', fontFamily: 'var(--font-head)', fontWeight: 900, color: '#1B5E20', lineHeight: 1 }}>
                        ₹{best.nrsScore.toLocaleString()}<span style={{ fontSize: '1rem', fontWeight: 600 }}>/qtl</span>
                      </div>
                      <div style={{ fontSize: '.78rem', color: '#2E7D32', fontWeight: 700, marginTop: '.2rem' }}>
                        0% Middleman Commission
                      </div>
                    </div>
                  </div>

                  {/* In-Hand Comparison Box */}
                  <div style={{
                    marginTop: '1.25rem',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem',
                    background: '#fff',
                    padding: '1rem 1.25rem',
                    borderRadius: '12px',
                    border: '1px solid #FFE082'
                  }}>
                    <div>
                      <div style={{ fontSize: '.72rem', color: 'var(--text3)', textTransform: 'uppercase', fontWeight: 700 }}>For {quantityQtl} Qtl Sale (KrishiSetu)</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1B5E20' }}>
                        ₹{totalInHandKrishiSetu.toLocaleString()}
                      </div>
                      <div style={{ fontSize: '.75rem', color: '#2E7D32' }}>Direct Realization</div>
                    </div>

                    <div>
                      <div style={{ fontSize: '.72rem', color: 'var(--text3)', textTransform: 'uppercase', fontWeight: 700 }}>Traditional Middleman In-Hand</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#C62828' }}>
                        ₹{totalTraditionalInHand.toLocaleString()}
                      </div>
                      <div style={{ fontSize: '.75rem', color: '#C62828' }}>After 22% broker cut &amp; freight</div>
                    </div>

                    <div style={{ background: '#E8F5E9', padding: '.6rem .9rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <div style={{ fontSize: '.72rem', color: '#2E7D32', textTransform: 'uppercase', fontWeight: 800 }}>💰 Your Extra In-Hand Gain</div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#2E7D32' }}>
                        +₹{totalExtraEarnings.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Mandi Ranking Table */}
              <div className="card">
                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '.5rem' }}>
                  <div>
                    <span className="card-title">📊 Mandi Ranking by Net Realization Score (NRS)</span>
                    <p style={{ margin: '.2rem 0 0', fontSize: '.8rem', color: 'var(--text3)' }}>
                      Ranked from Highest True In-Hand Profit to Lowest (Freight &amp; Commission Adjusted)
                    </p>
                  </div>
                  <span style={{ fontSize: '.75rem', background: '#E8F5E9', color: '#2E7D32', padding: '.3rem .8rem', borderRadius: '50px', fontWeight: 800 }}>
                    {nrsData?.rankings?.length || 0} Mandis in Radius
                  </span>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Rank</th>
                        <th>Mandi / Market</th>
                        <th>Distance</th>
                        <th>Headline Rate</th>
                        <th>Freight Cost</th>
                        <th>Broker Cut</th>
                        <th>True In-Hand (NRS)</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {nrsData?.rankings?.map((r, i) => (
                        <tr key={i} style={{ background: i === 0 ? '#F1F8E9' : 'transparent', fontWeight: i === 0 ? 700 : 'normal' }}>
                          <td>
                            <span style={{
                              display: 'inline-block',
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              background: i === 0 ? '#2E7D32' : i === 1 ? '#1565C0' : i === 2 ? '#E65100' : '#E0E0E0',
                              color: i < 3 ? '#fff' : '#424242',
                              textAlign: 'center',
                              lineHeight: '24px',
                              fontSize: '.75rem',
                              fontWeight: 800
                            }}>
                              {i + 1}
                            </span>
                          </td>
                          <td>
                            <b>{r.market}</b>
                            <span style={{ display: 'block', fontSize: '.75rem', color: 'var(--text3)' }}>{r.district}, {r.state}</span>
                          </td>
                          <td>{r.distanceKm} km</td>
                          <td>₹{r.mandiPrice.toLocaleString()}/qtl</td>
                          <td style={{ color: '#E65100' }}>− ₹{r.transportCost}</td>
                          <td style={{ color: '#2E7D32' }}><b>₹0 (0%)</b> <span style={{ fontSize: '.7rem', color: 'var(--text3)', textDecoration: 'line-through' }}>₹{r.commissionSaved}</span></td>
                          <td>
                            <span style={{ fontFamily: 'var(--font-head)', fontWeight: 900, color: '#1B5E20', fontSize: '1.05rem' }}>
                              ₹{r.nrsScore.toLocaleString()}
                            </span>
                          </td>
                          <td>
                            <button
                              className={`btn ${i === 0 ? 'btn-green' : 'btn-outline'} btn-sm`}
                              onClick={() => {
                                if (window.__setActiveSection) window.__setActiveSection('f-buyers');
                              }}
                            >
                              Connect Buyers →
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* TAB 2: 7-15 DAY PRICE FORECAST */}
      {activeTab === 'forecast' && (
        <>
          {forecastLoading ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔮</div>
              <p style={{ color: 'var(--text2)', fontWeight: 600 }}>Running LSTM &amp; Prophet Time-Series Models...</p>
            </div>
          ) : forecastData && (
            <>
              {/* Decision Alert Card */}
              <div style={{
                background: forecastData.decision === 'HOLD_7D' ? 'linear-gradient(135deg, #FFFDE7, #FFF9C4)' : 'linear-gradient(135deg, #E8F5E9, #C8E6C9)',
                border: `2px solid ${forecastData.decision === 'HOLD_7D' ? '#FBC02D' : '#43A047'}`,
                borderRadius: '16px',
                padding: '1.5rem',
                marginBottom: '1.5rem',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <span style={{
                      background: forecastData.decision === 'HOLD_7D' ? '#F57F17' : '#2E7D32',
                      color: '#fff', padding: '.35rem .9rem', borderRadius: '50px', fontSize: '.8rem', fontWeight: 800
                    }}>
                      {forecastData.decisionBadge}
                    </span>
                    <h2 style={{ margin: '.6rem 0 .3rem', fontFamily: 'var(--font-head)' }}>
                      AI Signal for {commodity}: {forecastData.decisionTitle}
                    </h2>
                    <p style={{ margin: 0, fontSize: '.9rem', color: 'var(--text1)', maxWidth: '650px', lineHeight: 1.5 }}>
                      {forecastData.reason}
                    </p>
                  </div>
                  <div style={{ background: '#fff', padding: '.8rem 1.2rem', borderRadius: '12px', textAlign: 'center', border: '1px solid #e0e0e0' }}>
                    <div style={{ fontSize: '.72rem', color: 'var(--text3)', fontWeight: 700 }}>AI MODEL ACCURACY</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#1B5E20' }}>{forecastData.confidenceScore}%</div>
                    <div style={{ fontSize: '.7rem', color: 'var(--text3)' }}>LSTM + Prophet Ensemble</div>
                  </div>
                </div>
              </div>

              {/* Forecast Time Series Curve Simulation */}
              <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="card-title">📉 Past 7 Days vs Next 15 Days Predicted Price Curve (₹/qtl)</span>
                  <span style={{ fontSize: '.75rem', color: '#1565C0', fontWeight: 700 }}>7–15 Day Forecast Horizon</span>
                </div>

                <div style={{ display: 'flex', gap: '6px', padding: '1.5rem .5rem .5rem', overflowX: 'auto', alignItems: 'flex-end', minHeight: '220px' }}>
                  {/* Past Data */}
                  {forecastData.history.map((h, idx) => (
                    <div key={'h-' + idx} style={{ flex: 1, minWidth: '38px', textAlign: 'center' }}>
                      <div style={{ fontSize: '.65rem', fontWeight: 700, color: '#555', marginBottom: '4px' }}>₹{h.price}</div>
                      <div style={{
                        height: `${Math.max(30, (h.price / 6000) * 140)}px`,
                        background: '#90CAF9',
                        borderRadius: '4px 4px 0 0',
                      }} title={`Historical: ₹${h.price}`} />
                      <div style={{ fontSize: '.6rem', color: 'var(--text3)', marginTop: '4px', whiteSpace: 'nowrap' }}>{h.date}</div>
                    </div>
                  ))}

                  {/* Future Forecasted Data */}
                  {forecastData.forecast.slice(0, 10).map((f, idx) => (
                    <div key={'f-' + idx} style={{ flex: 1, minWidth: '38px', textAlign: 'center' }}>
                      <div style={{ fontSize: '.65rem', fontWeight: 800, color: '#2E7D32', marginBottom: '4px' }}>₹{f.predictedPrice}</div>
                      <div style={{
                        height: `${Math.max(30, (f.predictedPrice / 6000) * 140)}px`,
                        background: 'linear-gradient(to top, #2E7D32, #66BB6A)',
                        borderRadius: '4px 4px 0 0',
                        border: '1px dashed #1B5E20',
                      }} title={`Forecast: ₹${f.predictedPrice} (Range: ₹${f.lowerBound} - ₹${f.upperBound})`} />
                      <div style={{ fontSize: '.6rem', color: '#2E7D32', fontWeight: 700, marginTop: '4px', whiteSpace: 'nowrap' }}>{f.date}</div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '.6rem .8rem 0', fontSize: '.75rem', color: 'var(--text3)', borderTop: '1px solid var(--border)' }}>
                  <span>🔵 Blue: Historical Mandi Prices</span>
                  <span>🟢 Green (Dashed): AI Forecast with Upper &amp; Lower Confidence Interval</span>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* TAB 3: LIVE MANDI DATA FEED */}
      {activeTab === 'mandi' && (
        <>
          {govLoading ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏛️</div>
              <p style={{ color: 'var(--text2)' }}>Fetching live rates from <b>data.gov.in</b>...</p>
            </div>
          ) : (
            <div className="card">
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="card-title">🏛️ Live Agmarknet &amp; data.gov.in Records ({govTotal})</span>
                <button className="btn btn-green btn-sm" onClick={fetchGovData}>🔄 Refresh Feed</button>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table>
                  <thead>
                    <tr>
                      <th>Commodity</th>
                      <th>Market</th>
                      <th>District</th>
                      <th>State</th>
                      <th>Min Price</th>
                      <th>Max Price</th>
                      <th>Modal Price (₹/qtl)</th>
                      <th>Arrival Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {govData.length === 0 ? (
                      <tr><td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text3)' }}>No data records found for current filter.</td></tr>
                    ) : (
                      govData.slice(0, 30).map((r, i) => (
                        <tr key={i}>
                          <td><b>{r.commodity}</b></td>
                          <td>{r.market}</td>
                          <td>{r.district}</td>
                          <td>{r.state}</td>
                          <td>₹{r.min_price}</td>
                          <td>₹{r.max_price}</td>
                          <td style={{ fontFamily: 'var(--font-head)', fontWeight: 800, color: 'var(--primary)' }}>₹{r.modal_price}</td>
                          <td>{r.arrival_date}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}

