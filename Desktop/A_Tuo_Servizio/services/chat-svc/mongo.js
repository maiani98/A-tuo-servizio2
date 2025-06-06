// MongoDB Connection Setup using Mongoose
const mongoose = require('mongoose');

// Placeholder for MongoDB connection string
// In a real application, this would come from environment variables
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/chat_db';

/**
 * Connects to MongoDB using Mongoose.
 */
async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI, {
      // These options are no longer needed for Mongoose 6+ but are good practice for older versions
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
      // useCreateIndex: true, // For Mongoose < 6.0
      // useFindAndModify: false, // For Mongoose < 6.0
    });
    console.log('MongoDB connected successfully.');

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected.');
    });

  } catch (err) {
    console.error('Error connecting to MongoDB:', err.message);
    // Exit process with failure in case of initial connection error
    process.exit(1);
  }
}

module.exports = { connectDB };
