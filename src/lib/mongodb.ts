import mongoose from 'mongoose';

const MONGODB_URI: string = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Veuillez définir MONGODB_URI dans .env.local');
}

const cached = global.mongoose ?? { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = { bufferCommands: false };
    cached.promise = mongoose.connect(MONGODB_URI, opts); // Plus de soulignement ici
  }

  try {
    cached.conn = await cached.promise;
    console.log('Connexion à MongoDB réussie');
  } catch (e) {
    cached.promise = null;
    console.error('Erreur de connexion à MongoDB:', e);
    throw e;
  }

  return cached.conn;
}

export default dbConnect;