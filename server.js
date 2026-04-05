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

/* ------------------ CORS CONFIG ------------------ */

const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://www.jgefs.org",
    "www.jgefs.org",
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(cors(corsOptions));

/* ------------------ MIDDLEWARE ------------------ */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ------------------ ROUTES ------------------ */

app.use('/api/admin', adminRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/careers', careerRoutes);
app.use('/api/blogs', blogRoutes);

/* ------------------ PING ROUTE ------------------ */
app.get('/', (req, res) => {
  res.send("🚀 Server is running successfully on Render!");
});

// ✅ UptimeRobot will hit this
app.get('/ping', (req, res) => {
  res.status(200).send("Server is alive 🚀");
});

/* ------------------ DEFAULT ADMIN ------------------ */

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

      console.log("Default admin created successfully");

    }

  } catch (error) {
    console.error("Error creating default admin:", error);
  }
};

/* ------------------ SERVER ------------------ */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  createDefaultAdmin();
});
