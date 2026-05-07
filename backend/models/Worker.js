const mongoose = require('mongoose');

const WorkerSchema = new mongoose.Schema({
  employee_name: {
    type: String,
    required: true,
  },
  skill: {
    type: String,
    required: true,
  },
  shift: {
    type: String,
    enum: ['morning', 'evening', 'night'],
    default: 'morning',
  },
  is_available: {
    type: Boolean,
    default: true,
  },
  assigned_machine_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Machine',
    default: null,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  }
});

WorkerSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

module.exports = mongoose.model('Worker', WorkerSchema);
