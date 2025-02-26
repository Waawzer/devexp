import mongoose, { Schema } from 'mongoose';

const UserSchema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['developer', 'client'], required: true },
  skills: [{ type: String }],
  bio: { type: String },
  projects: [{ type: Schema.Types.ObjectId, ref: 'Project' }],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.User || mongoose.model('User', UserSchema);