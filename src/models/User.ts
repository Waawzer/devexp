import mongoose, { Schema } from 'mongoose';

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
  name: String,
  email: { type: String, required: true, unique: true },
  emailVerified: Date,
  image: String,
  username: String,
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
  }]
}, {
  timestamps: true
});

// Vérifier si le modèle existe déjà pour éviter la recompilation
const User = mongoose.models.User || mongoose.model('User', UserSchema);

// Ajouter la fonction de validation avant la création du modèle
function arrayLimit(val: string[]) {
  return val.length <= 3;
}

export default User;