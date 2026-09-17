const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const crypto = require('crypto');

// ── Razorpay Test Mode Setup ──
// These are Razorpay TEST keys — safe to commit, no real money moves
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_KrishiSetuDemo01';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'KrishiSetuTestSecret2026';

let Razorpay;
try {
  Razorpay = require('razorpay');
} catch {
  console.warn('⚠️  Razorpay package not found — payment routes will use demo simulation mode');
  Razorpay = null;
}

const razorpayInstance = Razorpay ? new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
}) : null;

/**
 * POST /api/payment/create-order
 * Creates a Razorpay order for escrow payment
 * Body: { orderId (mongo _id), amount (in INR) }
 */
router.post('/create-order', async (req, res) => {
  try {
    const { orderId, amount, currency = 'INR', notes = {} } = req.body;

    if (!orderId || !amount) {
      return res.status(400).json({ error: 'orderId and amount are required' });
    }

    const dbOrder = await Order.findById(orderId);
    if (!dbOrder) return res.status(404).json({ error: 'Order not found' });

    const amountPaise = Math.round(Number(amount) * 100); // Razorpay uses paise

    // If real Razorpay is available, create real test order
    if (razorpayInstance) {
      const rzpOrder = await razorpayInstance.orders.create({
        amount: amountPaise,
        currency,
        receipt: dbOrder.orderId || `ESC-${orderId}`,
        notes: {
          krishiSetuOrderId: orderId,
          productName: dbOrder.productName,
          sellerName: dbOrder.sellerName,
          platform: 'KrishiSetu AI SIH2026',
          ...notes,
        },
      });

      // Save rzp order id on the DB order
      dbOrder.paymentDetails = {
        rzpOrderId: rzpOrder.id,
        amountPaise,
        currency,
        status: 'created',
        createdAt: new Date(),
      };
      await dbOrder.save();

      return res.json({
        rzpOrderId: rzpOrder.id,
        amount: amountPaise,
        currency,
        keyId: RAZORPAY_KEY_ID,
        orderInfo: {
          orderId: dbOrder.orderId,
          productName: dbOrder.productName,
          sellerName: dbOrder.sellerName,
          totalAmount: dbOrder.buyerTotalAmount || dbOrder.totalAmount,
        },
      });
    }

    // ── Demo / Simulation mode (if razorpay package not installed yet) ──
    const demoRzpOrderId = `order_DEMO_${Date.now().toString(36).toUpperCase()}`;
    dbOrder.paymentDetails = {
      rzpOrderId: demoRzpOrderId,
      amountPaise,
      currency,
      status: 'created',
      isDemoMode: true,
      createdAt: new Date(),
    };
    await dbOrder.save();

    return res.json({
      rzpOrderId: demoRzpOrderId,
      amount: amountPaise,
      currency,
      keyId: RAZORPAY_KEY_ID,
      demoMode: true,
      orderInfo: {
        orderId: dbOrder.orderId,
        productName: dbOrder.productName,
        sellerName: dbOrder.sellerName,
        totalAmount: dbOrder.buyerTotalAmount || dbOrder.totalAmount,
      },
    });
  } catch (e) {
    console.error('Payment create-order error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

/**
 * POST /api/payment/verify
 * Verifies Razorpay payment signature and releases escrow
 * Body: { orderId, rzpPaymentId, rzpOrderId, rzpSignature }
 */
router.post('/verify', async (req, res) => {
  try {
    const { orderId, rzpPaymentId, rzpOrderId, rzpSignature, demoMode } = req.body;

    const dbOrder = await Order.findById(orderId);
    if (!dbOrder) return res.status(404).json({ error: 'Order not found' });

    let isValid = false;

    if (demoMode) {
      // Demo mode — always succeed
      isValid = true;
    } else {
      // Real Razorpay signature verification
      const body = rzpOrderId + '|' + rzpPaymentId;
      const expectedSig = crypto
        .createHmac('sha256', RAZORPAY_KEY_SECRET)
        .update(body)
        .digest('hex');
      isValid = expectedSig === rzpSignature;
    }

    if (!isValid) {
      return res.status(400).json({ error: 'Payment signature verification failed' });
    }

    // Mark payment captured → move order to escrow held
    dbOrder.paymentDetails = {
      ...dbOrder.paymentDetails,
      rzpPaymentId,
      rzpSignature,
      status: 'captured',
      paidAt: new Date(),
      isDemoMode: !!demoMode,
    };
    dbOrder.escrow.status = 'held';
    dbOrder.escrow.buyerPaid = true;
    dbOrder.escrow.buyerPaidAt = new Date();
    dbOrder.escrow.heldAt = new Date();
    dbOrder.escrow.farmerSeesPayment = true;
    dbOrder.status = 'payment-held';
    await dbOrder.save();

    res.json({
      success: true,
      message: 'Payment verified and funds locked in escrow ✅',
      order: dbOrder,
    });
  } catch (e) {
    console.error('Payment verify error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

/**
 * GET /api/payment/config
 * Returns public Razorpay key for frontend
 */
router.get('/config', (req, res) => {
  res.json({
    keyId: RAZORPAY_KEY_ID,
    mode: razorpayInstance ? 'test' : 'demo',
    currency: 'INR',
  });
});

module.exports = router;
