const express = require('express');
const router = express.Router();
const {
  getBlogs,
  getBlogBySlug,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  deleteBlogImage,
} = require('../controllers/blogController');
const { protect } = require('../middleware/authMiddleware');
const { uploadMultiple } = require('../middleware/uploadMiddleware');

// Public routes
router.get('/', getBlogs);
router.get('/slug/:slug', getBlogBySlug);

// Protected routes
router.get('/:id', protect, getBlogById);
router.post(
  '/',
  protect,
  uploadMultiple('images', 10),
  createBlog
);
router.put(
  '/:id',
  protect,
  uploadMultiple('images', 10),
  updateBlog
);
router.delete('/:id', protect, deleteBlog);
router.delete('/:id/images/:imageId', protect, deleteBlogImage);

module.exports = router;