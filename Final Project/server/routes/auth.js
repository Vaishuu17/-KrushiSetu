const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Farmer = require('../models/Farmer');
const Admin = require('../models/Admin');
const Buyer = require('../models/Buyer');

const genToken = (id, role) => jwt.sign({ id, role }, process.env.JWT_SECRET || 'krushisetu_jwt_secret_2026', { expiresIn: '30d' });

// Helper to format full farmer response
const formatFarmer = (f) => ({
  id: f.id || ('KS-' + f._id.toString().slice(-4)),
  _id: f._id,
  name: f.name || 'Kisan Bhai',
  phone: f.phone,
  aadhaar: f.aadhaar || '',
  village: f.village || 'Dindori',
  district: f.district || 'Nashik',
  state: f.state || 'Maharashtra',
  loc: f.loc || `${f.village || 'Dindori'}, ${f.district || 'Nashik'}, ${f.state || 'Maharashtra'}`,
  land: f.land || 4.5,
  crop: f.crop || 'Tomato (टमाटर)',
  crops: (f.crops && f.crops.length > 0) ? f.crops : [
    { id: 'crop-1', name: f.crop || 'Tomato (टमाटर)', season: 'Kharif', acreage: f.land || 4.5, expectedYield: 90, status: 'Active' },
    { id: 'crop-2', name: 'Wheat (गेहूं)', season: 'Rabi', acreage: 2.5, expectedYield: 50, status: 'Standby' }
  ],
  farmingPractice: f.farmingPractice || 'Organic Certified',
  preferredBuyerType: f.preferredBuyerType || 'Any (Bulk / Wholesaler)',
  deliveryCapability: f.deliveryCapability || 'Farmgate Pickup & Local Mandi Transport',
  harvestAvailability: f.harvestAvailability || 'Immediate / Ready Stock',
  income: f.income || 180000,
  rating: f.rating || 4.9,
  completedOrders: f.completedOrders || 0,
  totalSales: f.totalSales || 0,
  verificationStatus: f.verificationStatus || 'Verified',
  language: f.language || 'mr',
  bankUpi: f.bankUpi || 'kisan@okaxis',
  accountNo: f.accountNo || '501004928192',
  ifsc: f.ifsc || 'SBIN0004120',
});

// Helper to format full buyer response
const formatBuyer = (b) => ({
  id: b.id || ('KB-' + b._id.toString().slice(-4)),
  _id: b._id,
  name: b.name || 'Agri Trader',
  phone: b.phone,
  businessName: b.businessName || 'Agri Enterprises',
  buyerType: b.buyerType || 'Wholesaler',
  contactPerson: b.contactPerson || b.name,
  businessCategory: b.businessCategory || 'Fruits & Vegetables',
  state: b.state || 'Maharashtra',
  district: b.district || 'Navi Mumbai',
  loc: b.loc || `${b.district || 'Navi Mumbai'}, ${b.state || 'Maharashtra'}`,
  deliveryLocations: b.deliveryLocations || ['Vashi APMC', 'Pune Market Yard'],
  requiredCrops: b.requiredCrops || ['Tomato', 'Onion', 'Potato'],
  preferredPriceRange: b.preferredPriceRange || 'Fair Market Average',
  paymentPreference: b.paymentPreference || 'Platform Escrow (Direct Bank/UPI)',
  gstNumber: b.gstNumber || '27AAACR1234F1Z5',
  verificationStatus: b.verificationStatus || 'Verified',
  rating: b.rating || 4.8,
  totalOrders: b.totalOrders || 0,
  completedOrders: b.completedOrders || 0,
  language: b.language || 'en'
});

