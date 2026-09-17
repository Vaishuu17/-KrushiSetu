const express = require('express');
const router = express.Router();
const { GoogleGenAI } = require('@google/genai');

// Models
const Price = require('../models/Price');
const Scheme = require('../models/Scheme');
const Product = require('../models/Product');
const Loan = require('../models/Loan');
const Weather = require('../models/Weather');
const GIProduct = require('../models/GIProduct');
const Order = require('../models/Order');
const Farmer = require('../models/Farmer');

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Fetch all relevant system data from MongoDB to use as AI context
 */
async function getSystemContext() {
  const [prices, schemes, products, loans, weather, giProducts, orders] = await Promise.all([
    Price.find().lean(),
    Scheme.find().lean(),
    Product.find().lean(),
    Loan.find().sort({ date: -1 }).limit(20).lean(),
    Weather.findOne().sort({ updatedAt: -1 }).lean(),
    GIProduct.find().lean(),
    Order.find().sort({ createdAt: -1 }).limit(20).lean(),
  ]);

  // Build a structured context string
  let context = `=== KRUSHISETU SYSTEM DATA (LIVE FROM DATABASE) ===\n\n`;

  // --- Market Prices ---
  if (prices.length > 0) {
    context += `📊 MARKET PRICES (${prices.length} crops):\n`;
    prices.forEach(p => {
      context += `  • ${p.crop}: MSP ₹${p.msp}/qtl, Mandi ₹${p.mandi}/qtl, Change: ${p.change} ${p.trend}\n`;
    });
    context += '\n';
  }

  // --- Government Schemes ---
  if (schemes.length > 0) {
    context += `🏛️ GOVERNMENT SCHEMES (${schemes.length}):\n`;
    schemes.forEach(s => {
      context += `  • ${s.name}: ${s.benefit} | Eligibility: ${s.elig} | Status: ${s.status}\n`;
      context += `    Description: ${s.desc}\n`;
      context += `    Documents needed: ${s.docs.join(', ')}\n`;
    });
    context += '\n';
  }

  // --- Products on Marketplace ---
  if (products.length > 0) {
    context += `🛒 MARKETPLACE PRODUCTS (${products.length} listed):\n`;
    products.forEach(p => {
      context += `  • ${p.emoji} ${p.name}: ₹${p.price}/qtl, Qty: ${p.qty} qtl, Farmer: ${p.farmer}, Location: ${p.loc}, Category: ${p.cat}\n`;
    });
    context += '\n';
  } else {
    context += `🛒 MARKETPLACE: No products currently listed. Farmers can list their crops in the Products section.\n\n`;
  }

  // --- Loans ---
  if (loans.length > 0) {
    context += `💰 RECENT LOANS (${loans.length}):\n`;
    loans.forEach(l => {
      context += `  • Farmer: ${l.farmer}, Amount: ₹${l.amount}, Purpose: ${l.purpose}, Rate: ${l.rate}%, Duration: ${l.duration} months, Status: ${l.status}\n`;
    });
    context += '\n';
  }

  // --- Weather ---
  if (weather) {
    context += `🌤️ CURRENT WEATHER:\n`;
    context += `  Temperature: ${weather.temp}°C, Humidity: ${weather.humid}%, Wind: ${weather.wind} km/h, Rain: ${weather.rain}mm\n`;
    context += `  Condition: ${weather.cond}\n`;
    context += `  Advisory: ${weather.adv}\n\n`;
  }

  // --- GI Products ---
  if (giProducts.length > 0) {
    context += `🏷️ GI-TAGGED PRODUCTS (${giProducts.length}):\n`;
    giProducts.forEach(g => {
      context += `  • ${g.name}: Origin: ${g.origin}, State: ${g.state}, Status: ${g.status}, Journey: ${g.journey.join(' → ')}\n`;
    });
    context += '\n';
  }

  // --- Orders ---
  if (orders.length > 0) {
    context += `📦 RECENT ORDERS (${orders.length}):\n`;
    orders.forEach(o => {
      context += `  • Order ${o.orderId || 'N/A'}: ${o.productName}, Qty: ${o.qty}, ₹${o.totalAmount || o.price * o.qty}, Buyer: ${o.buyerName}, Seller: ${o.sellerName}, Status: ${o.status}\n`;
    });
    context += '\n';
  }

  return context;
}

