import mongoose, { Schema } from 'mongoose';

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
const ProjectSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  img: { type: String },
  skills: [String],
  status: { 
    type: String, 
    enum: ['open', 'in_progress', 'completed'], 
    default: 'open' 
  },
  collaborators: [{
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    role: { 
      type: String, 
      enum: ['developer', 'designer', 'project_manager'],
      required: true 
    }
  }],
  githubUrl: {
    type: String,
    required: false
  },
  createdAt: { type: Date, default: Date.now },
  specifications: {
    type: String,
    required: false
  },
});

export default mongoose.models.Project || mongoose.model('Project', ProjectSchema);