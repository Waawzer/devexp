import mongoose from 'mongoose';

// Interface pour les données d'entrée d'un projet (utilisée côté client)
export interface ProjectInput {
  title: string;
  description: string;
  skills: string;
}

// Schéma MongoDB pour les projets
const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  img: {
    type: String,
    required: true,
  },
  skills: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Project || mongoose.model('Project', projectSchema);