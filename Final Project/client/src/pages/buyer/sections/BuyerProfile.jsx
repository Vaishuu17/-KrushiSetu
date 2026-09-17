import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';

export default function BuyerProfile() {
  const { currentBuyer } = useAuth();
  const { t } = useLanguage();
  const b = currentBuyer || {};

  const buyerType = b.buyerType || 'Wholesaler';
  const commissionRate = buyerType === 'Bulk Buyer' ? '1.0%' : buyerType === 'Retailer' ? '2.0%' : '1.5%';

  return (
    <div style={{ maxWidth: '750px', margin: '0 auto' }}>
      <div className="page-header" style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.3rem' }}>
          <span style={{ background: '#E3F2FD', color: '#1565C0', padding: '.25rem .75rem', borderRadius: '50px', fontSize: '.75rem', fontWeight: 800 }}>
            🏢 Verified Business Profile
          </span>
          <span style={{ background: '#E8F5E9', color: '#1B5E20', padding: '.25rem .75rem', borderRadius: '50px', fontSize: '.75rem', fontWeight: 700 }}>
            Escrow Level 1 Trader
          </span>
        </div>
        <h1 style={{ margin: 0, color: '#0D47A1' }}>{t('buyer_profile_title') || 'Buyer Business Profile'}</h1>
        <p style={{ margin: '.25rem 0 0', color: 'var(--text2)' }}>
          Manage your enterprise procurement profile, GST registration, and trading tier.
        </p>
      </div>

      <div className="card" style={{ padding: '1.75rem', background: '#fff', borderRadius: '16px', border: '1px solid #E0E0E0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ width: '84px', height: '84px', borderRadius: '20px', background: 'linear-gradient(135deg,#0D47A1,#1976D2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.4rem', color: '#fff', fontWeight: 800, boxShadow: '0 4px 12px rgba(13,71,161,0.2)' }}>
            {b.name?.charAt(0) || '🏢'}
          </div>
          <div>
            <h2 style={{ margin: '0 0 .3rem', color: '#0D47A1', fontSize: '1.4rem' }}>{b.name}</h2>
            <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
              <span style={{ background: '#E3F2FD', color: '#1565C0', padding: '.25rem .65rem', borderRadius: '50px', fontSize: '.75rem', fontWeight: 700 }}>
                🆔 {b.id || b._id}
              </span>
              <span style={{ background: '#E8F5E9', color: '#1B5E20', padding: '.25rem .65rem', borderRadius: '50px', fontSize: '.75rem', fontWeight: 700 }}>
                ✓ {b.verificationStatus || 'Verified Commercial Entity'}
              </span>
              <span style={{ background: '#FFF3E0', color: '#E65100', padding: '.25rem .65rem', borderRadius: '50px', fontSize: '.75rem', fontWeight: 800 }}>
                🏷️ {buyerType} Tier ({commissionRate} Fee)
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ padding: '1rem', background: '#F8F9FA', borderRadius: '12px', border: '1px solid #ECEFF1' }}>
            <div style={{ fontSize: '.72rem', color: 'var(--text3)', fontWeight: 700, marginBottom: '.25rem' }}>PHONE / CONTACT</div>
            <div style={{ fontWeight: 800, color: '#37474F' }}>📱 {b.phone || '9988776655'}</div>
          </div>

          <div style={{ padding: '1rem', background: '#F8F9FA', borderRadius: '12px', border: '1px solid #ECEFF1' }}>
            <div style={{ fontSize: '.72rem', color: 'var(--text3)', fontWeight: 700, marginBottom: '.25rem' }}>PRIMARY TRADING HUB</div>
            <div style={{ fontWeight: 800, color: '#37474F' }}>📍 {b.loc || 'Vashi APMC, Navi Mumbai'}</div>
          </div>

          <div style={{ padding: '1rem', background: '#F8F9FA', borderRadius: '12px', border: '1px solid #ECEFF1' }}>
            <div style={{ fontSize: '.72rem', color: 'var(--text3)', fontWeight: 700, marginBottom: '.25rem' }}>BUSINESS ENTITY</div>
            <div style={{ fontWeight: 800, color: '#37474F' }}>🏢 {b.businessName || b.name || 'Agri Procurement Ltd.'}</div>
          </div>

          <div style={{ padding: '1rem', background: '#F8F9FA', borderRadius: '12px', border: '1px solid #ECEFF1' }}>
            <div style={{ fontSize: '.72rem', color: 'var(--text3)', fontWeight: 700, marginBottom: '.25rem' }}>GSTIN / TAX IDENTIFIER</div>
            <div style={{ fontWeight: 800, color: '#1565C0', fontFamily: 'monospace' }}>
              {b.gstin || '27AABCR1234F1Z5'}
            </div>
          </div>
        </div>

        {/* Commission Tier Info Card */}
        <div style={{ background: '#F0F7FF', borderRadius: '12px', padding: '1.25rem', border: '1px solid #BBDEFB' }}>
          <h4 style={{ margin: '0 0 .5rem', color: '#0D47A1', fontSize: '.95rem' }}>
            ⚖️ Commission Tier Policy ({buyerType}: {commissionRate})
          </h4>
          <p style={{ margin: 0, fontSize: '.82rem', color: '#455A64', lineHeight: 1.5 }}>
            Platform fee is automatically deducted upon Escrow settlement. 10%–12% of this revenue directly funds our <b>Farmer Welfare Scheme</b> to support drip irrigation, micro-loans, and crop safety across rural clusters.
          </p>
        </div>
      </div>
    </div>
  );
}

