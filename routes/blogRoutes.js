const express = require('express');
const router = express.Router();
const {
  getBlogs,
  getBlogBySlug,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  toggleBlogStatus,
} = require('../controllers/blogController');
const { protect } = require('../middleware/authMiddleware');
const { uploadSingle } = require('../middleware/uploadMiddleware');

// Public routes
router.get('/', getBlogs);
router.get('/slug/:slug', getBlogBySlug);
router.get('/:id', getBlogById);

// Private routes (Admin only)
router.post('/', protect, uploadSingle('featuredImage'), createBlog);
router.put('/:id', protect, uploadSingle('featuredImage'), updateBlog);
router.delete('/:id', protect, deleteBlog);
router.patch('/:id/toggle', protect, toggleBlogStatus);

module.exports = router;