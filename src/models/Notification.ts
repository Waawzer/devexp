import mongoose, { Schema, model, models } from 'mongoose';

const notificationSchema = new Schema({
  type: {
    type: String,
    enum: ['mission_proposal', 'application', 'new_message'],
    required: true
  },
  from: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  to: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  projectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: false
  },
  messageId: {
    type: Schema.Types.ObjectId,
    ref: 'Message',
    required: false
  },
  title: String,
  message: String,
  read: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Notification = models.Notification || model('Notification', notificationSchema);

export default Notification as mongoose.Model<any>; 