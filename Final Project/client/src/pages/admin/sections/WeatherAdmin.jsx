import { useState, useEffect } from 'react';
import API from '../../../api/axios';

const CITIES = [
  'Nashik', 'Pune', 'Nagpur', 'Solapur', 'Aurangabad',
  'Kolhapur', 'Latur', 'Akola', 'Amravati', 'Jalgaon'
];

const WEATHER_CONDITIONS = [
  '☀️ Clear Sky', '⛅ Partly Cloudy', '🌥️ Overcast',
  '🌧️ Light Rain', '⛈️ Thunderstorm', '🌩️ Heavy Rain',
  '🌫️ Foggy', '💨 Windy'
];

const getConditionColor = (cond = '') => {
  if (cond.includes('Rain') || cond.includes('Storm')) return { bg: '#E3F2FD', text: '#1565C0' };
  if (cond.includes('Clear')) return { bg: '#FFF9C4', text: '#F57F17' };
  if (cond.includes('Foggy')) return { bg: '#ECEFF1', text: '#546E7A' };
  return { bg: '#E8F5E9', text: '#2E7D32' };
};

const getAgriAdvisory = (temp, rain, cond = '') => {
  if (cond.includes('Rain') || cond.includes('Storm')) return '⚠️ Postpone spraying & harvesting. Risk of fungal diseases. Ensure drainage.';
  if (temp > 38) return '🌡️ High heat stress. Irrigate early morning. Cover seedlings. Check soil moisture.';
  if (temp < 15) return '🥶 Cold stress risk. Avoid transplanting. Use frost nets for sensitive crops.';
  if (rain > 10) return '💧 Good soil moisture. Ideal for sowing. Monitor waterlogging in low-lying fields.';
  return '✅ Favorable conditions. Suitable for field operations, spraying, and harvest.';
};

