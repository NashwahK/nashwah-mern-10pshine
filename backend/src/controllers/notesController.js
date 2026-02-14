const NotesService = require('../services/notesService');
const { ValidationError, NotFoundError } = require('../utils/errors');

exports.createNote = async (req, res, next) => {
  try {
    const { title, content, tags, isPinned, color } = req.body;
    if (!title || !content) throw new ValidationError('Title and content are required');

    const note = await NotesService.createNote({ userId: req.user._id, title, content, tags, isPinned, color });
    res.status(201).json({ success: true, message: 'Note created successfully', data: { note } });
  } catch (err) {
    next(err);
  }
};

exports.getNotes = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '', tag = '' } = req.query;
    const result = await NotesService.getNotes({ userId: req.user._id, page, limit, search, tag });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

exports.getTags = async (req, res, next) => {
  try {
    const tags = await NotesService.getAllTags({ userId: req.user._id });
    res.json({ success: true, data: { tags } });
  } catch (err) {
    next(err);
  }
};

exports.getNote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const note = await NotesService.getNoteById({ userId: req.user._id, id });
    if (!note) throw new NotFoundError('Note not found');
    res.json({ success: true, data: { note } });
  } catch (err) {
    next(err);
  }
};

exports.updateNote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content, tags, isPinned, color } = req.body;
    if (!title || !content) throw new ValidationError('Title and content are required');

    const note = await NotesService.updateNote({ userId: req.user._id, id, title, content, tags, isPinned, color });
    if (!note) throw new NotFoundError('Note not found or not owned by user');

    res.json({ success: true, message: 'Note updated successfully', data: { note } });
  } catch (err) {
    next(err);
  }
};

exports.deleteNote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await NotesService.deleteNote({ userId: req.user._id, id });
    if (!result) throw new NotFoundError('Note not found or not owned by user');
    res.json({ success: true, message: 'Note deleted successfully' });
  } catch (err) {
    next(err);
  }
};
