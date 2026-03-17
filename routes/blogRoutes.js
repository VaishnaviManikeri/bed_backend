const express = require('express');
const router = express.Router();
const {
  getBlogs,
  getBlogBySlug,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  incrementViews
} = require('../controllers/blogController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getBlogs);
router.get('/slug/:slug', getBlogBySlug);
router.get('/:id', getBlogById);
router.patch('/:id/views', incrementViews);

// Protected routes (require authentication)
router.post('/', protect, createBlog);
router.put('/:id', protect, updateBlog);
router.delete('/:id', protect, deleteBlog);

module.exports = router;