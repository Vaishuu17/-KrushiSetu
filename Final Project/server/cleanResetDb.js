const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const Farmer = require('./models/Farmer');
const Buyer = require('./models/Buyer');
const Admin = require('./models/Admin');
const Product = require('./models/Product');
const Order = require('./models/Order');

async function cleanReset() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/krushimitra');
    console.log('✅ Connected to MongoDB');

    // Clear old registration test data
    await Farmer.deleteMany({});
    await Buyer.deleteMany({});
    await Admin.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    console.log('🧹 Cleared old registrations, products, and orders.');

    // Seed Verified Farmer
    const farmer = await Farmer.create({
      id: 'KS-1001',
      name: 'Ramesh Kumar Patel',
      phone: '9876543210',
      password: 'kisan123',
      aadhaar: '123456789012',
      state: 'Maharashtra',
      district: 'Nashik',
      loc: 'Nashik, Maharashtra',
      land: 3.5,
      crop: 'Tomato (टमाटर)',
      crops: [
        { id: 'crop-1', name: 'Tomato (टमाटर)', season: 'Kharif', acreage: 3.5, expectedYield: 70, sowingMonth: 'June - September', status: 'Active' },
        { id: 'crop-2', name: 'Wheat (गेहूं)', season: 'Rabi', acreage: 2.0, expectedYield: 40, sowingMonth: 'November - March', status: 'Standby' },
        { id: 'crop-3', name: 'Onion (प्याज)', season: 'Rabi', acreage: 1.5, expectedYield: 45, sowingMonth: 'December - April', status: 'Standby' }
      ],
      income: 150000,
      bankUpi: 'ramesh.kisan@okhdfcbank',
      accountNo: '501004928192',
      ifsc: 'SBIN0004120',
      status: 'Active'
    });
    console.log('✅ Seeded Verified Farmer: Ramesh Kumar Patel (Phone: 9876543210 / Pass: kisan123)');

    // Seed Verified Buyer
    const buyer = await Buyer.create({
      id: 'KB-8821',
      name: 'Reliance Retail Agri Procurement',
      phone: '9988776655',
      password: 'buyer123',
      businessName: 'Reliance Fresh Agri Hub / AgroStar FPO',
      businessType: 'Supermarket Chain / Institutional Buyer',
      state: 'Maharashtra',
      district: 'Navi Mumbai',
      loc: 'Vashi APMC, Navi Mumbai',
      gstNumber: '27AAACR1234F1Z5'
    });
    console.log('✅ Seeded Verified Buyer: Reliance Retail Agri (Phone: 9988776655 / Pass: buyer123)');

    // Seed Admin
    await Admin.create({
      name: 'Yash (System Administrator)',
      empId: 'GOV-MH-01',
      username: 'yash',
      password: 'yash@123',
      department: 'Agriculture Department',
      phone: '9820011223'
    });
    console.log('✅ Seeded Admin: yash / yash@123');

    // Seed Initial Marketplace Products
    await Product.insertMany([
      {
        name: 'Tomato (टमाटर)',
        price: 1800,
        minPrice: 1500,
        maxPrice: 2200,
        qty: 35,
        cat: 'Vegetables',
        emoji: '🍅',
        farmer: 'Ramesh Kumar Patel',
        sellerId: farmer.id,
        loc: 'Nashik, Maharashtra'
      },
      {
        name: 'Wheat (गेहूं)',
        price: 2450,
        minPrice: 2300,
        maxPrice: 2600,
        qty: 50,
        cat: 'Grains',
        emoji: '🌾',
        farmer: 'Ramesh Kumar Patel',
        sellerId: farmer.id,
        loc: 'Nashik, Maharashtra'
      },
      {
        name: 'Onion (प्याज)',
        price: 2100,
        minPrice: 1900,
        maxPrice: 2400,
        qty: 40,
        cat: 'Vegetables',
        emoji: '🧅',
        farmer: 'Ramesh Kumar Patel',
        sellerId: farmer.id,
        loc: 'Nashik, Maharashtra'
      }
    ]);
    console.log('✅ Seeded Initial Marketplace Listings');

    // Seed Active Escrow Deal Order
    await Order.create({
      orderId: 'KME-ESCROW-2026',
      productName: 'Tomato (Grade A)',
      qty: 25,
      price: 3450,
      offeredPrice: 3450,
      totalAmount: 86250,
      buyerName: 'Reliance Retail Agri Procurement',
      buyerPhone: '+91 99887 76655',
      buyerId: buyer.id,
      buyerLoc: 'Vashi APMC, Navi Mumbai',
      sellerName: 'Ramesh Kumar Patel',
      sellerId: farmer.id,
      sellerLoc: 'Nashik, Maharashtra',
      status: 'payment-held',
      escrow: {
        status: 'held',
        buyerPaid: true,
        buyerPaidAt: new Date(),
        heldAt: new Date(),
        farmerSeesPayment: true
      }
    });
    console.log('✅ Seeded Initial Active Escrow Contract (₹86,250 Locked)');

    console.log('🎉 Database Clean Reset & Fresh Seeding Complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Reset error:', err);
    process.exit(1);
  }
}

cleanReset();
