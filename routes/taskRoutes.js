import express from 'express';
import Task from '../models/taskModel.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, async (req, res) => {
  const task = await Task.create({ user: req.user, text: req.body.text });
  res.json(task);
});

router.get('/', protect, async (req, res) => {
  const tasks = await Task.find({ user: req.user });
  res.json(tasks);
});

export default router;
