import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes.js';
import taskRoutes from './routes/taskRoutes.js';

// Configuration
dotenv.config();
const PORT = process.env.PORT || 5000;
const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000', // Lock down in production
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Enhanced MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,  // 5s timeout
      socketTimeoutMS: 45000,         // 45s socket timeout
      maxPoolSize: 10,                // Connection pool size
      retryWrites: true,
      w: 'majority'
    });
    console.log('✅ MongoDB Connected');
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1); // Exit on connection failure
  }
};

// Connection Event Listeners
mongoose.connection.on('connected', () => console.log('MongoDB event: Connected'));
mongoose.connection.on('disconnected', () => console.log('MongoDB event: Disconnected'));
mongoose.connection.on('error', (err) => console.error('MongoDB runtime error:', err));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);

// Health Check
app.get('/health', (req, res) => res.status(200).json({ status: 'OK' }));

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('⚠️ Server Error:', err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start Server with DB connection
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🔗 MongoDB Status: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
  });
}).catch(err => {
  console.error('🔥 Failed to start server:', err);
});