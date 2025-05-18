import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

dotenv.config();
console.log("JWT_SECRET:", process.env.JWT_SECRET);  // Should print your secret key
console.log("JWT_REFRESH_SECRET:", process.env.JWT_REFRESH_SECRET);  // Should print your refresh token secret

const app = express();

// CORS Configuration
const corsOptions = {
  origin: 'http://localhost:5173', // Frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));
app.options('*', cors()); // Enable preflight requests
app.use(express.json()); // Enable JSON body parsing

// Middleware for logging request time
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  req.setTimeout(10000); // 10 seconds timeout
  next();
});

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Define Mongoose Schemas and Models
const { Schema } = mongoose;

const userSchema = new Schema({
  username: { type: String, required: true },
  password: { type: String, required: true }, // Hashed password
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true }, // Store phone number
});

const lockerSchema = new Schema({
  lockerId: { type: Number, required: true },
  status: { type: String, required: true, default: 'free' },
  assignedUser: { type: Schema.Types.ObjectId, ref: 'User' },
  firstUser: { type: Schema.Types.ObjectId, ref: 'User' }, // Store the first user who booked
  lastAccessTime: { type: Date, default: Date.now },
  pin: { type: String },
});

const User = mongoose.model('User', userSchema);
const Locker = mongoose.model('Locker', lockerSchema);

// ✅ Register Route
app.post('/api/register', async (req, res) => {
  try {
    const { username, password, email, phone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'Email already in use' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword, email, phone });
    await newUser.save();

    res.status(201).json({ message: 'Registration successful' });
  } catch (error) {
    console.error('❌ Registration Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ Login Route
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    console.log("User found:", user);  // Log user to check if it's found

    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
      return res.status(500).json({ error: 'JWT secret not set' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

    res.status(200).json({ message: 'Login successful', token, refreshToken, phone: user.phone });
  } catch (error) {
    console.error('❌ Login Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ Refresh Token Route
app.post('/api/refresh-token', async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ error: 'Refresh token required' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const newToken = jwt.sign({ id: decoded.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ token: newToken });
  } catch (err) {
    console.error('❌ Error refreshing token:', err);
    res.status(403).json({ error: 'Invalid or expired refresh token' });
  }
});

// ✅ Fetch User Data Route (Requires Authentication)
app.get('/api/user', async (req, res) => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Token missing' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({
      id: user._id,
      username: user.username,
      email: user.email,
      phone: user.phone,
    });
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Session expired, please log in again' });
    }
    console.error('❌ Error fetching user data:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ Booking Route to assign first user
app.post('/api/book_locker', async (req, res) => {
  console.log("📥 Booking Request Received:", req.body);
  try {
    const { lockerId, userId } = req.body;

    const locker = await Locker.findOne({ lockerId });
    if (!locker) return res.status(400).json({ error: 'Locker not found' });

    if (locker.status === 'booked') {
      return res.status(400).json({ error: 'Locker is already booked' });
    }

    locker.status = 'booked';
    locker.assignedUser = userId;
    if (!locker.firstUser) {
      locker.firstUser = userId;  // Store the first user who books the locker
    }

    await locker.save();
    res.status(200).json({ message: 'Locker booked successfully' });
  } catch (err) {
    console.error('❌ Error booking locker:', err);
    res.status(500).json({ error: 'Error booking locker' });
  }
});

const PORT = process.env.PORT || 5020;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
