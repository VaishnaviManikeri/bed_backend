const express = require("express");
const router = express.Router();

const {
  createBlog,
  getBlogs,
  updateBlog,
  deleteBlog,
} = require("../controllers/blogController");

const { protect } = require("../middleware/authMiddleware");
const { uploadSingle } = require("../middleware/uploadMiddleware");

// PUBLIC
router.get("/", getBlogs);

// ADMIN
router.post("/", protect, uploadSingle("image"), createBlog);
router.put("/:id", protect, uploadSingle("image"), updateBlog);
router.delete("/:id", protect, deleteBlog);

module.exports = router;