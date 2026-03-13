const Notice = require('../models/Notice');

// @desc    Get all notices
// @route   GET /api/notices
// @access  Public
const getNotices = async (req, res) => {
  try {
    const { category, isImportant, isActive } = req.query;
    let query = {};

    if (category) query.category = category;
    if (isImportant !== undefined) query.isImportant = isImportant === 'true';
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const notices = await Notice.find(query).sort({ publishDate: -1, createdAt: -1 });
    res.json(notices);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single notice
// @route   GET /api/notices/:id
// @access  Public
const getNoticeById = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    
    if (notice) {
      res.json(notice);
    } else {
      res.status(404).json({ message: 'Notice not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create notice
// @route   POST /api/notices
// @access  Private/Admin
const createNotice = async (req, res) => {
  try {
    const { title, description, category, isImportant, expiryDate } = req.body;

    const notice = await Notice.create({
      title,
      description,
      category,
      isImportant: isImportant || false,
      expiryDate: expiryDate || null,
    });

    res.status(201).json(notice);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update notice
// @route   PUT /api/notices/:id
// @access  Private/Admin
const updateNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);

    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }

    notice.title = req.body.title || notice.title;
    notice.description = req.body.description || notice.description;
    notice.category = req.body.category || notice.category;
    notice.isImportant = req.body.isImportant !== undefined ? req.body.isImportant : notice.isImportant;
    notice.isActive = req.body.isActive !== undefined ? req.body.isActive : notice.isActive;
    notice.expiryDate = req.body.expiryDate || notice.expiryDate;

    const updatedNotice = await notice.save();
    res.json(updatedNotice);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete notice
// @route   DELETE /api/notices/:id
// @access  Private/Admin
const deleteNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);

    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }

    await notice.deleteOne();
    res.json({ message: 'Notice removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Toggle notice status
// @route   PATCH /api/notices/:id/toggle
// @access  Private/Admin
const toggleNoticeStatus = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);

    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }

    notice.isActive = !notice.isActive;
    await notice.save();

    res.json({ message: 'Notice status updated', isActive: notice.isActive });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getNotices,
  getNoticeById,
  createNotice,
  updateNotice,
  deleteNotice,
  toggleNoticeStatus,
};