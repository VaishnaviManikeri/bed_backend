const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const Admin = require('./models/Admin');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Route imports
const adminRoutes = require('./routes/adminRoutes');
const galleryRoutes = require('./routes/galleryRoutes');
const noticeRoutes = require('./routes/noticeRoutes');
const careerRoutes = require('./routes/careerRoutes');
const blogRoutes = require('./routes/blogRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/careers', careerRoutes);
app.use('/api/blogs', blogRoutes);

// Create default admin if not exists
const createDefaultAdmin = async () => {
  try {
    const adminExists = await Admin.findOne({ username: process.env.ADMIN_USERNAME || 'jadhavar' });
    
    if (!adminExists) {
      await Admin.create({
        username: process.env.ADMIN_USERNAME || 'jadhavar',
        password: process.env.ADMIN_PASSWORD || 'jadhavar123',
      });
      console.log('Default admin created successfully');
    }
  } catch (error) {
    console.error('Error creating default admin:', error);
  }
};

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  createDefaultAdmin();
});