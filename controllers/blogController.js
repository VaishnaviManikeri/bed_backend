const Blog = require('../models/Blog');
const { cloudinary } = require('../config/cloudinary');

// @desc    Get all blogs
// @route   GET /api/blogs
// @access  Public
const getBlogs = async (req, res) => {
  try {
    const { page = 1, limit = 10, published } = req.query;
    const query = {};
    
    // Filter by published status if specified
    if (published !== undefined) {
      query.published = published === 'true';
    }

    const blogs = await Blog.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Blog.countDocuments(query);

    res.json({
      blogs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single blog by slug
// @route   GET /api/blogs/:slug
// @access  Public
const getBlogBySlug = async (req, res) => {
  try {
    const blog = await Blog.findOne({ 
      slug: req.params.slug,
      published: true 
    });
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Increment views
    blog.views += 1;
    await blog.save();

    res.json(blog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single blog by ID (admin)
// @route   GET /api/blogs/id/:id
// @access  Private/Admin
const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    res.json(blog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a blog
// @route   POST /api/blogs
// @access  Private/Admin
const createBlog = async (req, res) => {
  try {
    const { title, content, excerpt, author, metaTitle, metaDescription, tags, published } = req.body;

    // Check if slug already exists
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const existingBlog = await Blog.findOne({ slug });
    
    if (existingBlog) {
      return res.status(400).json({ message: 'A blog with this title already exists' });
    }

    const blogData = {
      title,
      content,
      excerpt,
      author: { name: author || 'Admin' },
      metaTitle: metaTitle || title,
      metaDescription: metaDescription || excerpt,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      published: published || false
    };

    // Add featured image if uploaded
    if (req.file) {
      blogData.featuredImage = {
        url: req.file.path,
        publicId: req.file.filename,
        alt: title
      };
    }

    const blog = await Blog.create(blogData);
    res.status(201).json(blog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a blog
// @route   PUT /api/blogs/:id
// @access  Private/Admin
const updateBlog = async (req, res) => {
  try {
    let blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    const { title, content, excerpt, author, metaTitle, metaDescription, tags, published } = req.body;

    // Update slug if title changed
    let slug = blog.slug;
    if (title && title !== blog.title) {
      slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      
      // Check if new slug already exists (excluding current blog)
      const existingBlog = await Blog.findOne({ slug, _id: { $ne: req.params.id } });
      if (existingBlog) {
        return res.status(400).json({ message: 'A blog with this title already exists' });
      }
    }

    const updateData = {
      title: title || blog.title,
      slug,
      content: content || blog.content,
      excerpt: excerpt || blog.excerpt,
      author: author ? { name: author } : blog.author,
      metaTitle: metaTitle || blog.metaTitle,
      metaDescription: metaDescription || blog.metaDescription,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : blog.tags,
      published: published !== undefined ? published : blog.published
    };

    // Handle featured image update
    if (req.file) {
      // Delete old image from cloudinary if exists
      if (blog.featuredImage?.publicId) {
        await cloudinary.uploader.destroy(blog.featuredImage.publicId);
      }
      
      updateData.featuredImage = {
        url: req.file.path,
        publicId: req.file.filename,
        alt: title || blog.title
      };
    }

    blog = await Blog.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(blog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a blog
// @route   DELETE /api/blogs/:id
// @access  Private/Admin
const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Delete featured image from cloudinary if exists
    if (blog.featuredImage?.publicId) {
      await cloudinary.uploader.destroy(blog.featuredImage.publicId);
    }

    await blog.deleteOne();
    res.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getBlogs,
  getBlogBySlug,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog
};