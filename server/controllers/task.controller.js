import Task from "../models/task.model.js";
import mongoose from "mongoose";
import cloudinary from "../utils/cloudinary.js";
import { logAdminAction } from "../utils/adminActionLogger.js";

// Helper: Validate MongoDB ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Helper: Validate if string is a URL
const isValidUrl = (str) => {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
};

// Helper: Validate if string is a base64 image
const isBase64Image = (str) => {
  return /^data:image\/(png|jpeg|jpg|gif|webp);base64,/.test(str);
};

// Helper: Validate image file type (basic check)
// const isValidImageMime = (mimetype) => {
//   return ["image/jpeg", "image/png", "image/gif", "image/webp"].includes(
//     mimetype
//   );
// };

// Helper: Upload image to Cloudinary
// const uploadToCloudinary = async (file) => {
//   return await cloudinary.uploader.upload(file.path, {
//     folder: "tasks",
//     resource_type: "image",
//   });
// };

// Create a new task with validation, user association, and image upload
export const createTask = async (req, res) => {
  try {
    const { title, description, status, dueDate, priority, image } = req.body;
    const userId = req.user && req.user._id;

    // Validate userId
    if (!userId || !isValidObjectId(userId)) {
      return res.status(401).json({ error: "Invalid or missing user ID." });
    }

    // Basic validation
    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return res
        .status(400)
        .json({ error: "Title is required and must be a non-empty string." });
    }

    if (status && !["pending", "in-progress", "completed"].includes(status)) {
      return res.status(400).json({ error: "Invalid status value." });
    }

    if (priority && !["low", "medium", "high"].includes(priority)) {
      return res.status(400).json({ error: "Invalid priority value." });
    }

    let parsedDueDate = dueDate ? new Date(dueDate) : undefined;
    if (dueDate && isNaN(parsedDueDate.getTime())) {
      return res.status(400).json({ error: "Invalid dueDate format." });
    }

    // Handle image upload (file or URL)
    // let imageUrl = null;
    // if (req.file) {
    //   // File upload (e.g., via multer middleware)
    //   if (!isValidImageMime(req.file.mimetype)) {
    //     return res.status(400).json({ error: "Invalid image file type." });
    //   }
    //   const uploadRes = await uploadToCloudinary(req.file);
    //   imageUrl = uploadRes.secure_url;
    // } else if (req.body.image) {
    //   // Direct URL (validate it's a URL)
    //   try {
    //     const url = new URL(req.body.image);
    //     imageUrl = url.href;
    //   } catch {
    //     return res.status(400).json({ error: "Invalid image URL." });
    //   }
    // }

    // Handle image upload (URL or base64)
    let imageUrl = null;
    if (image && typeof image === "string" && image.trim() !== "") {
      if (isValidUrl(image) || isBase64Image(image)) {
        try {
          const uploadResponse = await cloudinary.uploader.upload(image, {
            folder: "tasks",
            resource_type: "image",
          });
          imageUrl = uploadResponse.secure_url;
        } catch (err) {
          return res
            .status(400)
            .json({
              error: "Failed to upload image to Cloudinary.",
              details: err.message,
            });
        }
      } else {
        return res
          .status(400)
          .json({ error: "Image must be a valid URL or base64 image string." });
      }
    }
    const task = new Task({
      title: title.trim(),
      description: description ? description.trim() : "",
      status,
      dueDate: parsedDueDate,
      priority,
      user: userId,
      image: imageUrl,
    });

    await task.save();

    // Log admin action if the user is an admin
    if (req.user && req.user.role === "admin") {
      await logAdminAction(req.user._id, "Created task", "Task", task._id, {
        title: task.title,
        user: userId,
      });
    }

    res.status(201).json(task);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to create task.", details: error.message });
  }
};

