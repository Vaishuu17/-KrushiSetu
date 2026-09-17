/**
 * Auto-seed: Populates reference data, platform config, sample farmers, buyers,
 * marketplace listings, buyer requirements, and completed orders with commission snapshots.
 */
const Scheme = require('./models/Scheme');
const GIProduct = require('./models/GIProduct');
const ChatQA = require('./models/ChatQA');
const Price = require('./models/Price');
const Weather = require('./models/Weather');
const Farmer = require('./models/Farmer');
const Buyer = require('./models/Buyer');
const Product = require('./models/Product');
const Requirement = require('./models/Requirement');
const Order = require('./models/Order');
const PlatformConfig = require('./models/PlatformConfig');

const schemes = [
  { name: 'PM-KISAN Samman Nidhi', benefit: '₹6,000/year (₹2,000 per installment)', elig: 'Land <2 hectares, Small & Marginal Farmer', desc: 'Direct income support of ₹6,000/year to landholding farmer families. Credited directly to bank accounts.', docs: ['Aadhaar Card', 'Bank Passbook', 'Land Record (7/12)'], status: 'Active' },
  { name: 'Pradhan Mantri Fasal Bima Yojana', benefit: 'Crop insurance up to ₹2 Lakh', elig: 'All farmers growing notified crops', desc: 'Comprehensive crop insurance against natural calamities, pests & diseases. Low premium rates for farmers.', docs: ['Aadhaar', 'Land Record', 'Bank Account', 'Sowing Certificate'], status: 'Active' },
  { name: 'Kisan Credit Card (KCC)', benefit: 'Credit up to ₹3 Lakh at 4% interest', elig: 'All farmers, fishermen, SHGs', desc: 'Provides timely credit for agricultural needs. Interest subvention available.', docs: ['Aadhaar', 'PAN Card', 'Land Record', 'Passport Photo'], status: 'Active' },
  { name: 'PM Krishi Sinchai Yojana', benefit: '75-90% subsidy on irrigation', elig: 'Farmers with land ownership', desc: 'Promotes micro-irrigation. 75% subsidy for small & marginal farmers on drip/sprinkler systems.', docs: ['Land Record', 'Aadhaar', 'Bank Account', 'Soil Health Card'], status: 'Active' },
  { name: 'Soil Health Card Scheme', benefit: 'Free soil testing & advisory', elig: 'All farmers', desc: 'Free soil health card with crop-wise nutrient recommendations every 2 years.', docs: ['Aadhaar', 'Land Record'], status: 'Active' },
  { name: 'e-NAM (National Agriculture Market)', benefit: 'Direct market access, better prices', elig: 'All farmers with produce', desc: 'Online trading platform connecting farmers directly to buyers across India.', docs: ['Aadhaar', 'Bank Account', 'Mandi Registration'], status: 'Active' },
  { name: 'Rashtriya Krishi Vikas Yojana', benefit: 'Project-based funding up to ₹25 Lakh', elig: 'Farmer groups, FPOs with 5+ acres', desc: 'Grants for cold storage, processing units, farm ponds.', docs: ['Land Record', 'Group Registration', 'Project Proposal', 'Bank Account'], status: 'Active' },
  { name: 'PM Kisan Maandhan Yojana', benefit: '₹3,000/month pension after 60', elig: 'Small farmers, age 18-40', desc: 'Voluntary old-age pension. Contribute ₹55-200/month, get ₹3,000/month after 60.', docs: ['Aadhaar', 'Bank Account', 'Land Record', 'Age Proof'], status: 'Active' },
  { name: 'Paramparagat Krishi Vikas Yojana', benefit: '₹50,000/ha over 3 years', elig: 'Farmers willing to go organic', desc: 'Promotes organic farming through cluster approach. ₹50,000/hectare support.', docs: ['Land Record', 'Aadhaar', 'Cluster Group Registration'], status: 'Active' },
  { name: 'Agriculture Infrastructure Fund', benefit: 'Loans up to ₹2 Cr at 3% less', elig: 'Farmers, FPOs, Cooperatives', desc: 'Debt financing for post-harvest management and community farming assets.', docs: ['Business Plan', 'Land Record', 'Bank Account', 'Registration Cert'], status: 'Active' },
  { name: 'National Mission on Oilseeds', benefit: '50-75% subsidy on seeds', elig: 'Farmers growing oilseed crops', desc: 'Promotes oilseed production through quality seed distribution.', docs: ['Land Record', 'Aadhaar', 'Crop Declaration'], status: 'Active' },
];

