import mongoose, { Schema } from 'mongoose';

export type ProjectStatus = 'en développement' | 'en production' | 'en pause' | 'abandonné';
export type ProjectType = 'personnel' | 'collaboratif';

// Interface for project input data
export interface ProjectInput {
  title: string;
  description: string;
  skills: string;
  githubUrl?: string;
  status: ProjectStatus;
  projectType: ProjectType;
}

// Mongoose schema for projects
const ProjectSchema = new Schema({
  title: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  img: { 
    type: String,
    default: '/dev.bmp'
  },
  skills: [{ 
    type: String 
  }],
  status: { 
    type: String,
    enum: ['en développement', 'en production', 'en pause', 'abandonné'],
    default: 'en développement'
  },
  collaborators: [{
    user: { 
      type: Schema.Types.ObjectId, 
      ref: 'User',
      required: true
    },
    role: { 
      type: String,
      enum: ['développeur', 'designer', 'chef_de_projet'],
      required: true
    }
  }],
  applications: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    message: String,
    type: {
      type: String,
      enum: ['application', 'mission_proposal'],
      required: true
    },
    status: {
      type: String,
      enum: ['en_attente', 'accepté', 'refusé'],
      default: 'en_attente'
    },
    createdAt: Date
  }],
  githubUrl: {
    type: String,
    required: false
  },
  treeData: {
    type: Schema.Types.Mixed,
    required: false
  },
  specifications: {
    type: String,
    required: false
  },
  images: [{
    url: { 
      type: String,
      required: true 
    },
    caption: { 
      type: String,
      required: false 
    }
  }],
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  },
  projectType: {
    type: String,
    enum: ['personnel', 'collaboratif'],
    required: true,
    default: 'personnel'
  }
});

// Middleware pour mettre à jour updatedAt avant chaque sauvegarde
ProjectSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Index pour améliorer les performances des requêtes
ProjectSchema.index({ userId: 1, createdAt: -1 });
ProjectSchema.index({ status: 1 });

// Vérifier si le modèle existe déjà avant de le créer
export default mongoose.models.Project || mongoose.model('Project', ProjectSchema);