require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const { seedDatabase } = require('./seed');

(async () => {
  try { await connectDB(); await seedDatabase(); } catch (e) { console.error(e); process.exitCode = 1; }
  await mongoose.disconnect();
})();
