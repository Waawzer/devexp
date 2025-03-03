import mongoose, { Schema } from 'mongoose';

const UserSchema = new Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  image: String,
  projects: [{ type: Schema.Types.ObjectId, ref: 'Project' }],
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