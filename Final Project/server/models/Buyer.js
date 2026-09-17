const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const buyerSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  businessName: { type: String, default: 'Agri Business' },
  buyerType: { 
    type: String, 
    enum: ['Bulk Buyer', 'Wholesaler', 'Retailer', 'Institutional Buyer'],
    default: 'Wholesaler'
  },
  contactPerson: { type: String },
  businessCategory: { type: String, default: 'Fruits & Vegetables' },
  state: { type: String, default: 'Maharashtra' },
  district: { type: String, default: 'Mumbai' },
  loc: { type: String, default: 'Vashi APMC, Navi Mumbai' },
  deliveryLocations: { type: [String], default: ['Vashi APMC', 'Pune Market Yard'] },
  requiredCrops: { type: [String], default: ['Tomato', 'Onion', 'Potato'] },
  preferredPriceRange: { type: String, default: 'Market Standard' },
  paymentPreference: { type: String, default: 'Platform Escrow (Direct Bank/UPI)' },
  gstNumber: { type: String, default: '27AAACR1234F1Z5' },
  verificationStatus: { 
    type: String, 
    enum: ['Verified', 'Pending Verification', 'Not Verified'],
    default: 'Verified'
  },
  rating: { type: Number, default: 4.8 },
  totalOrders: { type: Number, default: 0 },
  completedOrders: { type: Number, default: 0 },
  language: { type: String, default: 'en' },
  status: { type: String, default: 'Active' },
  createdAt: { type: Date, default: Date.now },
});

buyerSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

buyerSchema.methods.matchPassword = async function (pass) {
  return await bcrypt.compare(pass, this.password);
};

module.exports = mongoose.model('Buyer', buyerSchema);