export default function WeatherAdmin({ toast }) {
  const [selectedCity, setSelectedCity] = useState('Nashik');
  const [weatherData, setWeatherData] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ temp: 28, humid: 72, wind: 12, rain: 3, cond: '⛅ Partly Cloudy', adv: '' });
  const [loading, setLoading] = useState(true);
  const [allCityData, setAllCityData] = useState([]);

  useEffect(() => {
    // Load current city weather
    setLoading(true);
    API.get('/weather?city=' + encodeURIComponent(selectedCity))
      .then(r => {
        const d = r.data || {};
        setForm({ temp: d.temp || 28, humid: d.humid || 72, wind: d.wind || 12, rain: d.rain || 0, cond: d.cond || '⛅ Partly Cloudy', adv: d.adv || '' });
        setWeatherData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    // Simulate multi-city data
    const mockCities = CITIES.map((c, i) => ({
      city: c,
      temp: 24 + Math.floor(Math.random() * 14),
      humid: 50 + Math.floor(Math.random() * 40),
      rain: Math.floor(Math.random() * 15),
      cond: WEATHER_CONDITIONS[i % WEATHER_CONDITIONS.length],
    }));
    setAllCityData(mockCities);
  }, [selectedCity]);

  const save = async () => {
    try {
      const advisory = form.adv || getAgriAdvisory(form.temp, form.rain, form.cond);
      await API.put('/weather', { ...form, city: selectedCity, adv: advisory });
      toast(`✅ Weather for ${selectedCity} updated`);
      setEditMode(false);
      setWeatherData({ ...form, adv: advisory });
    } catch { toast('❌ Error updating weather data'); }
  };

  const condStyle = getConditionColor(form.cond);

  return (
    <>
      <div className="page-header" style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.3rem' }}>
          <span style={{ background: '#E3F2FD', color: '#1565C0', padding: '.25rem .75rem', borderRadius: '50px', fontSize: '.75rem', fontWeight: 800 }}>
            🌤️ Weather Intelligence Radar
          </span>
        </div>
        <h1 style={{ margin: 0 }}>Weather & Agriculture Advisory</h1>
        <p style={{ color: 'var(--text2)', marginTop: '.25rem' }}>Monitor real-time weather across Maharashtra districts and push farming advisories to registered farmers</p>
      </div>

      {/* City Selector */}
      <div style={{ display: 'flex', gap: '.5rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '.84rem', fontWeight: 700, color: 'var(--text2)' }}>Select District:</span>
        {CITIES.map(c => (
          <button
            key={c}
            onClick={() => setSelectedCity(c)}
            style={{
              padding: '.35rem .75rem', borderRadius: '50px', fontSize: '.78rem', fontWeight: 700, cursor: 'pointer', border: 'none',
              background: selectedCity === c ? '#1565C0' : '#F5F7FA',
              color: selectedCity === c ? '#fff' : 'var(--text2)',
              transition: 'all .2s'
            }}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Current City Detail Card */}
      {loading ? (
        <div className="empty-state"><div className="e-icon">⏳</div><p>Loading weather data...</p></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
          {/* Left: Weather Card */}
          <div className="card" style={{ borderLeft: `4px solid ${condStyle.text}`, background: condStyle.bg }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: condStyle.text }}>📍 {selectedCity}</div>
                <div style={{ fontSize: '.8rem', color: 'var(--text2)' }}>Maharashtra, India</div>
              </div>
              <span style={{ fontSize: '.75rem', background: '#fff', color: condStyle.text, padding: '.2rem .6rem', borderRadius: '50px', fontWeight: 700, border: `1px solid ${condStyle.text}40` }}>
                {form.cond}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ textAlign: 'center', background: '#fff', padding: '1rem', borderRadius: '10px' }}>
                <div style={{ fontSize: '2rem' }}>🌡️</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: form.temp > 35 ? '#C62828' : '#1B5E20' }}>{form.temp}°C</div>
                <div style={{ fontSize: '.72rem', color: 'var(--text3)' }}>Temperature</div>
              </div>
              <div style={{ textAlign: 'center', background: '#fff', padding: '1rem', borderRadius: '10px' }}>
                <div style={{ fontSize: '2rem' }}>💧</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#1565C0' }}>{form.humid}%</div>
                <div style={{ fontSize: '.72rem', color: 'var(--text3)' }}>Humidity</div>
              </div>
              <div style={{ textAlign: 'center', background: '#fff', padding: '1rem', borderRadius: '10px' }}>
                <div style={{ fontSize: '2rem' }}>💨</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#37474F' }}>{form.wind}</div>
                <div style={{ fontSize: '.72rem', color: 'var(--text3)' }}>Wind (km/h)</div>
              </div>
              <div style={{ textAlign: 'center', background: '#fff', padding: '1rem', borderRadius: '10px' }}>
                <div style={{ fontSize: '2rem' }}>🌧️</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#1976D2' }}>{form.rain}mm</div>
                <div style={{ fontSize: '.72rem', color: 'var(--text3)' }}>Rainfall</div>
              </div>
            </div>
          </div>

          {/* Right: Advisory + Edit */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="card" style={{ border: '2px solid #FDD835', background: '#FFFDE7' }}>
              <div style={{ fontWeight: 800, color: '#F57F17', marginBottom: '.5rem' }}>🌾 Farming Advisory — {selectedCity}</div>
              <div style={{ fontSize: '.88rem', lineHeight: 1.6, color: '#E65100' }}>
                {form.adv || getAgriAdvisory(form.temp, form.rain, form.cond)}
              </div>
            </div>

            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.75rem' }}>
                <span style={{ fontWeight: 800 }}>⚙️ Update Weather Data</span>
                <button className={`btn btn-sm ${editMode ? 'btn-outline' : 'btn-green'}`} onClick={() => setEditMode(!editMode)}>
                  {editMode ? '✕ Cancel' : '✏️ Edit'}
                </button>
              </div>
              {editMode && (
                <>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Temp (°C)</label>
                      <input value={form.temp} onChange={e => setForm({ ...form, temp: Number(e.target.value) })} type="number" />
                    </div>
                    <div className="form-group">
                      <label>Humidity (%)</label>
                      <input value={form.humid} onChange={e => setForm({ ...form, humid: Number(e.target.value) })} type="number" />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Wind (km/h)</label>
                      <input value={form.wind} onChange={e => setForm({ ...form, wind: Number(e.target.value) })} type="number" />
                    </div>
                    <div className="form-group">
                      <label>Rainfall (mm)</label>
                      <input value={form.rain} onChange={e => setForm({ ...form, rain: Number(e.target.value) })} type="number" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Condition</label>
                    <select value={form.cond} onChange={e => setForm({ ...form, cond: e.target.value })}>
                      {WEATHER_CONDITIONS.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Custom Advisory (leave blank for auto)</label>
                    <textarea value={form.adv} onChange={e => setForm({ ...form, adv: e.target.value })} rows="2" placeholder="Auto-generated if left blank..." />
                  </div>
                  <button className="btn btn-green" onClick={save} style={{ width: '100%' }}>
                    📡 Push Weather Update
                  </button>
                </>
              )}
              {!editMode && (
                <div style={{ fontSize: '.82rem', color: 'var(--text3)' }}>
                  Click Edit to update weather data for {selectedCity}. Changes will reflect in all farmer dashboards instantly.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Multi-City Overview Table */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">🗺️ Maharashtra Districts — Weather Overview</span>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.84rem' }}>
          <thead>
            <tr style={{ background: '#F5F7FA' }}>
              {['District', 'Temperature', 'Humidity', 'Rainfall', 'Condition', 'Farming Signal'].map(h => (
                <th key={h} style={{ padding: '.55rem 1rem', textAlign: 'left', fontWeight: 700, color: 'var(--text2)', borderBottom: '1px solid var(--border)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allCityData.map((c, i) => {
              const advisory = getAgriAdvisory(c.temp, c.rain, c.cond);
              const isGood = advisory.startsWith('✅');
              return (
                <tr key={i}
                  style={{ borderBottom: '1px solid #F0F0F0', cursor: 'pointer', background: selectedCity === c.city ? '#E3F2FD' : 'transparent' }}
                  onClick={() => setSelectedCity(c.city)}
                >
                  <td style={{ padding: '.55rem 1rem', fontWeight: 700 }}>📍 {c.city}</td>
                  <td style={{ padding: '.55rem 1rem', fontWeight: 700, color: c.temp > 35 ? '#C62828' : '#1B5E20' }}>{c.temp}°C</td>
                  <td style={{ padding: '.55rem 1rem', color: '#1565C0' }}>{c.humid}%</td>
                  <td style={{ padding: '.55rem 1rem' }}>{c.rain} mm</td>
                  <td style={{ padding: '.55rem 1rem' }}>{c.cond}</td>
                  <td style={{ padding: '.55rem 1rem' }}>
                    <span style={{
                      fontSize: '.72rem', padding: '.15rem .5rem', borderRadius: '50px', fontWeight: 700,
                      background: isGood ? '#E8F5E9' : '#FFF3E0',
                      color: isGood ? '#1B5E20' : '#E65100'
                    }}>
                      {isGood ? '✅ Favorable' : '⚠️ Caution'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div style={{ padding: '.5rem 1rem', fontSize: '.72rem', color: 'var(--text3)' }}>
          * Click any district row to view and edit details • Data simulated for demo; integrate with IMD API for live data
        </div>
      </div>
    </>
  );
}
