const Blog = require('../models/Blog');
const { cloudinary } = require('../config/cloudinary');

// @desc    Get all blogs
// @route   GET /api/blogs
// @access  Public
const getBlogs = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, search, published } = req.query;
    const query = {};

    // Filter by published status (for public view)
    if (published === 'true') {
      query.isPublished = true;
    }

    // Filter by category
    if (category && category !== 'All') {
      query.category = category;
    }

    // Search by title or content
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
      ];
    }

    const blogs = await Blog.find(query)
      .sort({ publishedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Blog.countDocuments(query);

    res.json({
      blogs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get single blog by slug
// @route   GET /api/blogs/:slug
// @access  Public
const getBlogBySlug = async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug });

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Increment views
    blog.views += 1;
    await blog.save();

    res.json(blog);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get single blog by ID (for admin)
// @route   GET /api/blogs/:id
// @access  Private/Admin
const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    res.json(blog);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create a blog
// @route   POST /api/blogs
// @access  Private/Admin
const createBlog = async (req, res) => {
  try {
    const { title, content, excerpt, category, tags, metaTitle, metaDescription, metaKeywords, isPublished } = req.body;

    // Check if blog with same title exists
    const blogExists = await Blog.findOne({ title });
    if (blogExists) {
      return res.status(400).json({ message: 'Blog with this title already exists' });
    }

    // Handle featured image
    let featuredImage = {};
    if (req.file) {
      featuredImage = {
        public_id: req.file.filename,
        url: req.file.path,
      };
    }

    // Handle additional images
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map(file => ({
        public_id: file.filename,
        url: file.path,
      }));
    }

    const blog = await Blog.create({
      title,
      content,
      excerpt,
      category,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      featuredImage,
      images,
      author: req.admin?.username || 'Admin',
      isPublished: isPublished === 'true' || isPublished === true,
      publishedAt: (isPublished === 'true' || isPublished === true) ? Date.now() : null,
      metaTitle,
      metaDescription,
      metaKeywords,
    });

    res.status(201).json(blog);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
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

    const { title, content, excerpt, category, tags, metaTitle, metaDescription, metaKeywords, isPublished } = req.body;

    // Handle featured image update
    let featuredImage = blog.featuredImage;
    if (req.file) {
      // Delete old image from cloudinary if exists
      if (blog.featuredImage?.public_id) {
        await cloudinary.uploader.destroy(blog.featuredImage.public_id);
      }
      
      featuredImage = {
        public_id: req.file.filename,
        url: req.file.path,
      };
    }

    // Handle additional images
    let images = blog.images;
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => ({
        public_id: file.filename,
        url: file.path,
      }));
      images = [...images, ...newImages];
    }

    // Update blog
    blog = await Blog.findByIdAndUpdate(
      req.params.id,
      {
        title,
        content,
        excerpt,
        category,
        tags: tags ? tags.split(',').map(tag => tag.trim()) : blog.tags,
        featuredImage,
        images,
        isPublished: isPublished === 'true' || isPublished === true,
        publishedAt: (isPublished === 'true' || isPublished === true) && !blog.publishedAt ? Date.now() : blog.publishedAt,
        metaTitle,
        metaDescription,
        metaKeywords,
      },
      { new: true, runValidators: true }
    );

    res.json(blog);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
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

    // Delete featured image from cloudinary
    if (blog.featuredImage?.public_id) {
      await cloudinary.uploader.destroy(blog.featuredImage.public_id);
    }

    // Delete all images from cloudinary
    if (blog.images && blog.images.length > 0) {
      for (const image of blog.images) {
        if (image.public_id) {
          await cloudinary.uploader.destroy(image.public_id);
        }
      }
    }

    await blog.deleteOne();

    res.json({ message: 'Blog removed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete a single image from blog
// @route   DELETE /api/blogs/:id/images/:imageId
// @access  Private/Admin
const deleteBlogImage = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    const image = blog.images.id(req.params.imageId);
    
    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }

    // Delete from cloudinary
    if (image.public_id) {
      await cloudinary.uploader.destroy(image.public_id);
    }

    // Remove from array
    blog.images.pull(req.params.imageId);
    await blog.save();

    res.json({ message: 'Image removed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getBlogs,
  getBlogBySlug,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  deleteBlogImage,
};