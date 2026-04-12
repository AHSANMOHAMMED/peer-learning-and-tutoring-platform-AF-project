const mongoose = require('mongoose');
const { initGridFS } = require('./gridfs');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Initialize GridFS bucket
    initGridFS(conn.connection);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    // Delay exit to see logs if needed
    setTimeout(() => process.exit(1), 1000);
  }
};

module.exports = connectDB;
