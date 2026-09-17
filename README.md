# 🌾 KrushiSetu (कृषिसेतु) — Direct Farmer-to-Buyer Linkage & Dynamic Price Discovery Platform

[![Smart India Hackathon](https://img.shields.io/badge/SIH--2026-Problem%20SIH26132-brightgreen?style=for-the-badge&logo=github)](https://github.com/Vaishuu17/-KrushiSetu)
[![Stack](https://img.shields.io/badge/MERN-MongoDB%20%7C%20Express%20%7C%20React%20%7C%20Node-blue?style=for-the-badge&logo=react)](https://github.com/Vaishuu17/-KrushiSetu)
[![License](https://img.shields.io/badge/License-MIT-orange?style=for-the-badge)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Production%20Ready-success?style=for-the-badge)]()

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/Vaishuu17/-KrushiSetu)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Vaishuu17/-KrushiSetu)

> **Eliminating Middlemen, Eliminating Hidden Fees.**  
> *KrushiSetu* is a next-generation agricultural marketplace that empowers farmers with **Net Realization Score (NRS)** price discovery, **Razorpay Escrow Protection**, **Dynamic Commission Engine**, **Zomato-style Real-time Delivery Radar**, and **Multilingual AI Voice Assistance**.

---

## 📌 Executive Overview

Traditional mandi price tickers show **gross rates** that mislead farmers by ignoring transport freight, unloading fees, APMC taxes, and broker commissions (which swallow up to 20–30% of a farmer's earnings). 

**KrushiSetu** solves this by shifting from gross price tickers to **Net Realization Score (NRS)**—calculating exact in-hand profit before a farmer leaves their village.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        🌾 THE KRUSHISETU BRIDGE                        │
│                                                                        │
│   [ Farmer ] ───► [ NRS Smart Rank ] ───► [ Escrow Funding ]          │
│        ▲                                       │                       │
│        │                                       ▼                       │
│   [ 0% 1st Deal ] ◄─── [ Live Radar ] ◄─── [ Razorpay Pay ]            │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Key Platform Pillars & Innovations

### 1. 📊 Net Realization Score (NRS) Engine
Calculates true in-hand profit for farmers based on their location and target APMC mandis:
$$\text{NRS} = \text{Mandi Gross Price} - \text{Transport Freight} - \text{Unloading Fee} - \text{Platform Fee}$$
* Mandis are ranked by **true in-hand profit** rather than deceptive gross rate tickers.

### 2. 💸 Centralized Dynamic Commission Engine
- **Farmer 0% First-Deal Benefit:** 0% commission on the farmer's first transaction (2% thereafter).
- **Tiered Buyer Rates:** Bulk Buyer (1.0%), Wholesaler (1.5%), Retailer (2.0%).
- **Farmer Welfare Fund:** 10–12% of every platform commission fee is automatically routed into a dedicated community welfare & crop insurance fund.

### 3. 🔒 Razorpay Test Mode Escrow Protection
- Buyer funds the deal directly into platform Escrow using Razorpay modal (UPI, NetBanking, Cards).
- Payment is securely locked while the farmer dispatches the shipment.
- Funds automatically release to the farmer's bank account upon buyer digital quality inspection pass.

### 4. 🚚 Zomato / Blinkit Style Live Delivery Tracker Modal
- Interactive delivery radar featuring live route progress bar, ETA countdown, vehicle speed indicator, driver profile, gate pass security OTP code, and step-by-step shipment timeline.

### 5. 🤖 Multilingual Voice Assistant & Multi-Language Support
- Voice Assistant built with Web Speech API (`SpeechRecognition` & `SpeechSynthesis`) supporting **English, Hindi, and Marathi**.
- Seamless UI language toggle in farmer and buyer portals with localized translations.

### 6. 📈 Smart Sell AI Decision System
- 15-day forward price trend projection (LSTM/Prophet-inspired algorithms) giving clear recommendations: **"SELL NOW"** vs. **"HOLD 7 DAYS (+14% Expected)"**.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
|---|---|
| **Frontend** | React 18 (Vite), Tailwind CSS, Lucide Icons, Chart.js / Recharts |
| **Backend** | Node.js, Express.js REST APIs, Mongoose ORM |
| **Database** | MongoDB / MongoDB Atlas |
| **Payment Gateway**| Razorpay API (Test Mode Checkout & Webhooks) |
| **Voice / AI** | Web Speech API (SpeechRecognition, SpeechSynthesis) |
| **Styling & UI** | Custom Glassmorphism, Responsive Mobile-First Design |

---

## 📂 Project Architecture

```
KrushiSetu/
└── Final Project/
    ├── client/                        # React Frontend (Vite)
    │   ├── src/
    │   │   ├── components/            # Reusable UI (Delivery Tracker, Language Selector, etc.)
    │   │   ├── context/               # Global Language & State Management Contexts
    │   │   ├── locales/               # English, Hindi, Marathi Translations
    │   │   ├── pages/
    │   │   │   ├── Home.jsx           # Landing Page
    │   │   │   ├── Register.jsx       # Multi-role Auth (Farmer, Buyer, Admin)
    │   │   │   ├── farmer/            # Farmer Portal (9 Specialized Sections)
    │   │   │   ├── buyer/             # Buyer Portal (7 Procurement Sections)
    │   │   │   └── admin/             # Admin Command Center & Analytics
    │   └── package.json
    └── server/                        # Express Backend
        ├── models/                    # MongoDB Schemas (Farmer, Buyer, Order, PlatformConfig, etc.)
        ├── routes/                    # API Endpoints (Auth, Farmers, Buyers, Orders, Payment, Prices)
        ├── services/                  # Business Logic (Commission Engine, Escrow)
        ├── cleanResetDb.js            # Seed & Database Utility
        └── index.js                   # Server Entry Point
```

---

## ⚡ Quick Start & Local Setup

### Prerequisites
- Node.js (v18.x or later)
- MongoDB running locally on `mongodb://localhost:27017` or MongoDB Atlas URI

### 1. Clone Repository
```bash
git clone https://github.com/Vaishuu17/-KrushiSetu.git
cd -KrushiSetu/"Final Project"
```

### 2. Backend Setup
```bash
cd server
npm install
```

Create a `.env` file in `server/` directory:
```env
PORT=8000
MONGO_URI=mongodb://localhost:27017/krushisetu
JWT_SECRET=krushisetu_super_secret_key_2026
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

Seed Database (Optional):
```bash
node seed.js
# or node cleanResetDb.js
```

Start Server:
```bash
npm start
```
*Backend runs on `http://localhost:8000`*

---

### 3. Frontend Setup
```bash
cd ../client
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`*

---

## 🏆 Key Dashboards & User Portals

### 🧑‍🌾 Farmer Portal (`/farmer/dashboard`)
1. **Overview:** Focus crop, live NRS top-mandi rank, 7-day forecast advice.
2. **Market Prices (NRS):** Nearest APMC mandis sorted by net in-hand earnings.
3. **Smart Sell AI:** 15-day forward price trend curve with hold vs. sell signals.
4. **Marketplace:** Post farm produce listings with photos, tonnage, and target price.
5. **Buyer Requirements:** Browse buyer demands and accept contracts instantly.
6. **Orders & Escrow:** Track deal status, dispatch shipments, view live GPS radar, and trigger payout release.
7. **Government Schemes:** PM-KISAN, PMFBY eligibility checkers and guides.
8. **KrushiSetu AI Voice Assistant:** Voice-enabled assistant in Hinglish/English.
9. **Farmer Profile:** Verification, land details, and earnings summary.

### 🏢 Buyer Portal (`/buyer/dashboard`)
1. **Overview:** Active orders, total spend, dynamic buyer tier badge.
2. **Browse Marketplace:** Search & filter fresh produce listings.
3. **Post Requirement:** Publish bulk crop requirements with target price cap.
4. **Orders & Escrow:** Lock deal with **Razorpay**, track delivery with live radar, and authorize payment release upon inspection.
5. **Business Profile:** Business verification, GSTIN, and order history.

### 🛡️ Admin Command Center (`/admin/dashboard`)
- Real-time revenue analytics & platform commission statistics.
- Farmer Welfare Fund accumulation tracker.
- User management (Farmers, Buyers verification & management).
- Dynamic Commission Engine configurations.

---

## 👥 Team & Acknowledgments

- **Team Name:** AI Innovators  
- **Hackathon:** Smart India Hackathon 2026 (SIH 2026)  
- **Problem Statement:** SIH26132 — Direct Farmer-to-Buyer Linkage & Real-Time Price Discovery  

---

<p align="center">
  Made with ❤️ by <b>AI Innovators</b> for the Farmers of India 🇮🇳
</p>