// Get all tasks for the authenticated user with optional filtering and pagination
export const getAllTasks = async (req, res) => {
  try {
    const { status, priority, page = 1, limit = 20 } = req.query;
    const userId = req.user && req.user._id;

    if (!userId || !isValidObjectId(userId)) {
      return res.status(401).json({ error: "Invalid or missing user ID." });
    }

    const filter = { user: userId };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const tasks = await Task.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Task.countDocuments(filter);

    res.json({
      tasks,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch tasks.", details: error.message });
  }
};

// Get a single task by ID for the authenticated user
export const getTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user && req.user._id;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid task ID." });
    }
    if (!userId || !isValidObjectId(userId)) {
      return res.status(401).json({ error: "Invalid or missing user ID." });
    }

    const task = await Task.findOne({ _id: id, user: userId });
    if (!task) {
      return res.status(404).json({ error: "Task not found." });
    }

    // Log admin action if the user is an admin
    if (req.user && req.user.role === "admin") {
      await logAdminAction(req.user._id, "Updated task", "Task", task._id, {
        updates,
        user: userId,
      });
    }

    res.json(task);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch task.", details: error.message });
  }
};

// Update a task by ID for the authenticated user, with image upload
export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user && req.user._id;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid task ID." });
    }
    if (!userId || !isValidObjectId(userId)) {
      return res.status(401).json({ error: "Invalid or missing user ID." });
    }

    const updates = {};
    const allowedFields = [
      "title",
      "description",
      "status",
      "dueDate",
      "priority",
      "image",
    ];
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    // Field-specific validation
    if (
      updates.title &&
      (typeof updates.title !== "string" || updates.title.trim().length === 0)
    ) {
      return res
        .status(400)
        .json({ error: "Title must be a non-empty string." });
    }
    if (
      updates.status &&
      !["pending", "in-progress", "completed"].includes(updates.status)
    ) {
      return res.status(400).json({ error: "Invalid status value." });
    }
    if (
      updates.priority &&
      !["low", "medium", "high"].includes(updates.priority)
    ) {
      return res.status(400).json({ error: "Invalid priority value." });
    }
    if (updates.dueDate) {
      const parsedDueDate = new Date(updates.dueDate);
      if (isNaN(parsedDueDate.getTime())) {
        return res.status(400).json({ error: "Invalid dueDate format." });
      }
      updates.dueDate = parsedDueDate;
    }
    if (updates.title) updates.title = updates.title.trim();
    if (updates.description) updates.description = updates.description.trim();

    // Handle image update (URL or base64)
    if (
      updates.image &&
      typeof updates.image === "string" &&
      updates.image.trim() !== ""
    ) {
      if (isValidUrl(updates.image) || isBase64Image(updates.image)) {
        try {
          const uploadResponse = await cloudinary.uploader.upload(
            updates.image,
            {
              folder: "tasks",
              resource_type: "image",
            }
          );
          updates.image = uploadResponse.secure_url;
        } catch (err) {
          return res
            .status(400)
            .json({
              error: "Failed to upload image to Cloudinary.",
              details: err.message,
            });
        }
      } else {
        return res
          .status(400)
          .json({ error: "Image must be a valid URL or base64 image string." });
      }
    }

    const task = await Task.findOneAndUpdate(
      { _id: id, user: userId },
      updates,
      { new: true, runValidators: true }
    );
    if (!task) {
      return res.status(404).json({ error: "Task not found." });
    }
    res.json(task);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to update task.", details: error.message });
  }
};

// Delete a task by ID for the authenticated user
export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user && req.user._id;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid task ID." });
    }
    if (!userId || !isValidObjectId(userId)) {
      return res.status(401).json({ error: "Invalid or missing user ID." });
    }

    const task = await Task.findOneAndDelete({ _id: id, user: userId });
    if (!task) {
      return res.status(404).json({ error: "Task not found." });
    }

    // Log admin action if the user is an admin
    if (req.user && req.user.role === "admin") {
      await logAdminAction(req.user._id, "Deleted task", "Task", task._id, {
        title: task.title,
        user: userId,
      });
    }

    res.json({ message: "Task deleted successfully." });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to delete task.", details: error.message });
  }
};

// Search tasks by title or description for the authenticated user
export const searchTask = async (req, res) => {
  try {
    const { q } = req.query;
    const userId = req.user && req.user._id;

    if (!userId || !isValidObjectId(userId)) {
      return res.status(401).json({ error: "Invalid or missing user ID." });
    }
    if (!q || typeof q !== "string" || q.trim().length === 0) {
      return res.status(400).json({
        error: "Search query 'q' is required and must be a non-empty string.",
      });
    }
    const regex = new RegExp(q.trim(), "i");
    const tasks = await Task.find({
      user: userId,
      $or: [{ title: regex }, { description: regex }],
    });
    res.json(tasks);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to search tasks.", details: error.message });
  }
};
