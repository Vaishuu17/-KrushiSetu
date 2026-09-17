const express = require('express');
const router = express.Router();
const PlatformConfig = require('../models/PlatformConfig');
const { getPlatformConfig } = require('../services/commissionEngine');

// GET /api/config — get active platform settings
router.get('/', async (req, res) => {
  try {
    let config = await PlatformConfig.findOne({ key: 'global_config' });
    if (!config) {
      config = await PlatformConfig.create({
        key: 'global_config',
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
          { category: 'Cloud Infrastructure & High-Availability Server', description: 'AWS/GCP Dedicated Cluster hosting APIs and Database', monthlyAmount: 15000, isRecurring: true },
          { category: 'Agmarknet & CEDA Real-Time Market Feeds', description: 'API rate limits, satellite weather and mandi data feeds', monthlyAmount: 8000, isRecurring: true },
          { category: 'Field QC & Digital Inspection Operations', description: 'Third-party agricultural quality graders and verification partners', monthlyAmount: 25000, isRecurring: true },
          { category: 'Platform Maintenance & Cyber Security', description: 'SSL, database backups, automated security testing & auditing', monthlyAmount: 12000, isRecurring: true }
        ]
      });
    }
    res.json(config);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// PUT /api/config/commissions — admin updates commission percentages
router.put('/commissions', async (req, res) => {
  try {
    const { bulkBuyer, wholesaler, retailer, institutional, farmerFirstOrder, farmerSubsequent } = req.body;

    // Validation: 0% <= rate <= 100%
    const validateRate = (val) => {
      const num = Number(val);
      if (isNaN(num) || num < 0 || num > 100) {
        throw new Error('Commission rate must be between 0% and 100%');
      }
      return num;
    };

    let config = await PlatformConfig.findOne({ key: 'global_config' });
    if (!config) {
      config = new PlatformConfig({ key: 'global_config' });
    }

    if (bulkBuyer !== undefined) config.commissions.bulkBuyer = validateRate(bulkBuyer);
    if (wholesaler !== undefined) config.commissions.wholesaler = validateRate(wholesaler);
    if (retailer !== undefined) config.commissions.retailer = validateRate(retailer);
    if (institutional !== undefined) config.commissions.institutional = validateRate(institutional);
    if (farmerFirstOrder !== undefined) config.commissions.farmerFirstOrder = validateRate(farmerFirstOrder);
    if (farmerSubsequent !== undefined) config.commissions.farmerSubsequent = validateRate(farmerSubsequent);

    config.updatedAt = new Date();
    await config.save();

    res.json({ message: 'Commission rates updated successfully', commissions: config.commissions });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

// PUT /api/config/welfare — admin updates welfare contribution percentage
router.put('/welfare', async (req, res) => {
  try {
    const { welfareContributionRate } = req.body;
    const rate = Number(welfareContributionRate);
    if (isNaN(rate) || rate < 1 || rate > 50) {
      return res.status(400).json({ message: 'Welfare contribution rate must be between 1% and 50%' });
    }

    let config = await PlatformConfig.findOne({ key: 'global_config' });
    if (!config) config = new PlatformConfig({ key: 'global_config' });

    config.welfareContributionRate = rate;
    config.updatedAt = new Date();
    await config.save();

    res.json({ message: 'Welfare contribution rate updated', welfareContributionRate: config.welfareContributionRate });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

// PUT /api/config/expenses — admin updates operational expenses
router.put('/expenses', async (req, res) => {
  try {
    const { expenses } = req.body;
    if (!Array.isArray(expenses)) {
      return res.status(400).json({ message: 'Expenses must be an array' });
    }

    let config = await PlatformConfig.findOne({ key: 'global_config' });
    if (!config) config = new PlatformConfig({ key: 'global_config' });

    config.expenses = expenses.map(exp => ({
      category: exp.category || 'Operational',
      description: exp.description || '',
      monthlyAmount: Number(exp.monthlyAmount) || 0,
      isRecurring: exp.isRecurring !== false
    }));

    config.updatedAt = new Date();
    await config.save();

    res.json({ message: 'Expenses updated successfully', expenses: config.expenses });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

module.exports = router;
