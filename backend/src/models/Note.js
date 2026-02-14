const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [255, 'Title cannot exceed 255 characters']
  },
  content: {
    type: String,
    required: [true, 'Content is required']
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  isPinned: {
    type: Boolean,
    default: false
  },
  color: {
    type: String,
    default: 'default',
    enum: ['default', 'yellow', 'pink', 'blue', 'green', 'purple', 'orange']
  }
}, {
  timestamps: true
});

// Index for faster queries
noteSchema.index({ user: 1, createdAt: -1 });
noteSchema.index({ user: 1, tags: 1 });
noteSchema.index({ user: 1, isPinned: -1, createdAt: -1 });

// Remove __v from JSON output
noteSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('Note', noteSchema);