// POST /api/auth/register/farmer
router.post('/register/farmer', async (req, res) => {
  try {
    const { name, phone, password, aadhaar, state, district, land, crop, income } = req.body;
    const cleanPhone = (phone || '').replace(/\D/g, '');
    const cleanAadhaar = (aadhaar || '').replace(/\D/g, '');

    let existing = await Farmer.findOne({ $or: [{ phone: cleanPhone }, { phone }] });
    if (existing) {
      // If user already exists with this phone, update password & details so they can seamlessly log in
      existing.name = name || existing.name;
      existing.password = password || existing.password;
      existing.state = state || existing.state;
      existing.district = district || existing.district;
      existing.loc = `${district || existing.district}, ${state || existing.state}`;
      existing.land = Number(land) || existing.land;
      existing.crop = crop || existing.crop;
      existing.income = Number(income) || existing.income;
      if (!existing.crops || existing.crops.length === 0) {
        existing.crops = [{ id: 'crop-1', name: existing.crop, season: 'Kharif', acreage: existing.land, expectedYield: existing.land * 20, status: 'Active' }];
      }
      await existing.save();
      return res.json({ token: genToken(existing._id, 'farmer'), farmer: formatFarmer(existing) });
    }

    const farmerId = 'KS-' + Math.floor(1000 + Math.random() * 9000);
    const loc = (district || 'Nashik') + ', ' + (state || 'Maharashtra');
    const primaryCrop = crop || 'Tomato (टमाटर)';
    const farmLand = Number(land) || 3.5;

    const initialCrops = [
      { id: 'crop-1', name: primaryCrop, season: 'Kharif', acreage: farmLand, expectedYield: farmLand * 20, status: 'Active' },
      { id: 'crop-2', name: 'Wheat (गेहूं)', season: 'Rabi', acreage: 2.0, expectedYield: 40, status: 'Standby' }
    ];

    const farmer = await Farmer.create({
      id: farmerId,
      name: name || 'Kisan Bhai',
      phone: cleanPhone || phone,
      password,
      aadhaar: cleanAadhaar,
      state: state || 'Maharashtra',
      district: district || 'Nashik',
      loc,
      land: farmLand,
      crop: primaryCrop,
      crops: initialCrops,
      income: Number(income) || 120000,
      bankUpi: 'kisan@okaxis',
      accountNo: '501004928192',
      ifsc: 'SBIN0004120'
    });

    res.json({ token: genToken(farmer._id, 'farmer'), farmer: formatFarmer(farmer) });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// POST /api/auth/login/farmer
router.post('/login/farmer', async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone) return res.status(400).json({ message: 'Please enter phone or Aadhaar' });

    const cleanInput = phone.replace(/\D/g, '');

    // Search by clean phone, raw phone, aadhaar or custom id
    let farmer = await Farmer.findOne({
      $or: [
        { phone: cleanInput },
        { phone: phone.trim() },
        { aadhaar: cleanInput },
        { id: phone.trim() }
      ]
    });

    if (!farmer) {
      // If demo account or flexible testing, create a default profile on the fly
      if (password === 'kisan123' || password === 'demo123' || password === '123456' || cleanInput === '9876543210') {
        const farmerId = 'KS-' + Math.floor(1000 + Math.random() * 9000);
        farmer = await Farmer.create({
          id: farmerId,
          name: 'Ramesh Kumar Patel',
          phone: cleanInput || '9876543210',
          password: password || 'kisan123',
          aadhaar: '123456789012',
          state: 'Maharashtra',
          district: 'Nashik',
          loc: 'Nashik, Maharashtra',
          land: 3.5,
          crop: 'Tomato (टमाटर)',
          crops: [
            { id: 'crop-1', name: 'Tomato (टमाटर)', season: 'Kharif', acreage: 3.5, expectedYield: 70, status: 'Active' },
            { id: 'crop-2', name: 'Wheat (गेहूं)', season: 'Rabi', acreage: 2.0, expectedYield: 40, status: 'Standby' }
          ],
          income: 150000,
          bankUpi: 'ramesh.kisan@okhdfcbank',
          accountNo: '501004928192',
          ifsc: 'SBIN0004120'
        });
        return res.json({ token: genToken(farmer._id, 'farmer'), farmer: formatFarmer(farmer) });
      }
      return res.status(401).json({ message: 'Account not found. Please Sign Up first.' });
    }

    const isMatch = await farmer.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect password. Try kisan123 or check your password.' });
    }

    res.json({ token: genToken(farmer._id, 'farmer'), farmer: formatFarmer(farmer) });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// POST /api/auth/register/admin
router.post('/register/admin', async (req, res) => {
  try {
    const { name, empId, username, password, department, phone } = req.body;
    const exists = await Admin.findOne({ username });
    if (exists) return res.status(400).json({ message: 'Username already taken' });
    const admin = await Admin.create({ name, empId, username, password, department, phone });
    res.json({ token: genToken(admin._id, 'admin'), admin: { name, username } });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// POST /api/auth/login/admin
router.post('/login/admin', async (req, res) => {
  try {
    const { username, password } = req.body;
    // Default master admin
    if ((username === 'yash' && (password === 'yash@123' || password === 'admin123')) || (username === 'admin' && password === 'admin123')) {
      return res.json({ token: genToken('admin-yash', 'admin'), admin: { name: 'Yash (System Admin)', username: 'yash' } });
    }
    const admin = await Admin.findOne({ username });
    if (!admin || !(await admin.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }
    res.json({ token: genToken(admin._id, 'admin'), admin: { name: admin.name, username: admin.username } });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// POST /api/auth/register/buyer
router.post('/register/buyer', async (req, res) => {
  try {
    const { name, phone, password, businessName, buyerType, businessType, state, district, loc, gstNumber, contactPerson, businessCategory } = req.body;
    const cleanPhone = (phone || '').replace(/\D/g, '');
    const resolvedType = buyerType || businessType || 'Wholesaler';

    let exists = await Buyer.findOne({ $or: [{ phone: cleanPhone }, { phone }] });
    if (exists) {
      exists.name = name || exists.name;
      exists.businessName = businessName || exists.businessName;
      exists.buyerType = resolvedType;
      exists.password = password || exists.password;
      exists.state = state || exists.state;
      exists.district = district || exists.district;
      exists.loc = loc || exists.loc || `${district || 'Navi Mumbai'}, ${state || 'Maharashtra'}`;
      exists.gstNumber = gstNumber || exists.gstNumber;
      exists.contactPerson = contactPerson || exists.contactPerson;
      exists.businessCategory = businessCategory || exists.businessCategory;
      await exists.save();
      return res.json({ token: genToken(exists._id, 'buyer'), buyer: formatBuyer(exists) });
    }
    const buyerId = 'KB-' + Math.floor(1000 + Math.random() * 9000);
    const buyerLoc = loc || (district || 'Vashi') + ', ' + (state || 'Maharashtra');
    const buyer = await Buyer.create({
      id: buyerId,
      name,
      phone: cleanPhone || phone,
      password,
      businessName: businessName || name,
      buyerType: resolvedType,
      contactPerson: contactPerson || name,
      businessCategory: businessCategory || 'Fruits & Vegetables',
      state: state || 'Maharashtra',
      district: district || 'Navi Mumbai',
      loc: buyerLoc,
      gstNumber: gstNumber || '27AAACR1234F1Z5',
      verificationStatus: 'Verified'
    });
    res.json({ token: genToken(buyer._id, 'buyer'), buyer: formatBuyer(buyer) });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// POST /api/auth/login/buyer
router.post('/login/buyer', async (req, res) => {
  try {
    const { phone, password } = req.body;
    const cleanPhone = (phone || '').replace(/\D/g, '');

    // Demo Buyer login
    if (cleanPhone === '9988776655' || password === 'buyer123') {
      let buyer = await Buyer.findOne({ phone: '9988776655' });
      if (!buyer) {
        buyer = await Buyer.create({
          id: 'KB-8821',
          name: 'Reliance Fresh Agri Hub / Yash Trader',
          phone: '9988776655',
          password: 'buyer123',
          businessName: 'Reliance Retail Agri Procurement',
          buyerType: 'Bulk Buyer',
          contactPerson: 'Suresh Mehta (Procurement Lead)',
          businessCategory: 'Supermarket & Bulk Food Supply',
          state: 'Maharashtra',
          district: 'Navi Mumbai',
          loc: 'Vashi APMC, Navi Mumbai',
          gstNumber: '27AAACR1234F1Z5',
          verificationStatus: 'Verified',
          rating: 4.9
        });
      }
      return res.json({ token: genToken(buyer._id, 'buyer'), buyer: formatBuyer(buyer) });
    }

    const buyer = await Buyer.findOne({ $or: [{ phone: cleanPhone }, { phone }] });
    if (!buyer || !(await buyer.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid buyer credentials. Try 9988776655 with password buyer123' });
    }
    res.json({ token: genToken(buyer._id, 'buyer'), buyer: formatBuyer(buyer) });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;

