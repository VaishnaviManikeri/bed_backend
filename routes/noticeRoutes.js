


const express = require('express');
const router = express.Router();
const {
  getNotices,
  getNoticeById,
  createNotice,
  updateNotice,
  deleteNotice,
  toggleNoticeStatus,
} = require('../controllers/noticeController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getNotices);
router.get('/:id', getNoticeById);

// Private routes (Admin only)
router.post('/', protect, createNotice);
router.put('/:id', protect, updateNotice);
router.delete('/:id', protect, deleteNotice);
router.patch('/:id/toggle', protect, toggleNoticeStatus);

module.exports = router;