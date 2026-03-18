const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');
const {
  getBlogs,
  getBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog,
  getAllBlogsAdmin,
  uploadImage,
} = require('../controllers/blogController');

// Public routes
router.get('/', getBlogs);
router.get('/:slug', getBlogBySlug);

// Admin routes
router.get('/admin/all', protect, getAllBlogsAdmin);
router.post('/', protect, createBlog);
router.put('/:id', protect, updateBlog);
router.delete('/:id', protect, deleteBlog);
router.post('/upload-image', protect, upload.single('image'), uploadImage);

module.exports = router;