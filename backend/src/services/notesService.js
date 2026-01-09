const Note = require('../models/Note');

class NotesService {
  static async createNote({ userId, title, content }) {
    const note = await Note.create({ user: userId, title, content });
    return note;
  }

  static async getNotes({ userId, page = 1, limit = 10, search = '' }) {
    const query = { user: userId };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    const [notes, total] = await Promise.all([
      Note.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
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

  static async getNoteById({ userId, id }) {
    const note = await Note.findOne({ _id: id, user: userId });
    return note;
  }

  static async updateNote({ userId, id, title, content }) {
    const note = await Note.findOneAndUpdate(
      { _id: id, user: userId },
      { title, content },
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
