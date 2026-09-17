const express = require('express');
const router = express.Router();
const Requirement = require('../models/Requirement');
const Buyer = require('../models/Buyer');

// GET /api/requirements — list requirements with optional filters (crop, location, price, status)
router.get('/', async (req, res) => {
  try {
    const { crop, location, status, buyerId, minQty, maxPrice } = req.query;
    const filter = {};

    if (crop) {
      filter.crop = new RegExp(crop.trim(), 'i');
    }
    if (location) {
      filter.$or = [
        { deliveryLocation: new RegExp(location.trim(), 'i') },
        { buyerLoc: new RegExp(location.trim(), 'i') },
        { preferredFarmerLocation: new RegExp(location.trim(), 'i') }
      ];
    }
    if (status) {
      filter.status = status;
    }
    if (buyerId) {
      filter.buyerId = buyerId;
    }
    if (minQty) {
      filter.quantity = { $gte: Number(minQty) };
    }
    if (maxPrice) {
      filter.expectedPriceMax = { $lte: Number(maxPrice) };
    }

    const requirements = await Requirement.find(filter).sort({ createdAt: -1 });
    res.json(requirements);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// GET /api/requirements/:id — single requirement details
router.get('/:id', async (req, res) => {
  try {
    const requirement = await Requirement.findById(req.params.id);
    if (!requirement) return res.status(404).json({ message: 'Requirement not found' });
    res.json(requirement);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// POST /api/requirements — buyer posts a requirement
router.post('/', async (req, res) => {
  try {
    const { 
      buyerId, buyerName, buyerType, buyerPhone, buyerLoc,
      crop, quantity, unit, quality,
      expectedPriceMin, expectedPriceMax,
      deliveryLocation, requiredByDate, preferredFarmerLocation, notes
    } = req.body;

    if (!crop || !quantity || !expectedPriceMin || !expectedPriceMax || !deliveryLocation || !requiredByDate) {
      return res.status(400).json({ message: 'Please fill all required fields' });
    }

    const reqId = 'KMR-' + Date.now().toString(36).toUpperCase() + Math.floor(100 + Math.random() * 900);

    // Look up buyer details if missing
    let bName = buyerName;
    let bType = buyerType;
    let bLoc = buyerLoc;
    let bPhone = buyerPhone;

    if (buyerId && (!bName || !bType)) {
      const buyer = await Buyer.findOne({ $or: [{ id: buyerId }, { _id: buyerId }] });
      if (buyer) {
        bName = bName || buyer.businessName || buyer.name;
        bType = bType || buyer.buyerType || 'Wholesaler';
        bLoc = bLoc || buyer.loc;
        bPhone = bPhone || buyer.phone;
      }
    }

    const reqDoc = await Requirement.create({
      reqId,
      buyerId: buyerId || 'KB-8821',
      buyerName: bName || 'Reliance Retail Agri Procurement',
      buyerType: bType || 'Wholesaler',
      buyerPhone: bPhone || '+91 99887 76655',
      buyerLoc: bLoc || 'Vashi APMC, Navi Mumbai',
      crop,
      quantity: Number(quantity),
      unit: unit || 'quintals',
      quality: quality || 'Grade A',
      expectedPriceMin: Number(expectedPriceMin),
      expectedPriceMax: Number(expectedPriceMax),
      deliveryLocation: deliveryLocation || bLoc || 'Vashi APMC',
      requiredByDate: new Date(requiredByDate),
      preferredFarmerLocation: preferredFarmerLocation || 'Maharashtra',
      notes: notes || '',
      status: 'Active',
      offers: []
    });

    res.json(reqDoc);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// POST /api/requirements/:id/offer — farmer sends offer / proposal for requirement
router.post('/:id/offer', async (req, res) => {
  try {
    const { farmerId, farmerName, farmerPhone, farmerLoc, offeredQty, offeredPrice, notes } = req.body;
    const reqDoc = await Requirement.findById(req.params.id);
    if (!reqDoc) return res.status(404).json({ message: 'Requirement not found' });

    reqDoc.offers.push({
      farmerId: farmerId || 'KS-1001',
      farmerName: farmerName || 'Ramesh Kumar Patel',
      farmerPhone: farmerPhone || '+91 98765 43210',
      farmerLoc: farmerLoc || 'Nashik, Maharashtra',
      offeredQty: Number(offeredQty) || reqDoc.quantity,
      offeredPrice: Number(offeredPrice) || reqDoc.expectedPriceMax,
      notes: notes || '',
      status: 'Pending',
      offeredAt: new Date()
    });

    await reqDoc.save();
    res.json(reqDoc);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// PUT /api/requirements/:id/offer/:offerId/status — buyer accepts/rejects farmer offer
router.put('/:id/offer/:offerId/status', async (req, res) => {
  try {
    const { status } = req.body; // 'Accepted', 'Rejected'
    const reqDoc = await Requirement.findById(req.params.id);
    if (!reqDoc) return res.status(404).json({ message: 'Requirement not found' });

    const offer = reqDoc.offers.id(req.params.offerId);
    if (!offer) return res.status(404).json({ message: 'Offer not found' });

    offer.status = status;
    if (status === 'Accepted') {
      reqDoc.status = 'Partially Fulfilled';
    }
    await reqDoc.save();
    res.json(reqDoc);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// PUT /api/requirements/:id/status — update status ('Active', 'Closed', etc.)
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const reqDoc = await Requirement.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!reqDoc) return res.status(404).json({ message: 'Requirement not found' });
    res.json(reqDoc);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// DELETE /api/requirements/:id — delete requirement
router.delete('/:id', async (req, res) => {
  try {
    await Requirement.findByIdAndDelete(req.params.id);
    res.json({ message: 'Requirement deleted' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;
