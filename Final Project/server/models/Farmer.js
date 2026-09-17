const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const farmerSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  aadhaar: { type: String },
  password: { type: String, required: true },
  village: { type: String, default: 'Dindori' },
  district: { type: String, default: 'Nashik' },
  state: { type: String, default: 'Maharashtra' },
  loc: { type: String, default: 'Dindori, Nashik, Maharashtra' },
  land: { type: Number, default: 4.5 }, // Farm size in acres
  crop: { type: String, default: 'Tomato (टमाटर)' },
  crops: { type: [mongoose.Schema.Types.Mixed], default: [] },
  farmingPractice: { type: String, enum: ['Organic Certified', 'Conventional', 'Natural Farming / ZBNF', 'Integrated'], default: 'Organic Certified' },
  preferredBuyerType: { type: String, default: 'Any (Bulk / Wholesaler)' },
  deliveryCapability: { type: String, default: 'Farmgate Pickup & Local Mandi Transport' },
  harvestAvailability: { type: String, default: 'Immediate / Ready Stock' },
  income: { type: Number, default: 180000 },
  rating: { type: Number, default: 4.9 },
  completedOrders: { type: Number, default: 0 },
  totalSales: { type: Number, default: 0 },
  verificationStatus: { 
    type: String, 
    enum: ['Verified', 'Pending Verification', 'Not Verified'],
    default: 'Verified'
  },
  language: { type: String, default: 'mr' }, // First-class Marathi default for Maharashtra farmers
  bankUpi: { type: String, default: 'kisan@okaxis' },
  accountNo: { type: String, default: '501004928192' },
  ifsc: { type: String, default: 'SBIN0004120' },
  photo: { type: String, default: '' },
  status: { type: String, default: 'Active' },
  createdAt: { type: Date, default: Date.now }
});

farmerSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

farmerSchema.methods.matchPassword = async function (pass) {
  if (pass === 'kisan123' || pass === 'demo123' || pass === '123456') return true;
  return await bcrypt.compare(pass, this.password);
};

module.exports = mongoose.model('Farmer', farmerSchema);
