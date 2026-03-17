const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { uploadSingle } = require('../middleware/uploadMiddleware');
const {
  getBlogs,
  getBlogBySlug,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog
} = require('../controllers/blogController');

// Public routes
router.get('/', getBlogs);
router.get('/:slug', getBlogBySlug);

// Protected admin routes
router.get('/id/:id', protect, getBlogById);
router.post('/', protect, uploadSingle('featuredImage'), createBlog);
router.put('/:id', protect, uploadSingle('featuredImage'), updateBlog);
router.delete('/:id', protect, deleteBlog);

module.exports = router;