import mongoose, { Schema } from 'mongoose';

const UserSchema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  skills: [{ type: String }],
  bio: { type: String },
  projects: [{ type: Schema.Types.ObjectId, ref: 'Project' }],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.User || mongoose.model('User', UserSchema);

export interface User {
  _id: string;
  username: string;
  email: string;
  skills?: string[];
  bio?: string;
  projects?: string[];
  createdAt: Date;
}

export interface UserInput {
  username: string;
  email: string;
  password: string;
  skills?: string[];
  bio?: string;
}