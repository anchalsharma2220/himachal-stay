require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');
const User = require('./src/models/User');
const { seedDatabase } = require('./src/seed/seed');

const PORT = process.env.PORT || 5000;

(async () => {
  if (!process.env.JWT_SECRET) {
    console.error('Missing JWT_SECRET. Copy .env.example to .env first.');
    process.exit(1);
  }
  try {
    await connectDB();
    if (process.env.AUTO_SEED === 'true' && (await User.countDocuments()) === 0) {
      console.log('Empty database detected - inserting demo data...');
      await seedDatabase();
    }
    app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
  } catch (err) {
    console.error('Startup failed:', err.message);
    process.exit(1);
  }
})();
