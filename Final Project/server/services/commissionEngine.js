const PlatformConfig = require('../models/PlatformConfig');
const Order = require('../models/Order');

/**
 * Get active platform configuration (or defaults)
 */
async function getPlatformConfig() {
  let config = await PlatformConfig.findOne({ key: 'global_config' });
  if (!config) {
    config = {
      commissions: {
        bulkBuyer: 1.0,
        wholesaler: 1.5,
        retailer: 2.0,
        institutional: 1.5,
        farmerFirstOrder: 0.0,
        farmerSubsequent: 2.0
      },
      welfareContributionRate: 10.0,
      expenses: [
        { category: 'Cloud Hosting & Servers', monthlyAmount: 15000, isRecurring: true },
        { category: 'Agmarknet / CEDA API Feeds', monthlyAmount: 8000, isRecurring: true },
        { category: 'Field QC & Inspection Agents', monthlyAmount: 25000, isRecurring: true },
        { category: 'Security & Maintenance', monthlyAmount: 12000, isRecurring: true }
      ]
    };
  }
  return config;
}

/**
 * Calculate order commission and financial breakdown
 * @param {Object} params
 * @param {number} params.unitPrice - price per unit (qtl/kg)
 * @param {number} params.qty - quantity
 * @param {string} params.buyerType - 'Bulk Buyer' | 'Wholesaler' | 'Retailer' | 'Institutional Buyer'
 * @param {string} params.sellerId - farmer ID to count completed orders
 * @param {string} params.sellerPhone - farmer phone
 */
async function calculateOrderFinancials({ unitPrice, qty, buyerType = 'Wholesaler', sellerId, sellerPhone }) {
  const config = await getPlatformConfig();
  const subtotal = Math.round((Number(unitPrice) || 0) * (Number(qty) || 1));

  // Determine buyer commission %
  let buyerCommissionPct = config.commissions.wholesaler;
  const bType = (buyerType || '').trim().toLowerCase();
  if (bType.includes('bulk')) {
    buyerCommissionPct = config.commissions.bulkBuyer;
  } else if (bType.includes('retail')) {
    buyerCommissionPct = config.commissions.retailer;
  } else if (bType.includes('instit') || bType.includes('multiple')) {
    buyerCommissionPct = config.commissions.institutional;
  } else {
    buyerCommissionPct = config.commissions.wholesaler;
  }

  // Determine farmer order sequence count
  let completedCount = 0;
  if (sellerId || sellerPhone) {
    const query = {
      status: 'delivered',
      $or: []
    };
    if (sellerId) query.$or.push({ sellerId });
    if (sellerPhone) query.$or.push({ sellerPhone });
    if (query.$or.length > 0) {
      completedCount = await Order.countDocuments(query);
    }
  }

  const farmerOrderNumber = completedCount + 1;
  const farmerCommissionPct = (farmerOrderNumber === 1) 
    ? config.commissions.farmerFirstOrder 
    : config.commissions.farmerSubsequent;

  // Mathematically accurate rounding
  const buyerCommissionAmount = Math.round(subtotal * (buyerCommissionPct / 100));
  const farmerCommissionAmount = Math.round(subtotal * (farmerCommissionPct / 100));
  const farmerNetAmount = subtotal - farmerCommissionAmount;
  const buyerTotalAmount = subtotal + buyerCommissionAmount;
  const platformCommissionRevenue = buyerCommissionAmount + farmerCommissionAmount;

  return {
    subtotal,
    buyerType: buyerType || 'Wholesaler',
    buyerCommissionPct,
    buyerCommissionAmount,
    farmerOrderNumber,
    farmerCommissionPct,
    farmerCommissionAmount,
    farmerNetAmount,
    buyerTotalAmount,
    platformCommissionRevenue,
    welfareContributionRate: config.welfareContributionRate || 10.0,
    estimatedWelfareAllocation: Math.round(platformCommissionRevenue * ((config.welfareContributionRate || 10.0) / 100))
  };
}

module.exports = {
  getPlatformConfig,
  calculateOrderFinancials
};
