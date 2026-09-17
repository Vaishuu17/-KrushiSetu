const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Farmer = require('../models/Farmer');
const Buyer = require('../models/Buyer');
const { calculateOrderFinancials, getPlatformConfig } = require('../services/commissionEngine');

// GET /api/orders/analytics/revenue — dynamic platform revenue breakdown
router.get('/analytics/revenue', async (req, res) => {
  try {
    const completedOrders = await Order.find({ status: 'delivered' }).sort({ createdAt: -1 });
    const allOrders = await Order.find().sort({ createdAt: -1 });

    let totalGrossGMV = 0;
    let platformCommissionRevenue = 0;
    let farmerTotalEarnings = 0;

    const buyerTypeRevenueMap = {
      'Bulk Buyer': 0,
      'Wholesaler': 0,
      'Retailer': 0,
      'Institutional Buyer': 0
    };

    const cropRevenueMap = {};
    const monthlyRevenueMap = {};

    completedOrders.forEach(o => {
      const gmv = o.totalAmount || o.subtotal || (o.price * o.qty) || 0;
      const comm = o.platformCommissionRevenue || 0;
      const fEarn = o.farmerNetAmount || (gmv - (o.farmerCommissionAmount || 0));

      totalGrossGMV += gmv;
      platformCommissionRevenue += comm;
      farmerTotalEarnings += fEarn;

      // Buyer type breakdown
      const bType = o.buyerType || 'Wholesaler';
      if (buyerTypeRevenueMap[bType] !== undefined) {
        buyerTypeRevenueMap[bType] += comm;
      } else {
        buyerTypeRevenueMap['Wholesaler'] += comm;
      }

      // Crop category / name breakdown
      const crop = o.productName ? o.productName.split('(')[0].trim() : 'Other';
      cropRevenueMap[crop] = (cropRevenueMap[crop] || 0) + comm;

      // Monthly breakdown
      const monthKey = o.createdAt ? new Date(o.createdAt).toLocaleString('en-US', { month: 'short', year: 'numeric' }) : 'Recent';
      monthlyRevenueMap[monthKey] = (monthlyRevenueMap[monthKey] || 0) + comm;
    });

    const avgOrderValue = completedOrders.length > 0 ? Math.round(totalGrossGMV / completedOrders.length) : 0;

    res.json({
      totalGrossGMV,
      platformCommissionRevenue,
      farmerTotalEarnings,
      completedOrdersCount: completedOrders.length,
      totalOrdersCount: allOrders.length,
      avgOrderValue,
      buyerTypeRevenue: Object.entries(buyerTypeRevenueMap).map(([type, revenue]) => ({ type, revenue })),
      cropRevenue: Object.entries(cropRevenueMap).map(([crop, revenue]) => ({ crop, revenue })),
      monthlyRevenue: Object.entries(monthlyRevenueMap).map(([month, revenue]) => ({ month, revenue })),
      recentCompletedOrders: completedOrders.slice(0, 10)
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// GET /api/orders/analytics/pnl — dynamic Profit & Loss
router.get('/analytics/pnl', async (req, res) => {
  try {
    const config = await getPlatformConfig();
    const completedOrders = await Order.find({ status: 'delivered' });

    let grossPlatformRevenue = 0;
    completedOrders.forEach(o => {
      grossPlatformRevenue += (o.platformCommissionRevenue || 0);
    });

    const expensesList = config.expenses || [];
    const totalExpenses = expensesList.reduce((acc, curr) => acc + (Number(curr.monthlyAmount) || 0), 0);
    const netProfitOrLoss = grossPlatformRevenue - totalExpenses;
    const profitMargin = grossPlatformRevenue > 0 ? ((netProfitOrLoss / grossPlatformRevenue) * 100).toFixed(1) : '0.0';

    res.json({
      grossPlatformRevenue,
      expensesList,
      totalExpenses,
      netProfitOrLoss,
      profitMargin: Number(profitMargin),
      isProfitable: netProfitOrLoss >= 0,
      reportingPeriod: 'Current Operating Cycle (FY 2026-27)'
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// GET /api/orders/analytics/welfare — dynamic Farmer Welfare Fund allocation
router.get('/analytics/welfare', async (req, res) => {
  try {
    const config = await getPlatformConfig();
    const completedOrders = await Order.find({ status: 'delivered' });

    let annualPlatformRevenue = 0;
    completedOrders.forEach(o => {
      annualPlatformRevenue += (o.platformCommissionRevenue || 0);
    });

    const welfareRate = config.welfareContributionRate || 10.0;
    const allocatedWelfareAmount = Math.round(annualPlatformRevenue * (welfareRate / 100));

    res.json({
      annualPlatformRevenue,
      welfareContributionRate: welfareRate,
      currentYearAllocation: allocatedWelfareAmount,
      totalBeneficiaryFarmersCount: await Farmer.countDocuments(),
      totalCompletedDeals: completedOrders.length,
      statusLabel: 'Proposed Farmer Welfare Contribution',
      disclaimer: 'Calculated dynamically based on eligible completed marketplace transactions. Subject to authorized stakeholder governance.',
      history: [
        { year: '2024-25', revenue: 0, rate: 10, allocated: 0, status: 'Archived' },
        { year: '2025-26', revenue: Math.round(annualPlatformRevenue * 0.4), rate: 10, allocated: Math.round(annualPlatformRevenue * 0.04), status: 'Audited' },
        { year: '2026-27 (Current)', revenue: annualPlatformRevenue, rate: welfareRate, allocated: allocatedWelfareAmount, status: 'Active Allocation' },
      ]
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// GET /api/orders — flexible search for farmer and buyer portals
router.get('/', async (req, res) => {
  try {
    const { sellerId, buyerId, sellerName, buyerName, sellerPhone, buyerPhone } = req.query;

    let sellerConditions = [];
    if (sellerId) sellerConditions.push({ sellerId });
    if (sellerName) sellerConditions.push({ sellerName: new RegExp(sellerName.trim(), 'i') });
    if (sellerPhone) sellerConditions.push({ sellerPhone });

    let buyerConditions = [];
    if (buyerId) buyerConditions.push({ buyerId });
    if (buyerName) buyerConditions.push({ buyerName: new RegExp(buyerName.trim(), 'i') });
    if (buyerPhone) buyerConditions.push({ buyerPhone });

    let filter = {};
    if (sellerConditions.length > 0 && buyerConditions.length > 0) {
      filter = { $and: [{ $or: sellerConditions }, { $or: buyerConditions }] };
    } else if (sellerConditions.length > 0) {
      filter = { $or: sellerConditions };
    } else if (buyerConditions.length > 0) {
      filter = { $or: buyerConditions };
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.json(orders);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// POST /api/orders — buyer creates an offer or direct escrow purchase
router.post('/', async (req, res) => {
  try {
    const orderId = 'KMO-' + Date.now().toString(36).toUpperCase() + Math.floor(Math.random() * 1000);
    const offeredPrice = Number(req.body.offeredPrice || req.body.price);
    const quantity = Number(req.body.qty || 1);
    const isDirectEscrow = req.body.directEscrow === true;

    // Look up buyer type if not explicitly supplied
    let buyerType = req.body.buyerType;
    if (!buyerType && req.body.buyerId) {
      const bDoc = await Buyer.findOne({ $or: [{ id: req.body.buyerId }, { _id: req.body.buyerId }] });
      if (bDoc && bDoc.buyerType) buyerType = bDoc.buyerType;
    }

    // Calculate standardized commission snapshot
    const financials = await calculateOrderFinancials({
      unitPrice: offeredPrice,
      qty: quantity,
      buyerType: buyerType || 'Wholesaler',
      sellerId: req.body.sellerId,
      sellerPhone: req.body.sellerPhone
    });

    const order = await Order.create({
      ...req.body,
      orderId,
      qty: quantity,
      price: Number(req.body.price) || offeredPrice,
      offeredPrice,
      totalAmount: financials.subtotal,
      subtotal: financials.subtotal,
      buyerType: financials.buyerType,
      buyerCommissionPct: financials.buyerCommissionPct,
      buyerCommissionAmount: financials.buyerCommissionAmount,
      farmerOrderNumber: financials.farmerOrderNumber,
      farmerCommissionPct: financials.farmerCommissionPct,
      farmerCommissionAmount: financials.farmerCommissionAmount,
      farmerNetAmount: financials.farmerNetAmount,
      buyerTotalAmount: financials.buyerTotalAmount,
      platformCommissionRevenue: financials.platformCommissionRevenue,
      status: isDirectEscrow ? 'payment-held' : 'offer-pending',
      escrow: {
        status: isDirectEscrow ? 'held' : 'pending',
        buyerPaid: isDirectEscrow,
        buyerPaidAt: isDirectEscrow ? new Date() : null,
        heldAt: isDirectEscrow ? new Date() : null,
        farmerSeesPayment: isDirectEscrow
      },
    });
    res.json(order);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// PUT /api/orders/:id — general update
router.put('/:id', async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// ===== OFFER FLOW =====

// PUT /api/orders/:id/accept — farmer accepts buyer's offer
router.put('/:id/accept', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    order.status = 'accepted';
    order.acceptedAt = new Date();
    await order.save();
    res.json(order);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// PUT /api/orders/:id/reject — farmer rejects buyer's offer
router.put('/:id/reject', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    order.status = 'rejected';
    order.rejectedReason = req.body.reason || '';
    await order.save();
    res.json(order);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// ===== ESCROW FLOW =====

// PUT /api/orders/:id/escrow/pay — buyer locks funds into platform escrow
router.put('/:id/escrow/pay', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    order.escrow.status = 'held';
    order.escrow.buyerPaid = true;
    order.escrow.buyerPaidAt = new Date();
    order.escrow.heldAt = new Date();
    order.escrow.farmerSeesPayment = true;
    order.status = 'payment-held';
    await order.save();
    res.json(order);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// PUT /api/orders/:id/dispatch — farmer marks shipment dispatched with vehicle tracking
router.put('/:id/dispatch', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    order.status = 'in-transit';
    order.shippedAt = new Date();
    order.transportBooked = true;
    order.transportDetails = req.body.transportDetails || {
      vehicle: req.body.vehicle || 'MH-15-EG-4482 (Eicher 14ft)',
      driver: req.body.driver || 'Ramesh Shinde (+91 98231 44210)',
      fare: req.body.fare || 1800,
      bookingId: 'TRK-' + Date.now().toString(36).toUpperCase()
    };
    await order.save();
    res.json(order);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// PUT /api/orders/:id/verify-quality — digital quality inspector or buyer verifies grade
router.put('/:id/verify-quality', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    order.status = 'unload-pending';
    order.escrow.farmerApprovedUnload = true;
    order.escrow.farmerApprovedUnloadAt = new Date();
    order.escrow.status = 'awaiting-unload';
    await order.save();
    res.json(order);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// PUT /api/orders/:id/escrow/approve-unload
router.put('/:id/escrow/approve-unload', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    order.escrow.farmerApprovedUnload = true;
    order.escrow.farmerApprovedUnloadAt = new Date();
    order.escrow.status = 'awaiting-unload';
    order.status = 'unload-pending';
    await order.save();
    res.json(order);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// PUT /api/orders/:id/escrow/confirm-received — buyer confirms & releases payment
router.put('/:id/escrow/confirm-received', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    order.escrow.buyerConfirmedReceived = true;
    order.escrow.buyerConfirmedReceivedAt = new Date();
    order.escrow.status = 'released';
    order.escrow.releasedAt = new Date();
    order.status = 'delivered';
    await order.save();
    res.json(order);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// PUT /api/orders/:id/release-payout — direct instant payout release to farmer UPI/bank
router.put('/:id/release-payout', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    order.escrow.status = 'released';
    order.escrow.releasedAt = new Date();
    order.escrow.buyerConfirmedReceived = true;
    order.escrow.buyerConfirmedReceivedAt = new Date();
    order.status = 'delivered';
    await order.save();
    res.json(order);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// PUT /api/orders/:id/escrow/dispute
router.put('/:id/escrow/dispute', async (req, res) => {
  try {
    const { role, reason } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    order.escrow.status = 'disputed';
    order.escrow.disputedBy = role;
    order.escrow.disputeReason = reason || 'No reason';
    order.escrow.disputedAt = new Date();
    await order.save();
    res.json(order);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// PUT /api/orders/:id/escrow/resolve — admin resolves
router.put('/:id/escrow/resolve', async (req, res) => {
  try {
    const { action } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    order.escrow.resolvedAt = new Date();
    order.escrow.resolvedAction = action;
    if (action === 'release') {
      order.escrow.status = 'released';
      order.escrow.releasedAt = new Date();
      order.status = 'delivered';
    } else {
      order.escrow.status = 'refunded';
      order.status = 'cancelled';
    }
    await order.save();
    res.json(order);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// POST /api/orders/seed-sample — create sample escrow deal for testing
router.post('/seed-sample', async (req, res) => {
  try {
    const { sellerId, sellerName, sellerLoc, sellerPhone, productName, qty, price, buyerName, buyerType } = req.body;
    const orderId = 'KME-' + Date.now().toString(36).toUpperCase();
    const unitPrice = price || 3400;
    const quantity = qty || 20;

    const financials = await calculateOrderFinancials({
      unitPrice,
      qty: quantity,
      buyerType: buyerType || 'Bulk Buyer',
      sellerId: sellerId || 'KS-1001',
      sellerPhone: sellerPhone || '9876543210'
    });

    const order = await Order.create({
      orderId,
      productName: productName || 'Tomato (टमाटर)',
      qty: quantity,
      price: unitPrice,
      offeredPrice: unitPrice,
      totalAmount: financials.subtotal,
      subtotal: financials.subtotal,
      buyerType: financials.buyerType,
      buyerCommissionPct: financials.buyerCommissionPct,
      buyerCommissionAmount: financials.buyerCommissionAmount,
      farmerOrderNumber: financials.farmerOrderNumber,
      farmerCommissionPct: financials.farmerCommissionPct,
      farmerCommissionAmount: financials.farmerCommissionAmount,
      farmerNetAmount: financials.farmerNetAmount,
      buyerTotalAmount: financials.buyerTotalAmount,
      platformCommissionRevenue: financials.platformCommissionRevenue,
      buyerName: buyerName || 'Reliance Retail Agri Procurement',
      buyerPhone: '+91 99887 76655',
      buyerId: 'KB-8821',
      buyerLoc: 'Vashi APMC, Navi Mumbai',
      sellerName: sellerName || 'Ramesh Kumar Patel',
      sellerId: sellerId || 'KS-1001',
      sellerPhone: sellerPhone || '9876543210',
      sellerLoc: sellerLoc || 'Nashik, Maharashtra',
      status: 'payment-held',
      escrow: {
        status: 'held',
        buyerPaid: true,
        buyerPaidAt: new Date(),
        heldAt: new Date(),
        farmerSeesPayment: true,
      },
    });
    res.json(order);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;

