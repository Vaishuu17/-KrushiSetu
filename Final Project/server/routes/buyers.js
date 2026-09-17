const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Buyer = require('../models/Buyer');

// GET /api/buyers - list all buyers
router.get('/', async (req, res) => {
  try {
    const { buyerType, status, search } = req.query;
    let query = {};
    if (buyerType && buyerType !== 'All') {
      query.buyerType = buyerType;
    }
    if (status && status !== 'All') {
      query.verificationStatus = status;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { businessName: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { loc: { $regex: search, $options: 'i' } },
      ];
    }

    const buyers = await Buyer.find(query).select('-password').sort({ createdAt: -1 });
    res.json(buyers);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// GET /api/buyers/:id
router.get('/:id', async (req, res) => {
  try {
    let buyer = await Buyer.findOne({ id: req.params.id }).select('-password');
    if (!buyer && mongoose.Types.ObjectId.isValid(req.params.id)) {
      buyer = await Buyer.findById(req.params.id).select('-password');
    }
    if (!buyer) return res.status(404).json({ message: 'Buyer not found' });
    res.json(buyer);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// PUT /api/buyers/:id/verify - toggle or set verification status
router.put('/:id/verify', async (req, res) => {
  try {
    const { verificationStatus } = req.body;
    let buyer = await Buyer.findOne({ id: req.params.id });
    if (!buyer && mongoose.Types.ObjectId.isValid(req.params.id)) {
      buyer = await Buyer.findById(req.params.id);
    }
    if (!buyer) return res.status(404).json({ message: 'Buyer not found' });

    buyer.verificationStatus = verificationStatus || (buyer.verificationStatus === 'Verified' ? 'Pending Verification' : 'Verified');
    await buyer.save();

    res.json({ message: 'Status updated', buyer });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;
