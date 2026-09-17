import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import API from '../../../api/axios';

const ALL_CROPS = [
  'Tomato (टमाटर)', 'Wheat (गेहूं)', 'Onion (प्याज)', 'Rice (धान)', 'Soybean (सोयाबीन)',
  'Cotton (कपास)', 'Potato (आलू)', 'Maize (मक्का)', 'Sugarcane (गन्ना)', 'Banana (केला)',
  'Mango (आम)', 'Grapes (अंगूर)', 'Chili (मिर्च)', 'Turmeric (हल्दी)', 'Groundnut (मूंगफली)',
  'Mustard (सरसों)', 'Chana / Chickpea (चना)', 'Arhar / Tur Dal (अरहर)', 'Moong Dal (मूंग)',
  'Urad Dal (उड़द)', 'Bajra (बाजरा)', 'Jowar (ज्वार)', 'Orange (संतरा)', 'Pomegranate (अनार)',
  'Garlic (लहसुन)', 'Ginger (अदरक)', 'Coconut (नारियल)'
];

const SEASONS = ['Kharif (Monsoon)', 'Rabi (Winter)', 'Zaid (Summer)', 'Perennial (Year-round)'];

export default function Profile({ toast }) {
  const { currentFarmer, loginFarmer } = useAuth();
  const f = currentFarmer || {};

  const [editingProfile, setEditingProfile] = useState(false);
  const [saving, setSaving] = useState(false);

  // Profile fields
  const [profileForm, setProfileForm] = useState({
    name: f.name || '',
    phone: f.phone || '',
    land: f.land || '',
    income: f.income || '',
    state: f.loc?.split(',')[1]?.trim() || f.state || 'Maharashtra',
    district: f.loc?.split(',')[0]?.trim() || f.district || 'Nashik',
    bankUpi: f.bankUpi || 'kisan@okaxis',
    accountNo: f.accountNo || 'XXXX-XXXX-4819',
    ifsc: f.ifsc || 'SBIN0004120',
  });

  // Multi-crop list state
  const defaultCrops = (f.crops && f.crops.length > 0) ? f.crops : [
    {
      id: 'crop-1',
      name: f.crop || 'Tomato (टमाटर)',
      season: 'Kharif (Monsoon)',
      acreage: f.land || 3.5,
      expectedYield: 70,
      sowingMonth: 'June',
      status: 'Active'
    }
  ];

  const [cropList, setCropList] = useState(defaultCrops);
  const [activeCropName, setActiveCropName] = useState(f.crop || defaultCrops[0]?.name || 'Tomato (टमाटर)');

  // Modal for Add / Edit Crop
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropModalIndex, setCropModalIndex] = useState(null); // null = add new, number = editing
  const [cropForm, setCropForm] = useState({
    name: 'Tomato (टमाटर)',
    season: 'Kharif (Monsoon)',
    acreage: 2,
    expectedYield: 50,
    sowingMonth: 'June',
  });

  const saveFarmerData = async (updatedCrops, newActiveCrop, updatedProfile) => {
    setSaving(true);
    try {
      const activeName = newActiveCrop || activeCropName;
      const cleanCropName = activeName.split('(')[0].trim();
      const p = updatedProfile || profileForm;
      const payload = {
        name: p.name,
        phone: p.phone,
        land: Number(p.land),
        income: Number(p.income),
        state: p.state,
        district: p.district,
        loc: `${p.district}, ${p.state}`,
        crop: cleanCropName,
        crops: updatedCrops || cropList,
        bankUpi: p.bankUpi,
        accountNo: p.accountNo,
        ifsc: p.ifsc,
      };

      const { data } = await API.put(`/farmers/${f.id || f._id}`, payload);
      loginFarmer(data, localStorage.getItem('km_token'));
      toast && toast('✅ Farm profile & multi-crops saved successfully!');
      setEditingProfile(false);
    } catch (e) {
      toast && toast('❌ ' + (e.response?.data?.message || 'Update failed'));
    }
    setSaving(false);
  };

  const handleSetActiveCrop = async (cropItem) => {
    setActiveCropName(cropItem.name);
    const updated = cropList.map(c => ({
      ...c,
      status: c.name === cropItem.name ? 'Active' : 'Standby'
    }));
    setCropList(updated);
    await saveFarmerData(updated, cropItem.name);
    toast && toast(`🎯 Active Farm Focus switched to ${cropItem.name}!`);
  };

  const openAddCrop = () => {
    setCropModalIndex(null);
    setCropForm({
      name: 'Wheat (गेहूं)',
      season: 'Rabi (Winter)',
      acreage: 2,
      expectedYield: 40,
      sowingMonth: 'November',
    });
    setShowCropModal(true);
  };

  const openEditCrop = (index) => {
    setCropModalIndex(index);
    setCropForm({ ...cropList[index] });
    setShowCropModal(true);
  };

  const handleSaveCropModal = async () => {
    if (!cropForm.name || !cropForm.acreage) {
      toast && toast('❌ Please provide crop name and acreage');
      return;
    }
    let updated;
    if (cropModalIndex !== null) {
      updated = [...cropList];
      updated[cropModalIndex] = { ...cropForm, id: cropList[cropModalIndex].id || `crop-${Date.now()}` };
    } else {
      const isFirst = cropList.length === 0;
      updated = [
        ...cropList,
        {
          ...cropForm,
          id: `crop-${Date.now()}`,
          status: isFirst ? 'Active' : 'Standby'
        }
      ];
    }
    setCropList(updated);
    setShowCropModal(false);
    await saveFarmerData(updated, cropModalIndex === null && cropList.length === 0 ? cropForm.name : activeCropName);
  };

  const handleDeleteCrop = async (index) => {
    if (cropList.length <= 1) {
      toast && toast('⚠️ You must keep at least one registered crop');
      return;
    }
    const cropToDelete = cropList[index];
    const updated = cropList.filter((_, i) => i !== index);
    setCropList(updated);
    let newActive = activeCropName;
    if (cropToDelete.name === activeCropName) {
      newActive = updated[0]?.name;
      setActiveCropName(newActive);
    }
    await saveFarmerData(updated, newActive);
    toast && toast('🗑️ Crop removed from your farm profile');
  };

  return (
    <>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.3rem' }}>
            <span style={{ background: '#E8F5E9', color: '#2E7D32', padding: '.2rem .6rem', borderRadius: '50px', fontSize: '.72rem', fontWeight: 800 }}>
              🌾 KrishiSetu AI • Farmer Profile
            </span>
          </div>
          <h1 style={{ margin: 0 }}>👤 My Farm &amp; Multi-Crop Profile</h1>
          <p style={{ margin: '.25rem 0 0', color: 'var(--text2)' }}>Manage seasonal crops, acreage, location, and Escrow direct payout bank details.</p>
        </div>
        <div style={{ display: 'flex', gap: '.6rem' }}>
          <button className="btn btn-green" onClick={openAddCrop}>
            ➕ Add Another Crop
          </button>
          {!editingProfile && (
            <button className="btn btn-outline" onClick={() => setEditingProfile(true)}>
              ✏️ Edit Bio Details
            </button>
          )}
        </div>
      </div>

      {/* Profile Summary Banner */}
      <div className="profile-card" style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, #1B5E20, #2E7D32)', color: '#fff', padding: '1.5rem', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', border: '2px solid rgba(255,255,255,0.4)' }}>
          👨‍🌾
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', flexWrap: 'wrap' }}>
            <h2 style={{ margin: 0, color: '#fff', fontSize: '1.5rem' }}>{f.name || 'Kisan Bhai'}</h2>
            <span style={{ background: '#A5D6A7', color: '#1B5E20', padding: '.2rem .6rem', borderRadius: '50px', fontSize: '.72rem', fontWeight: 800 }}>
              ID: {f.id || 'KS-FARMER-01'}
            </span>
            <span style={{ background: 'rgba(255,255,255,.2)', color: '#fff', padding: '.2rem .6rem', borderRadius: '50px', fontSize: '.72rem' }}>
              📍 {f.loc || `${profileForm.district}, ${profileForm.state}`}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '.75rem', marginTop: '.75rem', flexWrap: 'wrap' }}>
            <span style={{ background: 'rgba(255,255,255,0.15)', padding: '.3rem .75rem', borderRadius: '8px', fontSize: '.82rem' }}>
              🌱 Active Crop: <b>{activeCropName}</b>
            </span>
            <span style={{ background: 'rgba(255,255,255,0.15)', padding: '.3rem .75rem', borderRadius: '8px', fontSize: '.82rem' }}>
              🚜 Total Land: <b>{f.land || profileForm.land || 5} Acres</b>
            </span>
            <span style={{ background: 'rgba(255,255,255,0.15)', padding: '.3rem .75rem', borderRadius: '8px', fontSize: '.82rem' }}>
              🏦 Escrow Payout: <b>{profileForm.bankUpi}</b>
            </span>
          </div>
        </div>
      </div>

      {/* MULTI-CROP MANAGEMENT SECTION */}
      <div className="card" style={{ marginBottom: '1.5rem', border: '1.5px solid #C8E6C9' }}>
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '.5rem' }}>
          <div>
            <span className="card-title" style={{ fontSize: '1.1rem', color: '#1B5E20' }}>
              🌾 My Farm Multi-Crop Portfolio ({cropList.length})
            </span>
            <p style={{ margin: '.2rem 0 0', fontSize: '.8rem', color: 'var(--text2)' }}>
              Switch your <b>Active Focus Crop</b> to instantly calculate live Agmarknet mandis, NRS rankings, and price signals.
            </p>
          </div>
          <button className="btn btn-green btn-sm" onClick={openAddCrop}>
            ➕ Add New Crop
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginTop: '.5rem' }}>
          {cropList.map((c, idx) => {
            const isActive = c.name === activeCropName || c.status === 'Active';
            return (
              <div
                key={c.id || idx}
                style={{
                  border: isActive ? '2px solid #2E7D32' : '1px solid var(--border)',
                  background: isActive ? '#F1F8E9' : '#fff',
                  borderRadius: '14px',
                  padding: '1.1rem',
                  position: 'relative',
                  boxShadow: isActive ? '0 4px 14px rgba(46,125,50,0.15)' : 'none',
                  transition: 'all .2s'
                }}
              >
                {isActive && (
                  <span style={{
                    position: 'absolute',
                    top: '-10px',
                    right: '12px',
                    background: '#2E7D32',
                    color: '#fff',
                    padding: '.15rem .6rem',
                    borderRadius: '50px',
                    fontSize: '.68rem',
                    fontWeight: 800,
                    boxShadow: '0 2px 6px rgba(0,0,0,.15)'
                  }}>
                    🌟 ACTIVE FOCUS
                  </span>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '.6rem' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1B5E20' }}>{c.name}</h3>
                    <span style={{ fontSize: '.75rem', color: 'var(--text3)', fontWeight: 600 }}>
                      🗓️ {c.season || 'Kharif'} Season
                    </span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.5rem', margin: '.75rem 0', background: isActive ? '#fff' : '#FAFAFA', padding: '.6rem .75rem', borderRadius: '8px', border: '1px solid #E0E0E0' }}>
                  <div>
                    <div style={{ fontSize: '.68rem', color: 'var(--text3)', textTransform: 'uppercase' }}>Land Area</div>
                    <div style={{ fontWeight: 800, color: 'var(--text1)', fontSize: '.9rem' }}>{c.acreage} Acres</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '.68rem', color: 'var(--text3)', textTransform: 'uppercase' }}>Est. Yield</div>
                    <div style={{ fontWeight: 800, color: '#1565C0', fontSize: '.9rem' }}>{c.expectedYield || (c.acreage * 20)} qtl</div>
                  </div>
                  {c.sowingMonth && (
                    <div style={{ gridColumn: 'span 2', fontSize: '.75rem', color: 'var(--text2)', paddingTop: '.25rem' }}>
                      🌱 Sowing: <b>{c.sowingMonth}</b>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '.4rem', marginTop: '.75rem' }}>
                  {!isActive ? (
                    <button
                      className="btn btn-green btn-sm"
                      style={{ flex: 1 }}
                      onClick={() => handleSetActiveCrop(c)}
                    >
                      🎯 Set as Active
                    </button>
                  ) : (
                    <div style={{ flex: 1, textAlign: 'center', fontSize: '.78rem', color: '#2E7D32', fontWeight: 700, padding: '.35rem 0' }}>
                      ✓ Currently Calculating
                    </div>
                  )}
                  <button className="btn btn-outline btn-sm" onClick={() => openEditCrop(idx)} title="Edit Crop">
                    ✏️
                  </button>
                  <button
                    className="btn btn-sm"
                    style={{ background: '#FFEBEE', color: '#C62828', border: '1px solid #EF9A9A' }}
                    onClick={() => handleDeleteCrop(idx)}
                    title="Remove Crop"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FARMER BIO & ESCROW BANK DETAILS */}
      {editingProfile ? (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="card-header"><span className="card-title">✏️ Edit Personal &amp; Escrow Payout Details</span></div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', padding: '.5rem 0' }}>
            <div className="reg-field">
              <label>Full Name</label>
              <input value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} placeholder="Your full name" type="text" />
            </div>
            <div className="reg-field">
              <label>Mobile Number</label>
              <input value={profileForm.phone} onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })} maxLength="10" placeholder="10-digit mobile" type="tel" />
            </div>
            <div className="reg-field">
              <label>State</label>
              <input value={profileForm.state} onChange={e => setProfileForm({ ...profileForm, state: e.target.value })} placeholder="Maharashtra" type="text" />
            </div>
            <div className="reg-field">
              <label>District</label>
              <input value={profileForm.district} onChange={e => setProfileForm({ ...profileForm, district: e.target.value })} placeholder="Nashik" type="text" />
            </div>
            <div className="reg-field">
              <label>Total Farm Land Area (Acres)</label>
              <input value={profileForm.land} onChange={e => setProfileForm({ ...profileForm, land: e.target.value })} type="number" step="0.1" placeholder="5.5" />
            </div>
            <div className="reg-field">
              <label>Annual Income (₹)</label>
              <input value={profileForm.income} onChange={e => setProfileForm({ ...profileForm, income: e.target.value })} type="number" placeholder="120000" />
            </div>
            <div className="reg-field">
              <label>🔒 Escrow Payout UPI ID (0% cut directly to your account)</label>
              <input value={profileForm.bankUpi} onChange={e => setProfileForm({ ...profileForm, bankUpi: e.target.value })} placeholder="e.g. kisan@okaxis" type="text" />
            </div>
            <div className="reg-field">
              <label>Bank Account Number</label>
              <input value={profileForm.accountNo} onChange={e => setProfileForm({ ...profileForm, accountNo: e.target.value })} placeholder="e.g. 501004928192" type="text" />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button className="btn btn-green" onClick={() => saveFarmerData(cropList, activeCropName, profileForm)} disabled={saving}>
              {saving ? '⏳ Saving...' : '💾 Save Profile'}
            </button>
            <button className="btn btn-outline" onClick={() => setEditingProfile(false)}>Cancel</button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          <div className="card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="card-title">📋 Farm &amp; KYC Overview</span>
              <button className="btn btn-outline btn-sm" onClick={() => setEditingProfile(true)}>✏️ Edit</button>
            </div>
            <table>
              <tbody>
                <tr><td>Farmer ID</td><td><b>{f.id || 'KS-FARMER-01'}</b></td></tr>
                <tr><td>Name</td><td>{f.name || profileForm.name || '-'}</td></tr>
                <tr><td>Mobile</td><td>{f.phone || profileForm.phone || '-'}</td></tr>
                <tr><td>Location</td><td>{f.loc || `${profileForm.district}, ${profileForm.state}`}</td></tr>
                <tr><td>Total Land Holding</td><td>{f.land || profileForm.land || 0} Acres</td></tr>
                <tr><td>Registered Crops</td><td>{cropList.length} Seasonal Crops</td></tr>
                <tr><td>Verification Status</td><td><span className="badge badge-green">✓ Aadhaar &amp; 7/12 Verified</span></td></tr>
              </tbody>
            </table>
          </div>

          <div className="card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="card-title">🔒 Escrow Direct Payout Details</span>
              <span style={{ background: '#E8F5E9', color: '#2E7D32', fontSize: '.72rem', padding: '.2rem .5rem', borderRadius: '50px', fontWeight: 700 }}>
                0% Middleman Deduction
              </span>
            </div>
            <p style={{ fontSize: '.8rem', color: 'var(--text2)', margin: '0 0 .75rem' }}>
              All payments from buyers are locked in KrishiSetu Escrow and transferred directly to this account upon delivery verification.
            </p>
            <table>
              <tbody>
                <tr><td>UPI ID</td><td><b style={{ color: '#1565C0' }}>{profileForm.bankUpi}</b></td></tr>
                <tr><td>Bank A/C</td><td>{profileForm.accountNo}</td></tr>
                <tr><td>IFSC Code</td><td>{profileForm.ifsc}</td></tr>
                <tr><td>Escrow Protection</td><td><span className="badge badge-green">100% Guaranteed</span></td></tr>
                <tr><td>Payout Speed</td><td>Instant (IMPS / UPI 2.0)</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD / EDIT CROP MODAL */}
      {showCropModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(4px)' }} onClick={() => setShowCropModal(false)}>
          <div style={{ background: '#fff', borderRadius: '16px', maxWidth: '480px', width: '100%', padding: '1.5rem', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, color: '#1B5E20' }}>
                {cropModalIndex !== null ? '✏️ Edit Crop Details' : '➕ Add Seasonal Crop'}
              </h3>
              <button onClick={() => setShowCropModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '.85rem' }}>
              <div className="reg-field">
                <label>Select Crop *</label>
                <select value={cropForm.name} onChange={e => setCropForm({ ...cropForm, name: e.target.value })}>
                  {ALL_CROPS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="reg-field">
                <label>Growing Season</label>
                <select value={cropForm.season} onChange={e => setCropForm({ ...cropForm, season: e.target.value })}>
                  {SEASONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem' }}>
                <div className="reg-field">
                  <label>Acreage (Acres) *</label>
                  <input
                    type="number"
                    step="0.1"
                    value={cropForm.acreage}
                    onChange={e => setCropForm({ ...cropForm, acreage: e.target.value })}
                    placeholder="e.g. 2.5"
                  />
                </div>
                <div className="reg-field">
                  <label>Expected Yield (qtl)</label>
                  <input
                    type="number"
                    value={cropForm.expectedYield}
                    onChange={e => setCropForm({ ...cropForm, expectedYield: e.target.value })}
                    placeholder="e.g. 50"
                  />
                </div>
              </div>

              <div className="reg-field">
                <label>Sowing Month / Harvest Timeline</label>
                <input
                  type="text"
                  value={cropForm.sowingMonth || ''}
                  onChange={e => setCropForm({ ...cropForm, sowingMonth: e.target.value })}
                  placeholder="e.g. June - September"
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '.75rem', marginTop: '1.25rem' }}>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowCropModal(false)}>
                Cancel
              </button>
              <button className="btn btn-green" style={{ flex: 1 }} onClick={handleSaveCropModal}>
                💾 Save Crop
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