/**
 * Build the system prompt for Gemini
 */
function buildSystemPrompt(systemData, lang) {
  const isHindi = lang === 'hi';

  return `You are KrishiSetu AI — the intelligent farming and market linkage assistant developed by Team AI Inovators for Smart India Hackathon 2026 (Problem Statement SIH26132: Strengthening market linkages and price discovery for farmers).

YOUR CORE CAPABILITIES & INNOVATIONS:
1. Net Realization Score (NRS):
   - Formula: Net In-Hand Profit = Mandi Rate - Transport Cost - Middleman Commission % (KrishiSetu offers 0% commission vs traditional 20-30% middleman cut).
   - Help farmers rank mandis by TRUE profit, not just the gross headline price.
2. 7-15 Day Price Trend Forecast:
   - Provide "Sell Now" vs "Hold 7D" data-driven guidance based on LSTM/Prophet time-series trends, arrivals, and seasonality.
3. Direct Market Linkage:
   - Connect farmers directly to verified bulk buyers and FPOs with zero commission and escrow safety.
4. Government Schemes:
   - Guide farmers on PM-KISAN, PMFBY, AIF, PKVY, etc., eligibility, documents, and application steps.

LANGUAGE INSTRUCTIONS:
- You understand Hinglish (e.g. "4aj tamatar bechu??", "kaha bechna faydemand hai", "pyaz ka bhav badhega kya"), Hindi, and English.
- ${isHindi ? 'Respond in simple, friendly Hindi (or natural Hinglish where appropriate) that Indian farmers easily understand.' : 'Respond in simple, friendly Hinglish or English that Indian farmers easily understand.'}
- Be encouraging, respectful (address with "Kisan bhai" or "Aap"), and practical.
- Use emojis (🌾, 💰, 📈, 🏛️, 🚚, 🤝) to keep responses clear and engaging.
- Keep answers actionable and concise (3-5 sentences).

NAVIGATION TAGS:
When relevant, append one navigation tag on its OWN LINE at the end of your reply:
- Price discovery / Mandi rates / NRS → [NAV:f-nrs:CropName]
- Price forecasting / Sell vs Hold → [NAV:f-forecast:CropName]
- Direct Buyers / FPOs / Selling → [NAV:f-buyers:CropName]
- Government schemes / PM-KISAN → [NAV:f-schemes:SchemeName]
- Weather → [NAV:f-overview:]
- Dashboard / Summary → [NAV:f-overview:]

${systemData}

Remember: You are KrishiSetu AI, empowering Bharat's kisans to get maximum in-hand profits and direct market linkage!`;
}

/**
 * POST /api/chatai
 * Body: { message: string, lang?: 'en' | 'hi', history?: [{role, text}] }
 */
router.post('/', async (req, res) => {
  try {
    const { message, lang = 'en', history = [] } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Fetch live system data
    const systemData = await getSystemContext();

    // Build conversation history for context
    const contents = [];

    // Add recent history (last 10 messages for context window)
    const recentHistory = history.slice(-10);
    for (const msg of recentHistory) {
      contents.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }],
      });
    }

    // Add current user message
    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    // Call Gemini
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        systemInstruction: buildSystemPrompt(systemData, lang),
        maxOutputTokens: 1024,
        temperature: 0.7,
      },
    });

    const reply = response.text || 'Sorry, I could not generate a response. Please try again.';

    res.json({ reply, source: 'gemini-ai' });
  } catch (error) {
    console.error('ChatAI Error:', error.message);

    // Fallback message
    const fallback = req.body.lang === 'hi'
      ? 'माफ़ करें, AI सहायक अभी उपलब्ध नहीं है। कृपया किसान हेल्पलाइन 1800-180-1551 पर कॉल करें।'
      : 'Sorry, the AI assistant is currently unavailable. Please call Kisan Helpline 1800-180-1551 (toll-free).';

    res.status(500).json({ reply: fallback, error: error.message, source: 'fallback' });
  }
});

module.exports = router;
