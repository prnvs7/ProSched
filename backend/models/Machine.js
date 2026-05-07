const mongoose = require('mongoose');

const MachineSchema = new mongoose.Schema({
  machine_name: {
    type: String,
    required: true,
  },
  capacity: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['available', 'busy'],
    default: 'available',
  },
  current_order_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
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

MachineSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

module.exports = mongoose.model('Machine', MachineSchema);
