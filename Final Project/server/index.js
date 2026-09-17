const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config();

const app = express();
const PREFERRED_PORT = parseInt(process.env.PORT) || 8000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/farmers', require('./routes/farmers'));
app.use('/api/products', require('./routes/products'));
app.use('/api/schemes', require('./routes/schemes'));

app.use('/api/gi', require('./routes/giProducts'));
app.use('/api/chat', require('./routes/chatqa'));
app.use('/api/chatai', require('./routes/chatai'));
app.use('/api/prices', require('./routes/prices'));
app.use('/api/weather', require('./routes/weather'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/requirements', require('./routes/requirements'));
app.use('/api/config', require('./routes/platformConfig'));
app.use('/api/buyers', require('./routes/buyers'));
app.use('/api/shared-trips', require('./routes/sharedTrips'));
app.use('/api/loans', require('./routes/loans'));
app.use('/api/payment', require('./routes/payment'));

const autoSeed = require('./seed');

if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => {
      console.log('✅ MongoDB connected');
      autoSeed();
    })
    .catch((err) => console.error('MongoDB error:', err.message));
} else {
  console.warn('⚠️ MONGO_URI is not set in environment variables');
}

app.get('/', (req, res) => res.send('🌾 KrushiSetu API Running'));

// Dynamic port — try preferred port, if busy try next ones
function startServer(port, maxRetries = 10) {
  const server = app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
    try {
      // Write active port to a file so client can read it
      const portFile = path.join(__dirname, '..', '.active_port');
      fs.writeFileSync(portFile, String(port));
    } catch (e) {
      // Ignore file system write errors on cloud hosting
    }
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE' && maxRetries > 0) {
      console.log(`⚠️ Port ${port} is busy, trying ${port + 1}...`);
      startServer(port + 1, maxRetries - 1);
    } else {
      console.error('❌ Server failed to start:', err.message);
      process.exit(1);
    }
  });
}

if (require.main === module) {
  startServer(PREFERRED_PORT);
}

module.exports = app;
