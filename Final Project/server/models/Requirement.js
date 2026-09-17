const mongoose = require('mongoose');

const requirementSchema = new mongoose.Schema({
  reqId: { type: String, unique: true },
  buyerId: { type: String, required: true },
  buyerName: { type: String, required: true },
  buyerType: { 
    type: String, 
    enum: ['Bulk Buyer', 'Wholesaler', 'Retailer', 'Institutional Buyer'],
    default: 'Wholesaler'
  },
  buyerPhone: { type: String },
  buyerLoc: { type: String, required: true },
  crop: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, default: 'quintals' },
  quality: { 
    type: String, 
    enum: ['Grade A', 'Grade B', 'Premium', 'Export Quality', 'Organic Certified', 'Standard'],
    default: 'Grade A'
  },
  expectedPriceMin: { type: Number, required: true },
  expectedPriceMax: { type: Number, required: true },
  deliveryLocation: { type: String, required: true },
  requiredByDate: { type: Date, required: true },
  preferredFarmerLocation: { type: String, default: 'Maharashtra' },
  notes: { type: String, default: '' },
  status: { 
    type: String, 
    enum: ['Active', 'Partially Fulfilled', 'Fulfilled', 'Closed'],
    default: 'Active'
  },
  offers: [{
    farmerId: { type: String, required: true },
    farmerName: { type: String, required: true },
    farmerPhone: { type: String },
    farmerLoc: { type: String },
    offeredQty: { type: Number, required: true },
    offeredPrice: { type: Number, required: true },
    notes: { type: String },
    status: { type: String, enum: ['Pending', 'Accepted', 'Rejected'], default: 'Pending' },
    offeredAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Requirement', requirementSchema);
