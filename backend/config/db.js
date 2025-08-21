import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      family: 4, // Use IPv4, skip trying IPv6
      maxPoolSize: 10, // Maintain up to 10 socket connections
      minPoolSize: 5, // Maintain at least 5 socket connections
      maxIdleTimeMS: 30000, // Close connections after 30s of inactivity
      retryWrites: true,
      w: 'majority'
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('Database connection error:', error.message);
    
    // Fallback: Try with minimal options
    console.log('Attempting fallback connection...');
    try {
      const fallbackConn = await mongoose.connect(process.env.MONGODB_URI.split('?')[0], {
        serverSelectionTimeoutMS: 10000,
        family: 4
      });
      console.log(`MongoDB Connected (Fallback): ${fallbackConn.connection.host}`);
      return fallbackConn;
    } catch (fallbackError) {
      console.error('Fallback connection also failed:', fallbackError.message);
      console.log('Please check your internet connection and MongoDB Atlas configuration');
      // Don't exit the process, just log the error
      return null;
    }
  }
};

export default connectDB;
