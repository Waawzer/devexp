import mongoose from 'mongoose';

export type ProjectStatus = 'En développement' | 'En production' | 'Abandonné' | 'En pause';

// Interface for project input data
export interface ProjectInput {
  title: string;
  description: string;
  skills: string;
  githubUrl?: string;
  status: ProjectStatus;
}

// Mongoose schema for projects
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
  },
  skills: {
    type: String,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  githubUrl: {
    type: String,
    required: false
  },
  status: {
    type: String,
    enum: ['En développement', 'En production', 'Abandonné', 'En pause'],
    default: 'En développement'
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

export default mongoose.models.Project || mongoose.model('Project', projectSchema);