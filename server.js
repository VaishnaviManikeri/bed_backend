const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const Admin = require('./models/Admin');

// Load env variables
dotenv.config();

// Connect database
connectDB();

// Route imports
const adminRoutes = require('./routes/adminRoutes');
const galleryRoutes = require('./routes/galleryRoutes');
const noticeRoutes = require('./routes/noticeRoutes');
const careerRoutes = require('./routes/careerRoutes');
const blogRoutes = require('./routes/blogRoutes');

const app = express();

/* ================== CORS CONFIG ================== */

// ✅ Allowed origins
const allowedOrigins = [
  "https://jgefs.org",
  "https://www.jgefs.org",
  "http://localhost:5173",
  "http://localhost:3000",
];

// ✅ CORS middleware
app.use(cors({
  origin: function (origin, callback) {

    // allow requests with no origin (Postman, mobile apps)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log("❌ Blocked by CORS:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"]
}));

/* ================== MIDDLEWARE ================== */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ================== ROUTES ================== */

app.use('/api/admin', adminRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/careers', careerRoutes);
app.use('/api/blogs', blogRoutes);

/* ================== HEALTH CHECK ================== */

// Root route
app.get('/', (req, res) => {
  res.send("🚀 Server is running successfully on Hostinger!");
});

// Ping route (for uptime monitoring)
app.get('/ping', (req, res) => {
  res.status(200).send("Server is alive 🚀");
});

/* ================== HOSTINGER TEST API ================== */

// ✅ New API to verify backend is running on Hostinger
app.get('/api/hostinger-status', (req, res) => {
  res.status(200).json({
    success: true,
    message: "✅ Backend is running on Hostinger!",
    timestamp: new Date()
  });
});

/* ================== DEFAULT ADMIN ================== */

const createDefaultAdmin = async () => {
  try {
    const adminExists = await Admin.findOne({
      username: process.env.ADMIN_USERNAME || "jadhavar"
    });

    if (!adminExists) {
      await Admin.create({
        username: process.env.ADMIN_USERNAME || "jadhavar",
        password: process.env.ADMIN_PASSWORD || "jadhavar123",
      });

      console.log("✅ Default admin created successfully");
    }

  } catch (error) {
    console.error("❌ Error creating default admin:", error);
  }
};

/* ================== SERVER ================== */

// ✅ Updated PORT
const PORT = process.env.PORT || 5005;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  createDefaultAdmin();
});
