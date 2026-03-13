const Gallery = require('../models/Gallery');
const { cloudinary } = require('../config/cloudinary');

// @desc    Get all gallery items
// @route   GET /api/gallery
// @access  Public
const getGalleryItems = async (req, res) => {
  try {
    const { category, isActive } = req.query;
    let query = {};

    if (category) query.category = category;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const galleryItems = await Gallery.find(query).sort({ createdAt: -1 });
    res.json(galleryItems);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single gallery item
// @route   GET /api/gallery/:id
// @access  Public
const getGalleryItemById = async (req, res) => {
  try {
    const galleryItem = await Gallery.findById(req.params.id);
    
    if (galleryItem) {
      res.json(galleryItem);
    } else {
      res.status(404).json({ message: 'Gallery item not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create gallery item
// @route   POST /api/gallery
// @access  Private/Admin
const createGalleryItem = async (req, res) => {
  try {
    const { title, description, category } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an image' });
    }

    const galleryItem = await Gallery.create({
      title,
      description,
      category,
      imageUrl: req.file.path,
      publicId: req.file.filename,
    });

    res.status(201).json(galleryItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update gallery item
// @route   PUT /api/gallery/:id
// @access  Private/Admin
const updateGalleryItem = async (req, res) => {
  try {
    const galleryItem = await Gallery.findById(req.params.id);

    if (!galleryItem) {
      return res.status(404).json({ message: 'Gallery item not found' });
    }

    // If new image is uploaded
    if (req.file) {
      // Delete old image from cloudinary
      if (galleryItem.publicId) {
        await cloudinary.uploader.destroy(galleryItem.publicId);
      }
      
      galleryItem.imageUrl = req.file.path;
      galleryItem.publicId = req.file.filename;
    }

    // Update other fields
    galleryItem.title = req.body.title || galleryItem.title;
    galleryItem.description = req.body.description || galleryItem.description;
    galleryItem.category = req.body.category || galleryItem.category;
    galleryItem.isActive = req.body.isActive !== undefined ? req.body.isActive : galleryItem.isActive;

    const updatedGalleryItem = await galleryItem.save();
    res.json(updatedGalleryItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete gallery item
// @route   DELETE /api/gallery/:id
// @access  Private/Admin
const deleteGalleryItem = async (req, res) => {
  try {
    const galleryItem = await Gallery.findById(req.params.id);

    if (!galleryItem) {
      return res.status(404).json({ message: 'Gallery item not found' });
    }

    // Delete image from cloudinary
    if (galleryItem.publicId) {
      await cloudinary.uploader.destroy(galleryItem.publicId);
    }

    await galleryItem.deleteOne();
    res.json({ message: 'Gallery item removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Toggle gallery item status
// @route   PATCH /api/gallery/:id/toggle
// @access  Private/Admin
const toggleGalleryStatus = async (req, res) => {
  try {
    const galleryItem = await Gallery.findById(req.params.id);

    if (!galleryItem) {
      return res.status(404).json({ message: 'Gallery item not found' });
    }

    galleryItem.isActive = !galleryItem.isActive;
    await galleryItem.save();

    res.json({ message: 'Gallery status updated', isActive: galleryItem.isActive });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getGalleryItems,
  getGalleryItemById,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
  toggleGalleryStatus,
};