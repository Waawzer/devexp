import mongoose, { Schema, model, models } from 'mongoose';

// Définir l'interface avant le schéma
export interface User {
  _id: string;
  username: string;
  email: string;
  skills?: string[];
  bio?: string;
  projects?: string[];
  favoriteTechnologies?: string[];
  createdAt: Date;
  availability: string;
}

export interface UserInput {
  username: string;
  email: string;
  password: string;
  skills?: string[];
  bio?: string;
  favoriteTechnologies?: string[];
}

// Définir le schéma
const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: String,
  emailVerified: Date,
  image: String,
  username: { type: String, sparse: true },
  description: String,
  skills: [String],
  favoriteTechnologies: {
    type: [String],
    validate: [arrayLimit, 'Le nombre maximum de technologies préférées est de 3']
  },
  experiences: [{
    company: String,
    years: Number,
    position: String
  }],
  projects: [{ type: Schema.Types.ObjectId, ref: 'Project' }],
  accounts: [{
    type: Schema.Types.ObjectId,
    ref: 'Account'
  }],
  sessions: [{
    type: Schema.Types.ObjectId,
    ref: 'Session'
  }],
  availability: {
    type: String,
    enum: ['disponible', 'occupé', 'en_recherche'],
    default: 'en_recherche'
  },
  hourlyRate: {
    type: Number,
    default: null
  },
  yearsOfExperience: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Vérifier si le modèle existe déjà pour éviter la recompilation
const User = models.User || model('User', UserSchema);

// Ajouter la fonction de validation avant la création du modèle
function arrayLimit(val: string[]) {
  return val.length <= 3;
}

export default User;