// Comprehensive server.js for a Talent Management Platform
// Framework: Node.js with Express.js
// Database: MongoDB
// Authentication: JWT

const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(morgan('dev'));

// Static Files (for frontend build, if needed)
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// Models
const User = require('./models/User');
const Profile = require('./models/Profile');
const HireRequest = require('./models/HireRequest');

// Middleware Implementation
const authMiddleware = async (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ message: 'Access Denied' });
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ message: 'Invalid Token' });
  }
};

// Routes Implementation
// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = new User({ name, email, password: hashedPassword });
  try {
    const savedUser = await newUser.save();
    res.json(savedUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'User not found' });

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) return res.status(400).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.header('Authorization', token).json({ token });
});

// Profile Routes
app.post('/api/profile', authMiddleware, async (req, res) => {
  const { bio, skills, portfolio } = req.body;
  const newProfile = new Profile({ userId: req.user._id, bio, skills, portfolio });
  try {
    const savedProfile = await newProfile.save();
    res.json(savedProfile);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.get('/api/profile/:id', async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.params.id });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    res.json(profile);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Hire Routes
app.post('/api/hire', authMiddleware, async (req, res) => {
  const { talentId, projectDetails, budget } = req.body;
  const newHireRequest = new HireRequest({ clientId: req.user._id, talentId, projectDetails, budget });
  try {
    const savedRequest = await newHireRequest.save();
    res.json(savedRequest);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.get('/api/hire', authMiddleware, async (req, res) => {
  try {
    const requests = await HireRequest.find({ clientId: req.user._id });
    res.json(requests);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ message: 'Something broke!' });
});

// Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
