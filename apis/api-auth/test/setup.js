// Setup pour les tests
require('dotenv').config({ path: '.env.test' });
const mongoose = require('mongoose');

// Mock du service email pour éviter les vrais envois 
jest.mock('../src/services/emailService', () => ({
  sendEmail: jest.fn().mockResolvedValue({ messageId: 'test-id' }),
  sendVerificationEmail: jest.fn().mockResolvedValue({ messageId: 'test-id' }),
  sendPasswordResetEmail: jest.fn().mockResolvedValue({ messageId: 'test-id' }),
  sendWelcomeEmail: jest.fn().mockResolvedValue({ messageId: 'test-id' })
}));

console.log('🧪 Test environment configured');

// Cleanup après tous les tests
afterAll(async () => {
  // Fermer la connexion MongoDB si elle est ouverte
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  }
});