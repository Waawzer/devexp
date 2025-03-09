import mongoose, { Schema } from 'mongoose';

export type MissionStatus = 'à faire' | 'en cours' | 'en révision' | 'terminée' | 'annulée';
export type MissionPriority = 'basse' | 'moyenne' | 'haute' | 'urgente';

// Interface pour les données d'entrée de mission
export interface MissionInput {
  title: string;
  description: string;
  skills: string[];
  deadline?: Date;
  estimatedHours?: number;
  priority: MissionPriority;
}

// Interface pour les candidatures aux missions
interface MissionApplication {
  user: mongoose.Schema.Types.ObjectId;
  message: string;
  status: 'en_attente' | 'acceptée' | 'refusée';
  createdAt: Date;
}

// Schéma Mongoose pour les missions
const MissionSchema = new Schema({
  title: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  projectId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Project',
    required: false // Optionnel, une mission peut exister sans projet
  },
  creatorId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true // La personne qui crée la mission
  },
  assignedTo: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    required: false // Optionnel, peut être assigné plus tard
  },
  status: { 
    type: String,
    enum: ['à faire', 'en cours', 'en révision', 'terminée', 'annulée'],
    default: 'à faire'
  },
  priority: {
    type: String,
    enum: ['basse', 'moyenne', 'haute', 'urgente'],
    default: 'moyenne'
  },
  skills: [{ 
    type: String 
  }],
  deadline: {
    type: Date,
    required: false
  },
  estimatedHours: {
    type: Number,
    required: false
  },
  completedHours: {
    type: Number,
    default: 0
  },
  attachments: [{
    url: { 
      type: String,
      required: true 
    },
    name: { 
      type: String,
      required: true 
    }
  }],
  comments: [{
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  applications: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    message: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['en_attente', 'acceptée', 'refusée'],
      default: 'en_attente'
    },
    createdAt: {
      type: Date,
      default: Date.now
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
  startedAt: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  }
});

// Middleware pour mettre à jour updatedAt avant chaque sauvegarde
MissionSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Si le statut passe à "en cours" et startedAt n'est pas défini
  if (this.status === 'en cours' && !this.startedAt) {
    this.startedAt = new Date();
  }
  
  // Si le statut passe à "terminée" et completedAt n'est pas défini
  if (this.status === 'terminée' && !this.completedAt) {
    this.completedAt = new Date();
  }
  
  next();
});

// Index pour améliorer les performances des requêtes
MissionSchema.index({ projectId: 1, createdAt: -1 });
MissionSchema.index({ assignedTo: 1, status: 1 });
MissionSchema.index({ creatorId: 1 });

// Vérifier si le modèle existe déjà avant de le créer
export default mongoose.models.Mission || mongoose.model('Mission', MissionSchema); 