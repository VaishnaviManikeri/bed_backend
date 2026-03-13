const express = require('express');
const router = express.Router();
const {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  toggleJobStatus,
} = require('../controllers/careerController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getJobs);
router.get('/:id', getJobById);

// Private routes (Admin only)
router.post('/', protect, createJob);
router.put('/:id', protect, updateJob);
router.delete('/:id', protect, deleteJob);
router.patch('/:id/toggle', protect, toggleJobStatus);

module.exports = router;