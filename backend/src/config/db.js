const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || '';

  // Debug: log first 30 chars of URI to confirm it's being read correctly
  console.log(`[DB] MONGODB_URI starts with: "${uri.substring(0, 30)}..." (length: ${uri.length})`);

  if (!uri) {
    console.error('[DB] MONGODB_URI is not set');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`[DB] MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error('[DB] MongoDB connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
