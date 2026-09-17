const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Loan = require('../models/Loan');

// Multer config for document uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'uploads')),
  filename: (req, file, cb) => cb(null, `loan-doc-${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB max

// ── Get all loans ──
router.get('/', async (req, res) => {
  try {
    const loans = await Loan.find().sort({ date: -1 });
    res.json(loans);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ── Get loans by farmer ──
router.get('/farmer/:farmerId', async (req, res) => {
  try {
    const loans = await Loan.find({ farmerId: req.params.farmerId });
    res.json(loans);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ── Verify Aadhaar & PAN (simulated) ──
router.post('/verify-aadhaar', (req, res) => {
  const { aadhaar, pan } = req.body;

  // Validate Aadhaar: 12 digits
  const aadhaarClean = (aadhaar || '').replace(/\s/g, '');
  if (!/^\d{12}$/.test(aadhaarClean)) {
    return res.status(400).json({ error: 'Invalid Aadhaar. Must be 12 digits.' });
  }

  // Validate PAN: 5 letters + 4 digits + 1 letter
  const panClean = (pan || '').toUpperCase().trim();
  if (!/^[A-Z]{5}\d{4}[A-Z]$/.test(panClean)) {
    return res.status(400).json({ error: 'Invalid PAN format. Must be like ABCDE1234F.' });
  }

  // Simulate: mask and return mobile
  const maskedAadhaar = `XXXX XXXX ${aadhaarClean.slice(-4)}`;
  const maskedPan = `${panClean.slice(0, 4)}***${panClean.slice(-2)}`;
  const maskedMobile = `${9000000000 + Math.floor(Math.random() * 999999999)}`;
  const mobileDisplay = `XXXXXX${maskedMobile.slice(-4)}`;

  res.json({
    success: true,
    maskedAadhaar,
    maskedPan,
    mobileDisplay,
    message: 'OTP sent to Aadhaar-linked mobile number'
  });
});

// ── Verify OTP (simulated — any 6-digit code works) ──
router.post('/verify-otp', (req, res) => {
  const { otp } = req.body;
  const otpClean = (otp || '').trim();

  if (!/^\d{6}$/.test(otpClean)) {
    return res.status(400).json({ error: 'Invalid OTP. Must be 6 digits.' });
  }

  // Simulate — always succeeds for demo
  res.json({ success: true, message: 'OTP verified successfully! ✅' });
});

// ── Upload documents ──
router.post('/upload-docs', upload.fields([
  { name: 'rationCard', maxCount: 1 },
  { name: 'incomeCert', maxCount: 1 },
  { name: 'landRecord', maxCount: 1 },
  { name: 'bankStatement', maxCount: 1 },
]), (req, res) => {
  try {
    const docs = {};
    if (req.files.rationCard) docs.rationCard = req.files.rationCard[0].filename;
    if (req.files.incomeCert) docs.incomeCert = req.files.incomeCert[0].filename;
    if (req.files.landRecord) docs.landRecord = req.files.landRecord[0].filename;
    if (req.files.bankStatement) docs.bankStatement = req.files.bankStatement[0].filename;

    res.json({ success: true, documents: docs, message: 'Documents uploaded successfully!' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Generate CIBIL Score (simulated) ──
router.post('/generate-cibil', (req, res) => {
  // Generate a realistic CIBIL score between 600-850
  const score = Math.floor(Math.random() * 251) + 600; // 600–850

  // Generate breakdown percentages
  const paymentHistory = Math.floor(Math.random() * 21) + 75;  // 75-95%
  const creditUtilization = Math.floor(Math.random() * 31) + 20; // 20-50%
  const creditAge = Math.floor(Math.random() * 11) + 3;          // 3-13 years
  const enquiries = Math.floor(Math.random() * 4);               // 0-3

  res.json({
    success: true,
    cibilScore: score,
    cibilBreakdown: { paymentHistory, creditUtilization, creditAge, enquiries },
    category: score >= 750 ? 'Excellent' : score >= 650 ? 'Good' : score >= 550 ? 'Fair' : 'Poor',
  });
});

// ── Global interest rate (stored in memory for simplicity) ──
let interestRate = 7;
router.get('/rate', (req, res) => res.json({ rate: interestRate }));
router.put('/rate', (req, res) => {
  interestRate = parseFloat(req.body.rate) || 7;
  res.json({ rate: interestRate });
});

// ── Submit loan application (with all KYC data) ──
router.post('/', async (req, res) => {
  try {
    const l = await Loan.create(req.body);
    res.json(l);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ── Update loan (general) ──
router.put('/:id', async (req, res) => {
  try {
    const l = await Loan.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(l);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ── Admin verify (approve/reject with remarks) ──
router.put('/:id/verify', async (req, res) => {
  try {
    const { status, adminRemarks } = req.body;
    const l = await Loan.findByIdAndUpdate(req.params.id, { status, adminRemarks }, { new: true });
    res.json(l);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
