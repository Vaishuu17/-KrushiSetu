# 🌾 KrushiSetu — Comprehensive Platform Report & Systems Audit

**Project Name:** KrushiSetu (Realistic Digital Agriculture Marketplace)  
**Hackathon:** Smart India Hackathon (SIH 2026)  
**Problem Statement:** SIH26132 — Direct Farmer-to-Buyer Linkage & Real-Time Price Discovery  
**Team Name:** AI Innovators  
**Document Purpose:** Complete Page-by-Page Technical Audit, System Workflow Architecture & Business Model Documentation  
**Platform Version:** v2.0 (Production Build Verified)  
**Live Access:** Frontend: `http://localhost:5173` | Backend API: `http://localhost:8000`

---

## 1. Executive Summary & Core Philosophy

Traditional agricultural market portals display gross mandi rate tickers that mislead farmers. They fail to account for transportation freight, unloading charges, mandi taxes, or hidden broker commissions (which typically swallow 20–30% of a farmer's income).

**KrushiSetu** solves this through four core mathematical and technical pillars:

1. **Net Realization Score (NRS):** Calculates true in-hand net farmer profit:
   $$\text{NRS} = \text{Mandi Gross Price} - \text{Transport Freight} - \text{Unloading Fee} - \text{Platform Fee}$$
   Mandis are ranked by true in-hand profit rather than gross rate tickers.
2. **Centralized Dynamic Commission Engine:**
   - Tiered buyer commission rates (Bulk Buyer 1.0%, Wholesaler 1.5%, Retailer 2.0%).
   - **0% Commission on Farmer's First Deal** (2.0% on subsequent deals).
   - **Farmer Welfare Fund:** 10–12% of platform commission is automatically allocated for community welfare and insurance subsidies.
3. **Razorpay Test Mode Escrow Protection:**
   - Buyer pre-funds deal into platform Escrow using Razorpay modal (UPI, Cards, NetBanking).
   - Farmer receives instant payment confirmation and dispatches shipment.
   - Payout releases to farmer bank account upon buyer digital quality inspection pass.
4. **Zomato/Blinkit Style Live GPS Delivery Radar:**
   - Real-time animated route tracking, ETA countdown, vehicle speed, driver contact details, gate pass security OTP, and step-by-step milestone timeline.

---

## 2. Page-by-Page & Section Breakdown

### 2.1 Public Landing & Authentication Pages
- **Home Page (`Home.jsx`):** System workflow overview (4 stages), Core Innovations & USPs, economic & social impact cards, live server link. Language selector removed from landing page per user design requirement (language selector appears inside portals after login).
- **Portal Login & Registration (`Register.jsx`):** Multi-role registration (Farmer, Buyer, Admin) with state & district drop-downs, 12-digit Aadhaar formatting, PAN validation, and demo credentials switch.

---

### 2.2 Farmer Portal (`FarmerDashboard.jsx`)
All 9 active sections:

1. **Dashboard Overview (`f-overview`):**
   - Focus crop selector (Tomato, Onion, Potato, etc.).
   - Live NRS top-mandi profit rank card.
   - 7-Day Price Forecast advice ('SELL NOW' vs 'HOLD 7D').
   - Government schemes preview.
2. **Market Prices & NRS (`f-prices`):**
   - GPS-based APMC mandi rankings (50km–150km radius).
   - Net profit calculation breakdown (Gross price vs Transport cost vs Net in-hand).
3. **Smart Sell AI Decision (`f-decision`):**
   - LSTM & Prophet time-series price trend curve (15-day forward projection).
   - Clear recommendation: *Hold 7 Days (+14% Expected)* or *Sell Immediately*.
4. **Sell Crop & Listings (`f-marketplace`):**
   - Farmer crop listing form: commodity, quantity (quintals), asking price, location, photos, grade.
5. **Buyer Requirements (`f-requirements`):**
   - Live buyer demand listings. Farmers can view price caps, quantity required, and click *Accept & Lock Contract*.
6. **My Orders & Escrow (`f-orders`):**
   - Complete deal lifecycle tracking.
   - Action buttons: *Accept Offer*, *Mark Shipment Dispatched*, *⚡ Track Live Delivery* (Zomato style modal), and *💰 Release Payout*.
7. **Government Schemes (`f-schemes`):**
   - PM-KISAN, PMFBY, AIF scheme details, eligibility checkers, and application step-by-step guides.
8. **KrushiSetu Voice Assistant (`f-chatbot`):**
   - Hinglish & English conversational voice bot with Web Speech API integration (SpeechRecognition & SpeechSynthesis).
   - Direct section navigation triggers (*🚀 Open Relevant Section*).
9. **Farmer Profile (`f-profile`):**
   - Personal records, bank account details, land holdings, primary crops, and lifetime earnings summary.

*(Note: The Loan section has been removed from the farmer portal per user request).*

---

### 2.3 Buyer Portal (`BuyerDashboard.jsx`)
All 7 active sections:

1. **Buyer Overview (`b-overview`):**
   - Buyer type badge (Bulk Buyer 1.0%, Wholesaler 1.5%, Retailer 2.0%).
   - Total spent KPI, active escrow contracts, pending action alerts.
   - Fresh farm listings grid with direct procurement links.
2. **Browse Market & Listings (`b-market`):**
   - Crop marketplace with filter by category, location, and price. Direct *Procure Now* button.
3. **Market Prices & Mandis (`b-prices`):**
   - Mandi arrivals and price discovery radar across Maharashtra APMCs.
4. **Post Requirement (`b-post-req`):**
   - Bulk procurement posting form for crop requirements, tonnage, max price, and delivery location.
5. **My Demands & Offers (`b-my-reqs`):**
   - Requirement status management and farmer proposal review.
6. **Orders & Escrow (`b-orders`):**
   - **Razorpay Test Mode Integration:** Lock payment via real Razorpay checkout modal (UPI, Card, NetBanking).
   - **Zomato/Blinkit Style Delivery Radar:** Live tracking modal with route progress, driver card, and gate pass code.
   - *Confirm Quality Pass & Release Payment* action.
7. **Buyer Business Profile (`b-profile`):**
   - Buyer company details, GSTIN, business license, bank account for refunds, and procurement history.

---

### 2.4 Admin Command Center (`AdminDashboard.jsx`)
All 14 active management sections:

1. **Platform Overview / Analytics (`a-analytics`):** Gross GMV, Platform Commission Revenue, Farmer Net Revenue, Active Deals.
2. **Revenue & Commission (`a-revenue`):** Itemized breakdown by buyer tier, crop category, and monthly GMV trends.
3. **Profit & Loss Statement (`a-pnl`):** Gross revenue minus server/SMS/operating costs yielding Net Profit/Loss.
4. **Farmer Welfare Fund (`a-welfare`):** Monitors 10–12% platform revenue contribution dedicated to farmer community welfare.
5. **Commission Rates Engine (`a-commissions`):** Dynamic control over buyer commission rates (1.0%–3.0%) and farmer waivers.
6. **Buyers & KYC (`a-buyers`):** Buyer verification, GSTIN review, and account status controls.
7. **Farmers Registry (`a-farmers`):** Farmer database with expandable detail rows, search & filter tabs, and Suspend/Restore toggle.
8. **Marketplace Admin (`a-marketplace`):** CRUD control over live marketplace crop listings.
9. **Govt Schemes Admin (`a-schemes`):** CRUD management for government schemes and eligibility rules.
10. **Market Prices Admin (`a-prices`):** Daily MSP and mandi rate update table.
11. **Transport & Fleet Admin (`a-transport`):** Vehicle fleet monitoring, driver rosters, and trip tracking.
12. **GI Products Certification (`a-gi`):** GI (Geographical Indication) product certification registry and premium multipliers.
13. **Chatbot Knowledge Base (`a-chatbot`):** Q&A trigger keywords, usage analytics, and multi-language answers.
14. **Weather Intelligence Radar (`a-weather`):** 10-district Maharashtra weather radar with auto farming advisories.

---

## 3. Technology Stack & Architecture

| Layer | Technology |
|-------|------------|
| **Frontend Framework** | React 19, Vite 8, React Router v7 |
| **Backend API** | Node.js, Express 4.21, JWT Authentication, Multer |
| **Database** | MongoDB (Mongoose ORM) with auto-seeding engine |
| **Payment Gateway** | Razorpay Test Mode API (HMAC SHA-256 signature verification) |
| **AI Engine** | Google Gemini AI API (`@google/genai` 2.2) |
| **Voice Speech** | Web Speech API (SpeechRecognition + SpeechSynthesis) |
| **Styling & UI** | Custom CSS Variable System, Responsive Grid |

---

## 4. Report Summary & Verification
Both PDF and Markdown versions of this document are generated and stored in:  
📁 `KrushiSetu_Complete_Project_Report/`

- **PDF File:** `KrushiSetu_Comprehensive_Platform_Report.pdf`
- **Markdown File:** `KrushiSetu_Comprehensive_Platform_Report.md`

*Build Verified & Master Branch Ready.*
