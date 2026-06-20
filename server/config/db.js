const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB Connection Failed:', error.message);
    console.error('💡 Check your MONGODB_URI in .env file');
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => console.warn('⚠️  MongoDB disconnected'));
mongoose.connection.on('reconnected', () => console.log('✅ MongoDB reconnected'));

module.exports = connectDB;
