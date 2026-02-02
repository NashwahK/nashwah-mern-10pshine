const express = require('express');
const { body, param, query } = require('express-validator');
const notesController = require('../controllers/notesController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

// Create
router.post(
  '/',
  authenticate,
  [
    body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
    body('content').trim().isLength({ min: 1 }).withMessage('Content is required')
  ],
  notesController.createNote
);

// Get all
router.get(
  '/',
  authenticate,
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1 }).toInt(),
    query('search').optional().isString(),
    query('tag').optional().isString()
  ],
  notesController.getNotes
);

// Get all tags
router.get('/tags', authenticate, notesController.getTags);

// Get single
router.get('/:id', authenticate, notesController.getNote);

// Update
router.put(
  '/:id',
  authenticate,
  [
    body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
    body('content').trim().isLength({ min: 1 }).withMessage('Content is required')
  ],
  notesController.updateNote
);

// Delete
router.delete('/:id', authenticate, notesController.deleteNote);

module.exports = router;
