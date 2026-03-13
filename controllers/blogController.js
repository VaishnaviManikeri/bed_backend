const Blog = require('../models/Blog');
const { cloudinary } = require('../config/cloudinary');

// @desc    Get all blog posts
// @route   GET /api/blogs
// @access  Public
const getBlogs = async (req, res) => {
  try {
    const { category, tag, isActive } = req.query;
    let query = {};

    if (category) query.category = category;
    if (tag) query.tags = tag;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const blogs = await Blog.find(query)
      .sort({ publishedAt: -1, createdAt: -1 })
      .select('-content'); // Exclude full content for listing

    res.json(blogs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single blog post by slug
// @route   GET /api/blogs/slug/:slug
// @access  Public
const getBlogBySlug = async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug, isActive: true });
    
    if (blog) {
      // Increment views
      blog.views += 1;
      await blog.save();
      
      res.json(blog);
    } else {
      res.status(404).json({ message: 'Blog not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single blog post by ID
// @route   GET /api/blogs/:id
// @access  Public
const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (blog) {
      res.json(blog);
    } else {
      res.status(404).json({ message: 'Blog not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create blog post
// @route   POST /api/blogs
// @access  Private/Admin
const createBlog = async (req, res) => {
  try {
    const { title, excerpt, content, author, category, tags } = req.body;

    const blogData = {
      title,
      excerpt,
      content,
      author,
      category,
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : [],
    };

    // Add featured image if uploaded
    if (req.file) {
      blogData.featuredImage = req.file.path;
      blogData.publicId = req.file.filename;
    }

    const blog = await Blog.create(blogData);
    res.status(201).json(blog);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update blog post
// @route   PUT /api/blogs/:id
// @access  Private/Admin
const updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Update fields
    blog.title = req.body.title || blog.title;
    blog.excerpt = req.body.excerpt || blog.excerpt;
    blog.content = req.body.content || blog.content;
    blog.author = req.body.author || blog.author;
    blog.category = req.body.category || blog.category;
    blog.isActive = req.body.isActive !== undefined ? req.body.isActive : blog.isActive;
    
    if (req.body.tags) {
      blog.tags = Array.isArray(req.body.tags) 
        ? req.body.tags 
        : req.body.tags.split(',').map(t => t.trim());
    }

    // Update featured image if new one uploaded
    if (req.file) {
      // Delete old image from cloudinary
      if (blog.publicId) {
        await cloudinary.uploader.destroy(blog.publicId);
      }
      
      blog.featuredImage = req.file.path;
      blog.publicId = req.file.filename;
    }

    const updatedBlog = await blog.save();
    res.json(updatedBlog);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete blog post
// @route   DELETE /api/blogs/:id
// @access  Private/Admin
const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Delete featured image from cloudinary
    if (blog.publicId) {
      await cloudinary.uploader.destroy(blog.publicId);
    }

    await blog.deleteOne();
    res.json({ message: 'Blog removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Toggle blog status
// @route   PATCH /api/blogs/:id/toggle
// @access  Private/Admin
const toggleBlogStatus = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    blog.isActive = !blog.isActive;
    await blog.save();

    res.json({ message: 'Blog status updated', isActive: blog.isActive });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getBlogs,
  getBlogBySlug,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  toggleBlogStatus,
};