import { useState, useEffect } from 'react';
import API from '../../../api/axios';

export default function CommissionsAdmin({ toast }) {
  const [rates, setRates] = useState({
    bulkBuyer: 1.0,
    wholesaler: 1.5,
    retailer: 2.0,
    institutionalBuyer: 1.5,
    farmerFirstOrder: 0.0,
    farmerStandard: 2.0,
    welfareContributionPct: 12.0,
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Simulator State
  const [simSubtotal, setSimSubtotal] = useState(100000);
  const [simBuyerType, setSimBuyerType] = useState('Wholesaler');
  const [simIsFirstOrder, setSimIsFirstOrder] = useState(false);

  const fetchConfig = () => {
    setLoading(true);
    API.get('/config')
      .then(res => {
        if (res.data?.rates) {
          setRates(res.data.rates);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleRateChange = (key, val) => {
    setRates(prev => ({ ...prev, [key]: Number(val) }));
  };

  const handleSaveRates = async () => {
    setSaving(true);
    try {
      await API.put('/config/rates', rates);
      toast && toast('✅ Commission rates successfully updated across the platform!');
      setSaving(false);
      fetchConfig();
    } catch {
      setSaving(false);
      toast && toast('❌ Failed to update commission rates');
    }
  };

  // Simulator Calculations
  const buyerFeePct = simBuyerType === 'Bulk Buyer' ? rates.bulkBuyer
    : simBuyerType === 'Retailer' ? rates.retailer
    : simBuyerType === 'Institutional Buyer' ? rates.institutionalBuyer
    : rates.wholesaler;

  const farmerFeePct = simIsFirstOrder ? rates.farmerFirstOrder : rates.farmerStandard;
  const simBuyerFee = Math.round(simSubtotal * (buyerFeePct / 100));
  const simFarmerFee = Math.round(simSubtotal * (farmerFeePct / 100));
  const simBuyerTotalPayable = simSubtotal + simBuyerFee;
  const simFarmerNet = simSubtotal - simFarmerFee;
  const simPlatformRevenue = simBuyerFee + simFarmerFee;
  const simWelfareEarmark = Math.round(simPlatformRevenue * (rates.welfareContributionPct / 100));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.3rem' }}>
            <span style={{ background: '#E8F5E9', color: '#1B5E20', padding: '.25rem .75rem', borderRadius: '50px', fontSize: '.75rem', fontWeight: 800 }}>
              ⚙️ Platform Pricing Engine
            </span>
            <span style={{ background: '#E3F2FD', color: '#1565C0', padding: '.25rem .75rem', borderRadius: '50px', fontSize: '.75rem', fontWeight: 700 }}>
              Dynamic Rate Control
            </span>
          </div>
          <h1 style={{ margin: 0, color: '#1B5E20' }}>Commission Rate Configuration &amp; Deal Simulator</h1>
          <p style={{ margin: '.25rem 0 0', color: 'var(--text2)' }}>
            Configure platform fees across buyer tiers and farmer tiers, and test real deal simulations.
          </p>
        </div>

        <button
          disabled={saving}
          onClick={handleSaveRates}
          className="btn btn-primary"
          style={{ background: 'linear-gradient(135deg, #1B5E20, #2E7D32)', border: 'none', fontWeight: 800, padding: '.65rem 1.5rem', borderRadius: '10px' }}
        >
          {saving ? 'Saving...' : '💾 Save All Commission Rates'}
        </button>
      </div>

      {/* Rate Configuration Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Buyer Rates Card */}
        <div className="card" style={{ padding: '1.5rem', background: '#fff', borderRadius: '16px', border: '1px solid #E0E0E0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '1.4rem' }}>🏢</span>
            <div>
              <h3 style={{ margin: 0, color: '#0D47A1', fontSize: '1.1rem' }}>Buyer Commission Rates</h3>
              <p style={{ margin: 0, fontSize: '.78rem', color: 'var(--text2)' }}>Categorized by procurement volume and frequency</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8F9FA', padding: '.75rem 1rem', borderRadius: '10px' }}>
              <div>
                <b style={{ color: '#37474F' }}>Bulk Buyer Fee</b>
                <div style={{ fontSize: '.75rem', color: 'var(--text2)' }}>High volume industrial procurement</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.3rem' }}>
                <input
                  type="number"
                  step="0.1"
                  min="0.5"
                  max="10"
                  value={rates.bulkBuyer}
                  onChange={e => handleRateChange('bulkBuyer', e.target.value)}
                  style={{ width: '70px', padding: '.4rem', borderRadius: '6px', border: '1px solid #B0BEC5', textAlign: 'right', fontWeight: 800 }}
                />
                <span style={{ fontWeight: 800, color: '#1565C0' }}>%</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8F9FA', padding: '.75rem 1rem', borderRadius: '10px' }}>
              <div>
                <b style={{ color: '#37474F' }}>Wholesaler Fee</b>
                <div style={{ fontSize: '.75rem', color: 'var(--text2)' }}>Regional APMC mandi wholesalers</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.3rem' }}>
                <input
                  type="number"
                  step="0.1"
                  min="0.5"
                  max="10"
                  value={rates.wholesaler}
                  onChange={e => handleRateChange('wholesaler', e.target.value)}
                  style={{ width: '70px', padding: '.4rem', borderRadius: '6px', border: '1px solid #B0BEC5', textAlign: 'right', fontWeight: 800 }}
                />
                <span style={{ fontWeight: 800, color: '#1565C0' }}>%</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8F9FA', padding: '.75rem 1rem', borderRadius: '10px' }}>
              <div>
                <b style={{ color: '#37474F' }}>Retailer Fee</b>
                <div style={{ fontSize: '.75rem', color: 'var(--text2)' }}>Local retail grocers &amp; aggregators</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.3rem' }}>
                <input
                  type="number"
                  step="0.1"
                  min="0.5"
                  max="10"
                  value={rates.retailer}
                  onChange={e => handleRateChange('retailer', e.target.value)}
                  style={{ width: '70px', padding: '.4rem', borderRadius: '6px', border: '1px solid #B0BEC5', textAlign: 'right', fontWeight: 800 }}
                />
                <span style={{ fontWeight: 800, color: '#1565C0' }}>%</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8F9FA', padding: '.75rem 1rem', borderRadius: '10px' }}>
              <div>
                <b style={{ color: '#37474F' }}>Institutional Buyer Fee</b>
                <div style={{ fontSize: '.75rem', color: 'var(--text2)' }}>Food processors, exporters, &amp; government bodies</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.3rem' }}>
                <input
                  type="number"
                  step="0.1"
                  min="0.5"
                  max="10"
                  value={rates.institutionalBuyer}
                  onChange={e => handleRateChange('institutionalBuyer', e.target.value)}
                  style={{ width: '70px', padding: '.4rem', borderRadius: '6px', border: '1px solid #B0BEC5', textAlign: 'right', fontWeight: 800 }}
                />
                <span style={{ fontWeight: 800, color: '#1565C0' }}>%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Farmer Rates Card */}
        <div className="card" style={{ padding: '1.5rem', background: '#fff', borderRadius: '16px', border: '1px solid #E0E0E0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '1.4rem' }}>👨‍🌾</span>
            <div>
              <h3 style={{ margin: 0, color: '#1B5E20', fontSize: '1.1rem' }}>Farmer Commission &amp; Welfare</h3>
              <p style={{ margin: 0, fontSize: '.78rem', color: 'var(--text2)' }}>Incentive structure and rural social impact</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#E8F5E9', padding: '.75rem 1rem', borderRadius: '10px', border: '1px solid #C8E6C9' }}>
              <div>
                <b style={{ color: '#1B5E20' }}>Farmer 1st Order Incentive</b>
                <div style={{ fontSize: '.75rem', color: '#2E7D32' }}>Zero-friction trial order policy</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.3rem' }}>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={rates.farmerFirstOrder}
                  onChange={e => handleRateChange('farmerFirstOrder', e.target.value)}
                  style={{ width: '70px', padding: '.4rem', borderRadius: '6px', border: '1px solid #A5D6A7', textAlign: 'right', fontWeight: 800, color: '#1B5E20' }}
                />
                <span style={{ fontWeight: 800, color: '#1B5E20' }}>%</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8F9FA', padding: '.75rem 1rem', borderRadius: '10px' }}>
              <div>
                <b style={{ color: '#37474F' }}>Farmer Standard Order Fee</b>
                <div style={{ fontSize: '.75rem', color: 'var(--text2)' }}>For 2nd and subsequent orders</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.3rem' }}>
                <input
                  type="number"
                  step="0.1"
                  min="0.5"
                  max="10"
                  value={rates.farmerStandard}
                  onChange={e => handleRateChange('farmerStandard', e.target.value)}
                  style={{ width: '70px', padding: '.4rem', borderRadius: '6px', border: '1px solid #B0BEC5', textAlign: 'right', fontWeight: 800 }}
                />
                <span style={{ fontWeight: 800, color: '#1565C0' }}>%</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FFF3E0', padding: '.75rem 1rem', borderRadius: '10px', border: '1px solid #FFE0B2' }}>
              <div>
                <b style={{ color: '#E65100' }}>Welfare Fund Earmark Rate</b>
                <div style={{ fontSize: '.75rem', color: '#BF360C' }}>% of Platform revenue dedicated to welfare</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.3rem' }}>
                <input
                  type="number"
                  step="0.5"
                  min="5"
                  max="20"
                  value={rates.welfareContributionPct}
                  onChange={e => handleRateChange('welfareContributionPct', e.target.value)}
                  style={{ width: '70px', padding: '.4rem', borderRadius: '6px', border: '1px solid #FFCC80', textAlign: 'right', fontWeight: 800, color: '#E65100' }}
                />
                <span style={{ fontWeight: 800, color: '#E65100' }}>%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Deal Simulator */}
      <div className="card" style={{ padding: '1.75rem', background: '#FAFBFD', borderRadius: '16px', border: '2px solid #BBDEFB' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', marginBottom: '1.25rem' }}>
          <span style={{ fontSize: '1.5rem' }}>🧮</span>
          <div>
            <h3 style={{ margin: 0, color: '#0D47A1', fontSize: '1.2rem' }}>Interactive Deal Simulator</h3>
            <p style={{ margin: 0, fontSize: '.82rem', color: 'var(--text2)' }}>
              Simulate exact cashflows, fee deductions, and payouts for any prospective transaction.
            </p>
          </div>
        </div>

        {/* Simulator Controls */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '.85rem', fontWeight: 700, marginBottom: '.4rem', color: '#37474F' }}>
              💰 Deal Produce Subtotal (₹)
            </label>
            <input
              type="number"
              step="5000"
              min="1000"
              value={simSubtotal}
              onChange={e => setSimSubtotal(Number(e.target.value) || 0)}
              style={{ width: '100%', padding: '.65rem .85rem', borderRadius: '10px', border: '1.5px solid #90CAF9', fontSize: '1rem', fontWeight: 800, color: '#0D47A1', background: '#fff' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '.85rem', fontWeight: 700, marginBottom: '.4rem', color: '#37474F' }}>
              🏢 Buyer Type
            </label>
            <select
              value={simBuyerType}
              onChange={e => setSimBuyerType(e.target.value)}
              style={{ width: '100%', padding: '.65rem .85rem', borderRadius: '10px', border: '1.5px solid #90CAF9', fontSize: '.9rem', fontWeight: 700, background: '#fff' }}
            >
              <option value="Bulk Buyer">Bulk Buyer ({rates.bulkBuyer}%)</option>
              <option value="Wholesaler">Wholesaler ({rates.wholesaler}%)</option>
              <option value="Retailer">Retailer ({rates.retailer}%)</option>
              <option value="Institutional Buyer">Institutional Buyer ({rates.institutionalBuyer}%)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '.85rem', fontWeight: 700, marginBottom: '.4rem', color: '#37474F' }}>
              🌾 Farmer Order Sequence
            </label>
            <select
              value={simIsFirstOrder ? 'first' : 'subsequent'}
              onChange={e => setSimIsFirstOrder(e.target.value === 'first')}
              style={{ width: '100%', padding: '.65rem .85rem', borderRadius: '10px', border: '1.5px solid #90CAF9', fontSize: '.9rem', fontWeight: 700, background: '#fff' }}
            >
              <option value="first">🌟 Farmer's 1st Order (0% Free)</option>
              <option value="subsequent">Standard Order ({rates.farmerStandard}%)</option>
            </select>
          </div>
        </div>

        {/* Simulator Outputs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', background: '#fff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #E0E0E0' }}>
          <div>
            <div style={{ fontSize: '.75rem', color: 'var(--text3)', fontWeight: 700 }}>BUYER PAYS</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0D47A1' }}>₹{simBuyerTotalPayable.toLocaleString()}</div>
            <div style={{ fontSize: '.72rem', color: '#1565C0' }}>Subtotal + ₹{simBuyerFee.toLocaleString()} ({buyerFeePct}%)</div>
          </div>

          <div>
            <div style={{ fontSize: '.75rem', color: 'var(--text3)', fontWeight: 700 }}>FARMER RECEIVES</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#2E7D32' }}>₹{simFarmerNet.toLocaleString()}</div>
            <div style={{ fontSize: '.72rem', color: simFarmerFee === 0 ? '#2E7D32' : '#E65100' }}>
              {simFarmerFee === 0 ? '✓ 0% Fee (100% In-Hand)' : `− ₹${simFarmerFee.toLocaleString()} (${farmerFeePct}%)`}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '.75rem', color: 'var(--text3)', fontWeight: 700 }}>PLATFORM COMMISSION</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#1B5E20' }}>₹{simPlatformRevenue.toLocaleString()}</div>
            <div style={{ fontSize: '.72rem', color: 'var(--text2)' }}>Buyer fee + Farmer fee</div>
          </div>

          <div>
            <div style={{ fontSize: '.75rem', color: 'var(--text3)', fontWeight: 700 }}>WELFARE FUND ALLOCATION</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#E65100' }}>₹{simWelfareEarmark.toLocaleString()}</div>
            <div style={{ fontSize: '.72rem', color: '#E65100' }}>{rates.welfareContributionPct}% of platform cut</div>
          </div>
        </div>
      </div>
    </div>
  );
}
