import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import API from '../../../api/axios';

const COMMODITIES = [
  'Tomato', 'Onion', 'Potato', 'Soybean', 'Cotton', 'Wheat',
  'Gram (Chana)', 'Maize', 'Pomegranate', 'Grapes', 'Sugarcane', 'Turmeric', 'Banana'
];

const GRADES = ['Grade A (Export / Super Quality)', 'Grade B (Standard Market)', 'Processing Grade', 'Organic Certified'];

export default function PostRequirement({ toast, onRequirementPosted }) {
  const { currentBuyer } = useAuth();
  const { t } = useLanguage();
  const [commodity, setCommodity] = useState('Tomato');
  const [variety, setVariety] = useState('');
  const [quantity, setQuantity] = useState(50);
  const [unit, setUnit] = useState('Quintals');
  const [targetPrice, setTargetPrice] = useState(2500);
  const [qualityGrade, setQualityGrade] = useState('Grade A (Export / Super Quality)');
  const [deliveryLocation, setDeliveryLocation] = useState(currentBuyer?.loc || 'Vashi APMC, Navi Mumbai');
  const [expectedDate, setExpectedDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Commission preview calculation
  const buyerType = currentBuyer?.buyerType || 'Wholesaler';
  const commissionRate = buyerType === 'Bulk Buyer' ? 0.010 : buyerType === 'Retailer' ? 0.020 : 0.015;
  const subtotal = (Number(quantity) || 0) * (Number(targetPrice) || 0);
  const commissionAmount = Math.round(subtotal * commissionRate);
  const totalBudget = subtotal + commissionAmount;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!commodity || quantity <= 0 || targetPrice <= 0) {
      toast && toast('⚠️ Please provide valid crop, quantity, and target price.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        buyerId: currentBuyer?.id || currentBuyer?._id || 'KB-001',
        buyerName: currentBuyer?.name || 'Agri Buyer',
        buyerType: buyerType,
        buyerPhone: currentBuyer?.phone || '9988776655',
        commodity,
        variety: variety || 'Standard Local',
        quantity: Number(quantity),
        unit,
        targetPrice: Number(targetPrice),
        qualityGrade,
        deliveryLocation,
        expectedDate,
        notes,
      };

      await API.post('/requirements', payload);
      toast && toast('🎉 Requirement posted successfully! Farmers across Maharashtra can now submit direct supply offers.');
      setSubmitting(false);
      if (onRequirementPosted) onRequirementPosted();
      else window.location.hash = '#b-my-reqs';
    } catch (err) {
      setSubmitting(false);
      toast && toast('❌ ' + (err.response?.data?.message || 'Failed to post requirement'));
    }
  };

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto' }}>
      <div className="page-header" style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.3rem' }}>
          <span style={{ background: '#E3F2FD', color: '#1565C0', padding: '.25rem .75rem', borderRadius: '50px', fontSize: '.75rem', fontWeight: 800 }}>
            📋 Buyer Procurement Center
          </span>
          <span style={{ background: '#E8F5E9', color: '#1B5E20', padding: '.25rem .75rem', borderRadius: '50px', fontSize: '.75rem', fontWeight: 700 }}>
            0% Middleman Friction • Direct Farmer Link
          </span>
        </div>
        <h1 style={{ margin: 0, color: '#0D47A1' }}>{t('post_req_title') || 'Post Crop Procurement Requirement'}</h1>
        <p style={{ margin: '.25rem 0 0', color: 'var(--text2)' }}>
          Broadcast your bulk purchase demand directly to verified farmers. Receive price offers &amp; finalize via secure Escrow.
        </p>
      </div>

      <div className="card" style={{ padding: '1.75rem', background: '#fff', borderRadius: '16px', border: '1px solid #E0E0E0', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
        <form onSubmit={handleSubmit}>
          {/* Row 1: Commodity & Variety */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '.85rem', fontWeight: 700, marginBottom: '.4rem', color: '#37474F' }}>
                🌾 Select Crop / Commodity *
              </label>
              <select
                value={commodity}
                onChange={e => setCommodity(e.target.value)}
                style={{ width: '100%', padding: '.7rem .9rem', borderRadius: '10px', border: '1.5px solid #CFD8DC', fontSize: '.9rem', fontWeight: 600, background: '#FAFAFA' }}
              >
                {COMMODITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '.85rem', fontWeight: 700, marginBottom: '.4rem', color: '#37474F' }}>
                🏷️ Specific Variety (Optional)
              </label>
              <input
                type="text"
                value={variety}
                onChange={e => setVariety(e.target.value)}
                placeholder="e.g. Vaishali, Hybrid 1022, Lokwan"
                style={{ width: '100%', padding: '.7rem .9rem', borderRadius: '10px', border: '1.5px solid #CFD8DC', fontSize: '.9rem', background: '#FAFAFA' }}
              />
            </div>
          </div>

          {/* Row 2: Quantity & Target Price */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '.85rem', fontWeight: 700, marginBottom: '.4rem', color: '#37474F' }}>
                📦 Required Quantity *
              </label>
              <div style={{ display: 'flex', gap: '.5rem' }}>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={e => setQuantity(e.target.value)}
                  style={{ flex: 1, padding: '.7rem .9rem', borderRadius: '10px', border: '1.5px solid #CFD8DC', fontSize: '.9rem', fontWeight: 700, background: '#FAFAFA' }}
                />
                <select
                  value={unit}
                  onChange={e => setUnit(e.target.value)}
                  style={{ width: '110px', padding: '.7rem .5rem', borderRadius: '10px', border: '1.5px solid #CFD8DC', fontSize: '.85rem', fontWeight: 600, background: '#FAFAFA' }}
                >
                  <option value="Quintals">Quintals</option>
                  <option value="Metric Tons">Tons</option>
                  <option value="Kgs">Kgs</option>
                  <option value="Crates">Crates</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '.85rem', fontWeight: 700, marginBottom: '.4rem', color: '#37474F' }}>
                💰 Target Price (₹/Quintal) *
              </label>
              <input
                type="number"
                min="100"
                value={targetPrice}
                onChange={e => setTargetPrice(e.target.value)}
                placeholder="₹ Target rate"
                style={{ width: '100%', padding: '.7rem .9rem', borderRadius: '10px', border: '1.5px solid #CFD8DC', fontSize: '.9rem', fontWeight: 700, color: '#1565C0', background: '#FAFAFA' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '.85rem', fontWeight: 700, marginBottom: '.4rem', color: '#37474F' }}>
                🎖️ Quality Grade Standard
              </label>
              <select
                value={qualityGrade}
                onChange={e => setQualityGrade(e.target.value)}
                style={{ width: '100%', padding: '.7rem .9rem', borderRadius: '10px', border: '1.5px solid #CFD8DC', fontSize: '.85rem', fontWeight: 600, background: '#FAFAFA' }}
              >
                {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          </div>

          {/* Row 3: Delivery Location & Expected Date */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '.85rem', fontWeight: 700, marginBottom: '.4rem', color: '#37474F' }}>
                📍 Delivery Destination / Warehouse Hub *
              </label>
              <input
                type="text"
                value={deliveryLocation}
                onChange={e => setDeliveryLocation(e.target.value)}
                placeholder="e.g. Vashi APMC Yard 4, Navi Mumbai"
                style={{ width: '100%', padding: '.7rem .9rem', borderRadius: '10px', border: '1.5px solid #CFD8DC', fontSize: '.9rem', background: '#FAFAFA' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '.85rem', fontWeight: 700, marginBottom: '.4rem', color: '#37474F' }}>
                📅 Target Delivery Date *
              </label>
              <input
                type="date"
                value={expectedDate}
                onChange={e => setExpectedDate(e.target.value)}
                style={{ width: '100%', padding: '.7rem .9rem', borderRadius: '10px', border: '1.5px solid #CFD8DC', fontSize: '.9rem', fontWeight: 600, background: '#FAFAFA' }}
              />
            </div>
          </div>

          {/* Row 4: Notes / Instructions */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '.85rem', fontWeight: 700, marginBottom: '.4rem', color: '#37474F' }}>
              📝 Packaging &amp; Special Handling Requirements
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. 50kg gunny bags, moisture level below 12%, farm-gate inspection before loading required..."
              style={{ width: '100%', padding: '.7rem .9rem', borderRadius: '10px', border: '1.5px solid #CFD8DC', fontSize: '.85rem', background: '#FAFAFA' }}
            />
          </div>

          {/* Transparent Commission & Budget Breakdown Card */}
          <div style={{ background: 'linear-gradient(135deg, #F0F4F8, #E3F2FD)', borderRadius: '12px', padding: '1.25rem', border: '1px solid #BBDEFB', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.75rem' }}>
              <span style={{ fontWeight: 800, color: '#0D47A1', fontSize: '.9rem' }}>
                💡 Procurement Cost &amp; Platform Fee Estimation
              </span>
              <span style={{ fontSize: '.75rem', background: '#1565C0', color: '#fff', padding: '.2rem .6rem', borderRadius: '50px', fontWeight: 700 }}>
                {buyerType} Tier ({(commissionRate * 100).toFixed(1)}%)
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', fontSize: '.85rem' }}>
              <div>
                <div style={{ color: 'var(--text2)', fontSize: '.75rem' }}>Produce Subtotal ({quantity} qtl × ₹{targetPrice})</div>
                <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#37474F' }}>₹{subtotal.toLocaleString()}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text2)', fontSize: '.75rem' }}>Buyer Platform Fee ({(commissionRate * 100).toFixed(1)}%)</div>
                <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#1565C0' }}>+ ₹{commissionAmount.toLocaleString()}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text2)', fontSize: '.75rem' }}>Estimated Total Procurement Budget</div>
                <div style={{ fontWeight: 900, fontSize: '1.15rem', color: '#1B5E20' }}>₹{totalBudget.toLocaleString()}</div>
              </div>
            </div>
            <div style={{ fontSize: '.72rem', color: '#546E7A', marginTop: '.5rem' }}>
              * Platform fee supports 100% Escrow security, quality verification, and 10%–12% contribution to the Farmer Welfare Fund.
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => window.location.hash = '#b-overview'}
              className="btn btn-outline"
              style={{ padding: '.75rem 1.5rem', fontWeight: 600 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary"
              style={{ padding: '.75rem 2rem', fontWeight: 800, background: 'linear-gradient(135deg, #1565C0, #0D47A1)', border: 'none' }}
            >
              {submitting ? 'Posting...' : '📢 Publish Requirement to Farmers'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
