// server.js
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Define schemas and models
const { Schema } = mongoose;

const userSchema = new Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },  // hashed
  email: { type: String, required: true }
});

const lockerSchema = new Schema({
  lockerId: { type: Number, required: true },
  status: { type: String, required: true },
  assignedUser: { type: Schema.Types.ObjectId, ref: 'User' },
  lastAccessTime: { type: Date },
  pin: { type: String }  // hashed or encrypted
});

const User = mongoose.model('User', userSchema);
const Locker = mongoose.model('Locker', lockerSchema);

app.post('/api/register', async (req, res) => {
  try {
    const { username, password, email } = req.body;
    // Hash the password here if needed
    const newUser = new User({ username, password, email });
    await newUser.save();
    res.status(201).json(newUser);
    console.log(newUser);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});