const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    // Construire l'URI MongoDB à partir des variables d'environnement
    let mongoURI;
    
    if (process.env.MONGODB_URI) {
      // Utiliser l'URI complet si fourni
      mongoURI = process.env.MONGODB_URI;
      logger.info('📋 Using complete MONGODB_URI');
    } else {
      // Construire l'URI à partir des variables individuelles
      const username = process.env.MONGODB_USERNAME || 'admin';
      const password = process.env.MONGODB_PASSWORD;
      const database = process.env.MONGODB_DATABASE || 'realestate_auth';
      const host = process.env.MONGODB_HOST || 'localhost';

      if (password) {
        mongoURI = `mongodb+srv://${username}:${password}@${host}/${database}?retryWrites=true&w=majority&appName=Cluster0`;
        logger.info(`📋 Building MongoDB URI from individual variables - Database: ${database}`);
      } else {
        mongoURI = `mongodb://${host}:27017/${database}`;
        logger.info(`📋 Building local MongoDB URI - Database: ${database}`);
      }
    }
    
    const options = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4
    };

    const conn = await mongoose.connect(mongoURI, options);

    logger.info(`🗄️  MongoDB Connected: ${conn.connection.host}`);

    // Connection events
    mongoose.connection.on('connected', () => {
      logger.info('MongoDB connection established');
    });

    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    logger.error('Database connection failed:', error);
    process.exit(1);
  }
};

module.exports = connectDB;