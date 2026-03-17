const Blog = require('../models/Blog');

/* ================= CREATE BLOG ================= */
const createBlog = async (req, res) => {
  try {
    const { title, content, author } = req.body;

    const blog = new Blog({
      title,
      content,
      author,
      image: req.file?.path || "",
    });

    await blog.save();

    res.status(201).json({
      success: true,
      message: "Blog created successfully",
      blog,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= GET ALL BLOGS ================= */
const getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });

    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= GET SINGLE BLOG ================= */
const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) return res.status(404).json({ message: "Blog not found" });

    res.json(blog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= UPDATE BLOG ================= */
const updateBlog = async (req, res) => {
  try {
    const { title, content, author, isPublished } = req.body;

    const blog = await Blog.findById(req.params.id);

    if (!blog) return res.status(404).json({ message: "Blog not found" });

    blog.title = title || blog.title;
    blog.content = content || blog.content;
    blog.author = author || blog.author;
    blog.isPublished = isPublished ?? blog.isPublished;

    if (req.file) {
      blog.image = req.file.path;
    }

    await blog.save();

    res.json({ success: true, message: "Blog updated", blog });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= DELETE BLOG ================= */
const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) return res.status(404).json({ message: "Blog not found" });

    await blog.deleteOne();

    res.json({ success: true, message: "Blog deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createBlog,
  getBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
};