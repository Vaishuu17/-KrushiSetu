const mongoose = require('mongoose');

const platformConfigSchema = new mongoose.Schema({
  key: { type: String, default: 'global_config', unique: true },
  
  // Commission settings (Percentages)
  commissions: {
    bulkBuyer: { type: Number, default: 1.0, min: 0, max: 100 },
    wholesaler: { type: Number, default: 1.5, min: 0, max: 100 },
    retailer: { type: Number, default: 2.0, min: 0, max: 100 },
    institutional: { type: Number, default: 1.5, min: 0, max: 100 },
    farmerFirstOrder: { type: Number, default: 0.0, min: 0, max: 100 },
    farmerSubsequent: { type: Number, default: 2.0, min: 0, max: 100 }
  },

  // Proposed Farmer Welfare Contribution Rate (% of Platform Revenue)
  welfareContributionRate: { type: Number, default: 10.0, min: 1, max: 50 },

  // Operational & Platform Expenses
  expenses: [{
    category: { type: String, required: true },
    description: { type: String },
    monthlyAmount: { type: Number, required: true },
    isRecurring: { type: Boolean, default: true }
  }],

  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PlatformConfig', platformConfigSchema);
