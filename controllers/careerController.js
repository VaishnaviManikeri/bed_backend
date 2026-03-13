const Career = require('../models/Career');

// @desc    Get all job listings
// @route   GET /api/careers
// @access  Public
const getJobs = async (req, res) => {
  try {
    const { jobType, department, isActive } = req.query;
    let query = {};

    if (jobType) query.jobType = jobType;
    if (department) query.department = department;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    // Only show jobs where deadline hasn't passed and is active
    if (!isActive) {
      query.applicationDeadline = { $gte: new Date() };
      query.isActive = true;
    }

    const jobs = await Career.find(query).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single job
// @route   GET /api/careers/:id
// @access  Public
const getJobById = async (req, res) => {
  try {
    const job = await Career.findById(req.params.id);
    
    if (job) {
      res.json(job);
    } else {
      res.status(404).json({ message: 'Job not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create job listing
// @route   POST /api/careers
// @access  Private/Admin
const createJob = async (req, res) => {
  try {
    const {
      jobTitle,
      jobType,
      department,
      location,
      description,
      requirements,
      responsibilities,
      salary,
      applicationDeadline,
    } = req.body;

    const job = await Career.create({
      jobTitle,
      jobType,
      department,
      location,
      description,
      requirements: Array.isArray(requirements) ? requirements : requirements.split('\n').filter(r => r.trim()),
      responsibilities: Array.isArray(responsibilities) ? responsibilities : responsibilities.split('\n').filter(r => r.trim()),
      salary,
      applicationDeadline,
    });

    res.status(201).json(job);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update job listing
// @route   PUT /api/careers/:id
// @access  Private/Admin
const updateJob = async (req, res) => {
  try {
    const job = await Career.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Update fields
    job.jobTitle = req.body.jobTitle || job.jobTitle;
    job.jobType = req.body.jobType || job.jobType;
    job.department = req.body.department || job.department;
    job.location = req.body.location || job.location;
    job.description = req.body.description || job.description;
    
    if (req.body.requirements) {
      job.requirements = Array.isArray(req.body.requirements) 
        ? req.body.requirements 
        : req.body.requirements.split('\n').filter(r => r.trim());
    }
    
    if (req.body.responsibilities) {
      job.responsibilities = Array.isArray(req.body.responsibilities) 
        ? req.body.responsibilities 
        : req.body.responsibilities.split('\n').filter(r => r.trim());
    }
    
    job.salary = req.body.salary || job.salary;
    job.applicationDeadline = req.body.applicationDeadline || job.applicationDeadline;
    job.isActive = req.body.isActive !== undefined ? req.body.isActive : job.isActive;

    const updatedJob = await job.save();
    res.json(updatedJob);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete job listing
// @route   DELETE /api/careers/:id
// @access  Private/Admin
const deleteJob = async (req, res) => {
  try {
    const job = await Career.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    await job.deleteOne();
    res.json({ message: 'Job removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Toggle job status
// @route   PATCH /api/careers/:id/toggle
// @access  Private/Admin
const toggleJobStatus = async (req, res) => {
  try {
    const job = await Career.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    job.isActive = !job.isActive;
    await job.save();

    res.json({ message: 'Job status updated', isActive: job.isActive });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  toggleJobStatus,
};