const giProducts = [
  { name: 'Alphonso Mango', origin: 'Ratnagiri, Maharashtra', state: 'Maharashtra', farmer: 'GI Registry', journey: ['Picked', 'Graded', 'Certified', 'Packed', 'Market'], status: 'Verified' },
  { name: 'Darjeeling Tea', origin: 'Darjeeling, West Bengal', state: 'West Bengal', farmer: 'GI Registry', journey: ['Plucked', 'Processed', 'Tested', 'Certified', 'Export'], status: 'Verified' },
  { name: 'Nashik Grapes', origin: 'Nashik, Maharashtra', state: 'Maharashtra', farmer: 'GI Registry', journey: ['Harvested', 'Graded', 'Certified', 'Packed'], status: 'Verified' },
  { name: 'Kolhapur Jaggery', origin: 'Kolhapur, Maharashtra', state: 'Maharashtra', farmer: 'GI Registry', journey: ['Cane Harvested', 'Crushed', 'Boiled', 'Molded', 'Certified'], status: 'Verified' },
  { name: 'Solapur Pomegranate', origin: 'Solapur, Maharashtra', state: 'Maharashtra', farmer: 'GI Registry', journey: ['Picked', 'Sorted', 'Certified', 'Packed'], status: 'Pending' },
  { name: 'Lucknow Dussehri Mango', origin: 'Lucknow, UP', state: 'Uttar Pradesh', farmer: 'GI Registry', journey: ['Harvested', 'Certified', 'Packed', 'Market'], status: 'Verified' },
  { name: 'Nagpur Orange', origin: 'Nagpur, Maharashtra', state: 'Maharashtra', farmer: 'GI Registry', journey: ['Picked', 'Sorted', 'Tested', 'Certified'], status: 'Verified' },
  { name: 'Kashmiri Saffron', origin: 'Pampore, J&K', state: 'J&K', farmer: 'GI Registry', journey: ['Grown', 'Handpicked', 'Dried', 'Graded', 'Certified'], status: 'Verified' },
];

const chatQAs = [
  { keywords: ['msp', 'rate', 'price', 'bhav', 'भाव', 'दर'], answer: 'Current MSP & Mandi rates: Wheat ₹2,310/qtl, Soybean ₹4,720/qtl, Tomato ₹3,450/qtl, Onion ₹4,850/qtl. Check the dedicated Market Prices section!' },
  { keywords: ['commission', 'fee', 'charge', 'दलाली', 'कमीशन'], answer: 'Krushi Setu charges 0% commission on your 1st completed order, and only 2% on subsequent orders! Buyers pay 1.0% to 2.0% depending on buyer tier.' },
  { keywords: ['welfare', 'fund', 'कल्याण', 'निधी'], answer: 'Krushi Setu platform allocates 10%–12% of annual platform commission revenue to the Proposed Farmer Welfare Fund.' },
  { keywords: ['requirement', 'demand', 'मागणी', 'खरीदार'], answer: 'Verified bulk buyers & wholesalers post their crop requirements in the Buyer Requirements section. You can filter by crop, price, and location, and send direct offers!' },
  { keywords: ['escrow', 'payment', 'सुरक्षा', 'पैसे'], answer: '100% of the deal amount is locked in platform Escrow before dispatch. Payout is released directly to your bank UPI once digital quality inspection passes.' },
  { keywords: ['loan', 'kcc', 'credit', 'कर्ज'], answer: 'KCC offers loans up to ₹3 lakh at 4% interest with government subvention. Apply through the Financials section.' },
  { keywords: ['weather', 'mausam', 'हवामान', 'rain'], answer: 'Check the Weather section for real-time temperature, rainfall predictions, and crop-specific advisories.' },
  { keywords: ['scheme', 'yojana', 'योजना', 'pm'], answer: 'Top government schemes: PM-KISAN (₹6,000/yr), PMFBY Crop Insurance, Micro-Irrigation subsidy. Check the Government Schemes section!' },
  { keywords: ['hi', 'hello', 'namaskar', 'नमस्कार', 'help'], answer: 'Namaskar! 🙏 I am KrushiSetu AI Assistant. I can help you with Market Prices, Sell/Wait suggestions, Buyer Requirements, Escrow, Commissions, and Schemes in English, Hindi, or Marathi.' },
];

