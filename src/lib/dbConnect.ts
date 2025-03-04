import mongoose from 'mongoose';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local');
}

const MONGODB_URI = process.env.MONGODB_URI;

async function dbConnect() {
  if (mongoose.connections[0].readyState) return;

  try {
    await mongoose.connect(MONGODB_URI);
  } catch (error) {
    console.error('Erreur de connexion à MongoDB:', error);
    throw error;
  }
}

export default dbConnect; 