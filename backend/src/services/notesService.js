const Note = require('../models/Note');

class NotesService {
  static async createNote({ userId, title, content, tags = [], isPinned = false, color = 'default' }) {
    const note = await Note.create({ user: userId, title, content, tags, isPinned, color });
    return note;
  }

  static async getNotes({ userId, page = 1, limit = 10, search = '', tag = '' }) {
    const query = { user: userId };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }
    if (tag) {
      query.tags = tag.toLowerCase();
    }

    const skip = (page - 1) * limit;
    const [notes, total] = await Promise.all([
      Note.find(query).sort({ isPinned: -1, createdAt: -1 }).skip(skip).limit(limit),
      Note.countDocuments(query)
    ]);

    return {
      notes,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  static async getAllTags({ userId }) {
    const tags = await Note.distinct('tags', { user: userId });
    return tags.sort();
  }

  static async getNoteById({ userId, id }) {
    const note = await Note.findOne({ _id: id, user: userId });
    return note;
  }

  static async updateNote({ userId, id, title, content, tags, isPinned, color }) {
    const updateData = { title, content };
    if (tags !== undefined) updateData.tags = tags;
    if (isPinned !== undefined) updateData.isPinned = isPinned;
    if (color !== undefined) updateData.color = color;

    const note = await Note.findOneAndUpdate(
      { _id: id, user: userId },
      updateData,
      { new: true }
    );
    return note;
  }

  static async deleteNote({ userId, id }) {
    const result = await Note.findOneAndDelete({ _id: id, user: userId });
    return result;
  }
}

module.exports = NotesService;