const prices = [
  { crop: 'Wheat (गेहूं)', msp: 2275, mandi: 2310, change: '+1.5%', trend: '📈' },
  { crop: 'Rice (धान)', msp: 2183, mandi: 2150, change: '-1.5%', trend: '📉' },
  { crop: 'Soybean (सोयाबीन)', msp: 4600, mandi: 4720, change: '+2.6%', trend: '📈' },
  { crop: 'Maize (मक्का)', msp: 1870, mandi: 1900, change: '+1.6%', trend: '📈' },
  { crop: 'Cotton (कपास)', msp: 6620, mandi: 6580, change: '-0.6%', trend: '📉' },
  { crop: 'Sugarcane (गन्ना)', msp: 3200, mandi: 3250, change: '+1.6%', trend: '📈' },
  { crop: 'Arhar Dal', msp: 7000, mandi: 7200, change: '+2.9%', trend: '📈' },
  { crop: 'Urad Dal', msp: 6800, mandi: 6750, change: '-0.7%', trend: '📉' },
  { crop: 'Mustard (सरसों)', msp: 5650, mandi: 5800, change: '+2.7%', trend: '📈' },
  { crop: 'Groundnut (मूंगफली)', msp: 5550, mandi: 5620, change: '+1.3%', trend: '📈' },
  { crop: 'Onion (प्याज)', msp: 1500, mandi: 4850, change: '+32.4%', trend: '🔥' },
  { crop: 'Tomato (टमाटर)', msp: 800, mandi: 3450, change: '+28.5%', trend: '🔥' },
  { crop: 'Potato (आलू)', msp: 600, mandi: 1650, change: '+12.0%', trend: '📈' },
  { crop: 'Chana (ग्राम)', msp: 5440, mandi: 5380, change: '-1.1%', trend: '📉' },
  { crop: 'Bajra (बाजरा)', msp: 2500, mandi: 2480, change: '-0.8%', trend: '📉' },
];

