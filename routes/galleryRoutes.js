const express = require('express');
const router = express.Router();
const {
  getGalleryItems,
  getGalleryItemById,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
  toggleGalleryStatus,
} = require('../controllers/galleryController');
const { protect } = require('../middleware/authMiddleware');
const { uploadSingle } = require('../middleware/uploadMiddleware');

// Public routes
router.get('/', getGalleryItems);
router.get('/:id', getGalleryItemById);

// Private routes (Admin only)
router.post('/', protect, uploadSingle('image'), createGalleryItem);
router.put('/:id', protect, uploadSingle('image'), updateGalleryItem);
router.delete('/:id', protect, deleteGalleryItem);
router.patch('/:id/toggle', protect, toggleGalleryStatus);

module.exports = router;