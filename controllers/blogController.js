// backend/controllers/blogController.js
const Blog = require('../models/Blog');
const { cloudinary } = require('../config/cloudinary');

// @desc    Get all blogs
// @route   GET /api/blogs
const getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ isPublished: true })
      .sort({ publishedAt: -1 });
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single blog by slug
// @route   GET /api/blogs/:slug
const getBlogBySlug = async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug });
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    res.json(blog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a blog (Admin only)
// @route   POST /api/blogs
const createBlog = async (req, res) => {
  try {
    console.log('Creating blog with data:', req.body); // Debug log
    
    // Validate required fields
    const requiredFields = ['title', 'metaTitle', 'metaDescription', 'author', 'coverImage', 'content'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        message: `Missing required fields: ${missingFields.join(', ')}` 
      });
    }

    // Ensure slug is generated
    const blogData = {
      ...req.body,
      slug: req.body.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
    };

    const blog = await Blog.create(blogData);
    console.log('Blog created successfully:', blog); // Debug log
    res.status(201).json(blog);
  } catch (error) {
    console.error('Error creating blog:', error); // Debug log
    if (error.code === 11000) {
      // Duplicate key error (slug might be duplicate)
      return res.status(400).json({ message: 'A blog with this title already exists' });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a blog (Admin only)
// @route   PUT /api/blogs/:id
const updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    res.json(blog);
  } catch (error) {
    console.error('Error updating blog:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a blog (Admin only)
// @route   DELETE /api/blogs/:id
const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Delete image from cloudinary if exists
    if (blog.coverImage) {
      const publicId = blog.coverImage.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`website_gallery/${publicId}`);
    }

    res.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload blog image (Admin only)
// @route   POST /api/blogs/upload-image
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    res.json({ url: req.file.path });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all blogs for admin (including unpublished)
// @route   GET /api/blogs/admin/all
const getAdminBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getBlogs,
  getBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog,
  uploadImage,
  getAdminBlogs,
};