async function autoSeed() {
  try {
    // 1. Initialize Platform Config
    let config = await PlatformConfig.findOne({ key: 'global_config' });
    if (!config) {
      await PlatformConfig.create({
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
          { category: 'Cloud Infrastructure & High-Availability Servers', description: 'AWS/GCP Cloud instances, load balancers, MongoDB cluster', monthlyAmount: 15000, isRecurring: true },
          { category: 'Agmarknet & CEDA Real-Time Market Data APIs', description: 'Real-time mandi price feeds & data.gov.in integration', monthlyAmount: 8000, isRecurring: true },
          { category: 'Field QC & Digital Inspection Operations', description: 'Third-party agricultural quality graders and verification partners', monthlyAmount: 25000, isRecurring: true },
          { category: 'Platform Maintenance & Cybersecurity', description: 'SSL, database backups, automated security testing & auditing', monthlyAmount: 12000, isRecurring: true }
        ]
      });
      console.log('  ✅ Platform Config Initialized');
    }

    // 2. Reference schemes, GI products, chatQAs, prices, weather
    const schemeCount = await Scheme.countDocuments();
    if (schemeCount === 0) {
      await Scheme.insertMany(schemes);
      await GIProduct.insertMany(giProducts);
      await ChatQA.insertMany(chatQAs);
      await Price.insertMany(prices);
      await Weather.create({ temp: 28, humid: 72, wind: 12, rain: 3, cond: '⛅ Partly Cloudy', adv: 'Good day for irrigation. Avoid pesticide spraying.' });
      console.log('  ✅ Reference Data Initialized');
    }

    // 3. Seed Farmers if needed
    const farmerCount = await Farmer.countDocuments();
    if (farmerCount === 0) {
      await Farmer.create([
        {
          id: 'KS-1001',
          name: 'Ramesh Kumar Patel',
          phone: '9876543210',
          password: 'kisan123',
          aadhaar: '123456789012',
          village: 'Dindori',
          district: 'Nashik',
          state: 'Maharashtra',
          loc: 'Dindori, Nashik, Maharashtra',
          land: 4.5,
          crop: 'Tomato (टमाटर)',
          crops: [
            { id: 'c1', name: 'Tomato (टमाटर)', season: 'Kharif', acreage: 3.0, expectedYield: 90, status: 'Active' },
            { id: 'c2', name: 'Wheat (गेहूं)', season: 'Rabi', acreage: 1.5, expectedYield: 30, status: 'Standby' }
          ],
          farmingPractice: 'Organic Certified',
          preferredBuyerType: 'Bulk Buyer',
          deliveryCapability: 'Farmgate Pickup & Local Mandi Transport',
          income: 180000,
          rating: 4.9,
          completedOrders: 1,
          totalSales: 86250,
          verificationStatus: 'Verified',
          language: 'mr',
          bankUpi: 'ramesh.kisan@okhdfcbank',
          accountNo: '501004928192',
          ifsc: 'SBIN0004120'
        },
        {
          id: 'KS-1002',
          name: 'Vitthalrao Shinde',
          phone: '9822114455',
          password: 'kisan123',
          aadhaar: '234567890123',
          village: 'Niphad',
          district: 'Nashik',
          state: 'Maharashtra',
          loc: 'Niphad, Nashik, Maharashtra',
          land: 6.0,
          crop: 'Onion (प्याज)',
          crops: [
            { id: 'c1', name: 'Onion (प्याज)', season: 'Kharif', acreage: 4.0, expectedYield: 120, status: 'Active' },
            { id: 'c2', name: 'Soybean (सोयाबीन)', season: 'Kharif', acreage: 2.0, expectedYield: 40, status: 'Active' }
          ],
          farmingPractice: 'Conventional',
          preferredBuyerType: 'Wholesaler',
          deliveryCapability: 'Direct Mandi Delivery',
          income: 240000,
          rating: 4.8,
          completedOrders: 3,
          totalSales: 185000,
          verificationStatus: 'Verified',
          language: 'mr',
          bankUpi: 'vitthal.onion@okaxis'
        },
        {
          id: 'KS-1003',
          name: 'Suresh Tukaram Jadhav',
          phone: '9890123456',
          password: 'kisan123',
          aadhaar: '345678901234',
          village: 'Baramati',
          district: 'Pune',
          state: 'Maharashtra',
          loc: 'Baramati, Pune, Maharashtra',
          land: 5.5,
          crop: 'Soybean (सोयाबीन)',
          crops: [
            { id: 'c1', name: 'Soybean (सोयाबीन)', season: 'Kharif', acreage: 3.5, expectedYield: 75, status: 'Active' },
            { id: 'c2', name: 'Sugarcane (गन्ना)', season: 'Annual', acreage: 2.0, expectedYield: 160, status: 'Active' }
          ],
          farmingPractice: 'Integrated',
          preferredBuyerType: 'Institutional Buyer',
          deliveryCapability: 'Farmgate Pickup',
          income: 310000,
          rating: 4.95,
          completedOrders: 2,
          totalSales: 142000,
          verificationStatus: 'Verified',
          language: 'mr',
          bankUpi: 'suresh.baramati@okicici'
        },
        {
          id: 'KS-1004',
          name: 'Balasaheb Patil',
          phone: '9765432109',
          password: 'kisan123',
          aadhaar: '456789012345',
          village: 'Pandharpur',
          district: 'Solapur',
          state: 'Maharashtra',
          loc: 'Pandharpur, Solapur, Maharashtra',
          land: 7.0,
          crop: 'Pomegranate (अनार)',
          crops: [
            { id: 'c1', name: 'Pomegranate (अनार)', season: 'Ambe Bahar', acreage: 5.0, expectedYield: 60, status: 'Active' },
            { id: 'c2', name: 'Maize (मक्का)', season: 'Kharif', acreage: 2.0, expectedYield: 45, status: 'Active' }
          ],
          farmingPractice: 'Organic Certified',
          preferredBuyerType: 'Bulk Buyer',
          deliveryCapability: 'Cold Chain Supported',
          income: 450000,
          rating: 5.0,
          completedOrders: 4,
          totalSales: 320000,
          verificationStatus: 'Verified',
          language: 'mr',
          bankUpi: 'balasaheb.anar@okhdfc'
        }
      ]);
      console.log('  ✅ Sample Farmers Initialized');
    }

    // 4. Seed Buyers (Covering all 4 Buyer Types)
    const buyerCount = await Buyer.countDocuments();
    if (buyerCount === 0) {
      await Buyer.create([
        {
          id: 'KB-8821',
          name: 'Reliance Retail Agri Procurement',
          phone: '9988776655',
          password: 'buyer123',
          businessName: 'Reliance Fresh Direct Sourcing Hub',
          buyerType: 'Bulk Buyer', // 1.0% commission
          contactPerson: 'Suresh Mehta (VP Procurement)',
          businessCategory: 'Corporate Retail Chain & Bulk Sourcing',
          state: 'Maharashtra',
          district: 'Navi Mumbai',
          loc: 'Vashi APMC Hub, Navi Mumbai',
          deliveryLocations: ['Vashi APMC Central Hub', 'Thane Sorting Facility', 'Pune LogiPark'],
          requiredCrops: ['Tomato', 'Onion', 'Potato', 'Banana', 'Mango'],
          preferredPriceRange: 'Fair Market Band',
          paymentPreference: '100% Pre-funded Escrow Direct Bank Deposit',
          gstNumber: '27AAACR1234F1Z5',
          verificationStatus: 'Verified',
          rating: 4.9,
          totalOrders: 18,
          completedOrders: 15
        },
        {
          id: 'KB-8822',
          name: 'Vashi APMC Wholesale Traders Ltd',
          phone: '9977665544',
          password: 'buyer123',
          businessName: 'Shree Ganesh Agro Wholesale Mandi',
          buyerType: 'Wholesaler', // 1.5% commission
          contactPerson: 'Dinesh Shah (Mandi Commission Agent & Trader)',
          businessCategory: 'Regional Mandi Wholesaler',
          state: 'Maharashtra',
          district: 'Navi Mumbai',
          loc: 'Sector 19, Vashi APMC Market, Navi Mumbai',
          deliveryLocations: ['Vashi APMC Fruit & Veg Wing', 'Kalyan Wholesale Yard'],
          requiredCrops: ['Onion', 'Potato', 'Garlic', 'Chili', 'Ginger'],
          gstNumber: '27AABCS5542K1Z9',
          verificationStatus: 'Verified',
          rating: 4.7,
          totalOrders: 24,
          completedOrders: 20
        },
        {
          id: 'KB-8823',
          name: 'FreshBasket Supermarket Stores',
          phone: '9966554433',
          password: 'buyer123',
          businessName: 'Nature Fresh Organic Retail Chain',
          buyerType: 'Retailer', // 2.0% commission
          contactPerson: 'Pooja Deshmukh (Store Operations Lead)',
          businessCategory: 'Urban Supermarket Chain & Hypermarkets',
          state: 'Maharashtra',
          district: 'Pune',
          loc: 'Kothrud & Baner Hubs, Pune',
          deliveryLocations: ['Pune Central Cold Storage', 'Pimpri Outlet'],
          requiredCrops: ['Tomato', 'Grapes', 'Pomegranate', 'Capsicum', 'Cauliflower'],
          gstNumber: '27AABCF9812L1Z3',
          verificationStatus: 'Verified',
          rating: 4.85,
          totalOrders: 12,
          completedOrders: 10
        },
        {
          id: 'KB-8824',
          name: 'Mother Dairy & SAFAL Agro Network',
          phone: '9955443322',
          password: 'buyer123',
          businessName: 'SAFAL Fruit & Vegetable Processing Division',
          buyerType: 'Institutional Buyer', // 1.5% commission
          contactPerson: 'Dr. Anand Joshi (Institutional Supply Officer)',
          businessCategory: 'Food Processing & Government Milk Federation',
          state: 'Maharashtra',
          district: 'Nashik',
          loc: 'Ambad Industrial Area, Nashik',
          deliveryLocations: ['Nashik Processing Plant', 'Mumbai SAFAL Stores'],
          requiredCrops: ['Tomato', 'Soybean', 'Wheat', 'Orange', 'Mango'],
          gstNumber: '27AAACM4412M1Z0',
          verificationStatus: 'Verified',
          rating: 4.95,
          totalOrders: 30,
          completedOrders: 28
        }
      ]);
      console.log('  ✅ Sample Buyers (All 4 Types) Initialized');
    }

    // 5. Seed Crop Listings (Products)
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      await Product.create([
        {
          name: 'Tomato (टमाटर) - Grade A',
          emoji: '🍅',
          price: 3450,
          minPrice: 3200,
          maxPrice: 3700,
          qty: 35,
          farmer: 'Ramesh Kumar Patel',
          sellerId: 'KS-1001',
          loc: 'Dindori, Nashik, Maharashtra',
          cat: 'Vegetables'
        },
        {
          name: 'Nashik Red Onion (लाल प्याज)',
          emoji: '🧅',
          price: 4850,
          minPrice: 4600,
          maxPrice: 5100,
          qty: 60,
          farmer: 'Vitthalrao Shinde',
          sellerId: 'KS-1002',
          loc: 'Niphad, Nashik, Maharashtra',
          cat: 'Vegetables'
        },
        {
          name: 'Soybean (सोयाबीन) - Yellow Bold',
          emoji: '🫘',
          price: 4720,
          minPrice: 4500,
          maxPrice: 4950,
          qty: 45,
          farmer: 'Suresh Tukaram Jadhav',
          sellerId: 'KS-1003',
          loc: 'Baramati, Pune, Maharashtra',
          cat: 'Oilseeds'
        },
        {
          name: 'Bhagwa Pomegranate (सिंदूरी अनार)',
          emoji: '🔴',
          price: 9200,
          minPrice: 8800,
          maxPrice: 9600,
          qty: 25,
          farmer: 'Balasaheb Patil',
          sellerId: 'KS-1004',
          loc: 'Pandharpur, Solapur, Maharashtra',
          cat: 'Fruits'
        },
        {
          name: 'Lokwan Wheat (गेहूं - लोकवन)',
          emoji: '🌾',
          price: 2750,
          minPrice: 2600,
          maxPrice: 2900,
          qty: 80,
          farmer: 'Ramesh Kumar Patel',
          sellerId: 'KS-1001',
          loc: 'Dindori, Nashik, Maharashtra',
          cat: 'Grains'
        }
      ]);
      console.log('  ✅ Sample Crop Listings Initialized');
    }

    // 6. Seed Buyer Requirements
    const reqCount = await Requirement.countDocuments();
    if (reqCount === 0) {
      await Requirement.create([
        {
          reqId: 'KMR-REQ-101',
          buyerId: 'KB-8821',
          buyerName: 'Reliance Retail Agri Procurement',
          buyerType: 'Bulk Buyer',
          buyerPhone: '+91 99887 76655',
          buyerLoc: 'Vashi APMC Hub, Navi Mumbai',
          crop: 'Tomato (टमाटर)',
          quantity: 200,
          unit: 'quintals',
          quality: 'Grade A',
          expectedPriceMin: 3200,
          expectedPriceMax: 3600,
          deliveryLocation: 'Vashi APMC Central Hub',
          requiredByDate: new Date('2026-10-15'),
          preferredFarmerLocation: 'Nashik / Pune Region',
          notes: 'Firm, uniform size, ripe red tomatoes required for hypermarket distribution. 100% pre-funded Escrow payment.',
          status: 'Active',
          offers: [
            {
              farmerId: 'KS-1001',
              farmerName: 'Ramesh Kumar Patel',
              farmerPhone: '+91 98765 43210',
              farmerLoc: 'Dindori, Nashik',
              offeredQty: 35,
              offeredPrice: 3450,
              notes: 'Organic certified Grade A lot ready for harvest.',
              status: 'Pending'
            }
          ]
        },
        {
          reqId: 'KMR-REQ-102',
          buyerId: 'KB-8822',
          buyerName: 'Vashi APMC Wholesale Traders Ltd',
          buyerType: 'Wholesaler',
          buyerPhone: '+91 99776 65544',
          buyerLoc: 'Sector 19, Vashi APMC, Navi Mumbai',
          crop: 'Onion (प्याज)',
          quantity: 150,
          unit: 'quintals',
          quality: 'Grade A',
          expectedPriceMin: 4600,
          expectedPriceMax: 4950,
          deliveryLocation: 'Vashi APMC Wholesale Yard',
          requiredByDate: new Date('2026-10-20'),
          preferredFarmerLocation: 'Nashik (Lasalgaon / Niphad / Yeola)',
          notes: 'Medium to large size red onion. Dry and cured properly.',
          status: 'Active',
          offers: []
        },
        {
          reqId: 'KMR-REQ-103',
          buyerId: 'KB-8824',
          buyerName: 'Mother Dairy & SAFAL Agro Network',
          buyerType: 'Institutional Buyer',
          buyerPhone: '+91 99554 43322',
          buyerLoc: 'Ambad Industrial Area, Nashik',
          crop: 'Soybean (सोयाबीन)',
          quantity: 300,
          unit: 'quintals',
          quality: 'Premium',
          expectedPriceMin: 4550,
          expectedPriceMax: 4850,
          deliveryLocation: 'Nashik Processing Facility',
          requiredByDate: new Date('2026-11-05'),
          preferredFarmerLocation: 'Pune / Ahmednagar / Nashik',
          notes: 'High protein content, moisture < 10%. Direct institutional purchase.',
          status: 'Active',
          offers: []
        },
        {
          reqId: 'KMR-REQ-104',
          buyerId: 'KB-8823',
          buyerName: 'FreshBasket Supermarket Stores',
          buyerType: 'Retailer',
          buyerPhone: '+91 99665 54433',
          buyerLoc: 'Kothrud & Baner Hubs, Pune',
          crop: 'Pomegranate (अनार)',
          quantity: 50,
          unit: 'quintals',
          quality: 'Export Quality',
          expectedPriceMin: 8900,
          expectedPriceMax: 9500,
          deliveryLocation: 'Pune Central Cold Storage',
          requiredByDate: new Date('2026-10-10'),
          preferredFarmerLocation: 'Solapur / Sangli',
          notes: 'Bhagwa variety, ruby red arils, blemish free.',
          status: 'Active',
          offers: []
        }
      ]);
      console.log('  ✅ Sample Buyer Requirements Initialized');
    }

    // 7. Seed Sample Orders with mathematically calculated commission breakdowns
    const orderCount = await Order.countDocuments();
    if (orderCount === 0) {
      await Order.create([
        {
          orderId: 'KMO-2026-DLV-01',
          productName: 'Tomato (टमाटर) - Grade A',
          qty: 25,
          price: 3450,
          offeredPrice: 3450,
          subtotal: 86250,
          totalAmount: 86250,
          cropCategory: 'Vegetables',
          // Buyer: Bulk Buyer (1.0%)
          buyerName: 'Reliance Retail Agri Procurement',
          buyerId: 'KB-8821',
          buyerType: 'Bulk Buyer',
          buyerPhone: '+91 99887 76655',
          buyerLoc: 'Vashi APMC Hub, Navi Mumbai',
          buyerCommissionPct: 1.0,
          buyerCommissionAmount: 863, // 86,250 * 1% = 862.5 -> 863
          buyerTotalAmount: 87113,
          // Seller: 1st Completed Order (0% commission)
          sellerName: 'Ramesh Kumar Patel',
          sellerId: 'KS-1001',
          sellerPhone: '9876543210',
          sellerLoc: 'Dindori, Nashik, Maharashtra',
          farmerOrderNumber: 1,
          farmerCommissionPct: 0.0,
          farmerCommissionAmount: 0,
          farmerNetAmount: 86250,
          // Platform Total Commission Revenue
          platformCommissionRevenue: 863,
          status: 'delivered',
          transportBooked: true,
          shippedAt: new Date(Date.now() - 86400000 * 2),
          transportDetails: {
            vehicle: 'MH-15-EG-4482 (Eicher 14ft)',
            driver: 'Ramesh Shinde (+91 98231 44210)',
            fare: 2200,
            bookingId: 'TRK-9812A'
          },
          escrow: {
            status: 'released',
            heldAt: new Date(Date.now() - 86400000 * 3),
            buyerPaid: true,
            buyerPaidAt: new Date(Date.now() - 86400000 * 3),
            farmerSeesPayment: true,
            farmerApprovedUnload: true,
            farmerApprovedUnloadAt: new Date(Date.now() - 86400000 * 1),
            buyerConfirmedReceived: true,
            buyerConfirmedReceivedAt: new Date(Date.now() - 86400000 * 1),
            releasedAt: new Date(Date.now() - 86400000 * 1)
          },
          createdAt: new Date(Date.now() - 86400000 * 4)
        },
        {
          orderId: 'KMO-2026-DLV-02',
          productName: 'Nashik Red Onion (लाल प्याज)',
          qty: 30,
          price: 4800,
          offeredPrice: 4800,
          subtotal: 144000,
          totalAmount: 144000,
          cropCategory: 'Vegetables',
          // Buyer: Wholesaler (1.5%)
          buyerName: 'Vashi APMC Wholesale Traders Ltd',
          buyerId: 'KB-8822',
          buyerType: 'Wholesaler',
          buyerPhone: '+91 99776 65544',
          buyerLoc: 'Sector 19, Vashi APMC, Navi Mumbai',
          buyerCommissionPct: 1.5,
          buyerCommissionAmount: 2160, // 144,000 * 1.5% = 2,160
          buyerTotalAmount: 146160,
          // Seller: 2nd Completed Order (2% commission)
          sellerName: 'Vitthalrao Shinde',
          sellerId: 'KS-1002',
          sellerPhone: '9822114455',
          sellerLoc: 'Niphad, Nashik, Maharashtra',
          farmerOrderNumber: 2,
          farmerCommissionPct: 2.0,
          farmerCommissionAmount: 2880, // 144,000 * 2% = 2,880
          farmerNetAmount: 141120, // 144,000 - 2,880 = 141,120
          // Platform Total Commission Revenue
          platformCommissionRevenue: 5040, // 2,160 + 2,880 = 5,040
          status: 'delivered',
          transportBooked: true,
          shippedAt: new Date(Date.now() - 86400000 * 4),
          transportDetails: {
            vehicle: 'MH-15-FV-2291 (Tata 407)',
            driver: 'Sunil Gholap (+91 97654 33120)',
            fare: 2800,
            bookingId: 'TRK-7721B'
          },
          escrow: {
            status: 'released',
            heldAt: new Date(Date.now() - 86400000 * 5),
            buyerPaid: true,
            buyerPaidAt: new Date(Date.now() - 86400000 * 5),
            farmerSeesPayment: true,
            farmerApprovedUnload: true,
            farmerApprovedUnloadAt: new Date(Date.now() - 86400000 * 3),
            buyerConfirmedReceived: true,
            buyerConfirmedReceivedAt: new Date(Date.now() - 86400000 * 3),
            releasedAt: new Date(Date.now() - 86400000 * 3)
          },
          createdAt: new Date(Date.now() - 86400000 * 6)
        },
        {
          orderId: 'KMO-2026-ACT-03',
          productName: 'Soybean (सोयाबीन) - Yellow Bold',
          qty: 20,
          price: 4700,
          offeredPrice: 4700,
          subtotal: 94000,
          totalAmount: 94000,
          cropCategory: 'Oilseeds',
          // Buyer: Institutional (1.5%)
          buyerName: 'Mother Dairy & SAFAL Agro Network',
          buyerId: 'KB-8824',
          buyerType: 'Institutional Buyer',
          buyerPhone: '+91 99554 43322',
          buyerLoc: 'Ambad Industrial Area, Nashik',
          buyerCommissionPct: 1.5,
          buyerCommissionAmount: 1410,
          buyerTotalAmount: 95410,
          // Seller: 1st Order (0%)
          sellerName: 'Suresh Tukaram Jadhav',
          sellerId: 'KS-1003',
          sellerPhone: '9890123456',
          sellerLoc: 'Baramati, Pune, Maharashtra',
          farmerOrderNumber: 1,
          farmerCommissionPct: 0.0,
          farmerCommissionAmount: 0,
          farmerNetAmount: 94000,
          platformCommissionRevenue: 1410,
          status: 'payment-held',
          escrow: {
            status: 'held',
            heldAt: new Date(),
            buyerPaid: true,
            buyerPaidAt: new Date(),
            farmerSeesPayment: true
          },
          createdAt: new Date()
        }
      ]);
      console.log('  ✅ Sample Orders with Transparent Commissions Initialized');
    }

    console.log('🎉 Krushi Setu Auto-Seed complete!');
  } catch (err) {
    console.error('Auto-seed error:', err.message);
  }
}

module.exports = autoSeed;

