const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Farmer = require('../models/Farmer');

// GET /api/farmers
router.get('/', async (req, res) => {
  try {
    const farmers = await Farmer.find().select('-password').sort({ createdAt: -1 });
    res.json(farmers);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// GET /api/farmers/:id
router.get('/:id', async (req, res) => {
  try {
    let farmer = await Farmer.findOne({ id: req.params.id }).select('-password');
    if (!farmer && mongoose.Types.ObjectId.isValid(req.params.id)) {
      farmer = await Farmer.findById(req.params.id).select('-password');
    }
    if (!farmer) return res.status(404).json({ message: 'Farmer not found' });
    res.json(farmer);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// PUT /api/farmers/:id – update profile, crops, bank details
router.put('/:id', async (req, res) => {
  try {
    const { name, phone, state, district, land, crop, crops, income, bankUpi, accountNo, ifsc } = req.body;
    let farmer = await Farmer.findOne({ id: req.params.id });
    if (!farmer && mongoose.Types.ObjectId.isValid(req.params.id)) {
      farmer = await Farmer.findById(req.params.id);
    }
    if (!farmer) return res.status(404).json({ message: 'Farmer not found' });

    if (name) farmer.name = name;
    if (phone) farmer.phone = phone.replace(/\D/g, '') || phone;
    if (state) farmer.state = state;
    if (district) farmer.district = district;
    farmer.loc = (district || farmer.district || 'Nashik') + ', ' + (state || farmer.state || 'Maharashtra');
    if (land !== undefined) farmer.land = Number(land);
    if (crop) farmer.crop = crop;
    if (crops !== undefined) farmer.crops = crops;
    if (income !== undefined) farmer.income = Number(income);
    if (bankUpi) farmer.bankUpi = bankUpi;
    if (accountNo) farmer.accountNo = accountNo;
    if (ifsc) farmer.ifsc = ifsc;

    await farmer.save();

    res.json({
      id: farmer.id,
      _id: farmer._id,
      name: farmer.name,
      phone: farmer.phone,
      aadhaar: farmer.aadhaar,
      loc: farmer.loc,
      land: farmer.land,
      crop: farmer.crop,
      crops: farmer.crops || [],
      income: farmer.income,
      state: farmer.state,
      district: farmer.district,
      bankUpi: farmer.bankUpi,
      accountNo: farmer.accountNo,
      ifsc: farmer.ifsc,
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;
