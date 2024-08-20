import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';  // Make sure bcrypt is imported
import jwt from 'jsonwebtoken';  // Make sure jwt is imported

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
        console.log(username)
        console.log(password)
        console.log(email)
      // Check if the email already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already in use' });
      }
  
      // Hash the password before saving
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const newUser = new User({ username, password: hashedPassword, email });
      console.log(newUser)
      await newUser.save();
  
      // After registration, send a success response
      res.status(201).json({ message: 'Registration successful' });
    } catch (error) {
      console.error('Registration error:', error);  // Log the error
      res.status(500).json({ error: 'Server error' });
    }
  });
  

  app.post('/api/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      console.log('Received email:', email);
      console.log('Received password:', password);
  
      // Find the user by email
      const user = await User.findOne({ email });
      if (!user) {
        console.log('User not found');
        return res.status(400).json({ error: 'Invalid credentials' });
      }
  
      console.log('User found:', user);
  
      // Compare the provided password with the hashed password
      const isMatch = await bcrypt.compare(password, user.password);
      console.log('Password match:', isMatch);
  
      if (!isMatch) {
        console.log('Password does not match');
        return res.status(400).json({ error: 'Invalid credentials' });
      }
  
      // Check if JWT_SECRET is defined
      if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET is not defined');
        return res.status(500).json({ error: 'Server error' });
      }
  
      // Generate JWT token
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  
      // Return success with token
      res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
      console.error('Login error:', error);  // Log error
      res.status(500).json({ error: 'Server error' });
    }
  });
  
  

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});