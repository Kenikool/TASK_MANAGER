import express from "express";
import multer from "multer";
import {
  createTask,
  getAllTasks,
  getTask,
  updateTask,
  deleteTask,
  searchTask,
} from "../controllers/task.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// Multer setup for image upload (in-memory storage)

// Create a task (with optional image upload)
router.post("/", protectRoute, createTask);

// Get all tasks for the authenticated user
router.get("/", protectRoute, getAllTasks);

// Search tasks for the authenticated user
router.get("/search", protectRoute, searchTask);

// Get a single task by ID
router.get("/:id", protectRoute, getTask);

// Update a task (with optional image upload)
router.put("/:id", protectRoute, updateTask);

// Delete a task
router.delete("/:id", protectRoute, deleteTask);

export default router;
