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
  }
}, {
  timestamps: true
});

// Index for faster queries
noteSchema.index({ user: 1, createdAt: -1 });

// Remove __v from JSON output
noteSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('Note', noteSchema);
