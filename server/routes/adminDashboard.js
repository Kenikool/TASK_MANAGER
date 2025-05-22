import express from "express";
import User from "../models/user.model.js";
import Task from "../models/task.model.js";
import AdminAction from "../models/adminAction.model.js";
import { protectRoute, adminOnly } from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 * GET /api/admin/dashboard
 * Returns advanced statistics for the admin dashboard, including recent admin actions.
 * Protected: Admins only.
 */
router.get("/dashboard", protectRoute, adminOnly, async (req, res) => {
  try {
    // Basic counts
    const userCount = await User.countDocuments();
    const adminCount = await User.countDocuments({ role: "admin" });
    const taskCount = await Task.countDocuments();

    // User role breakdown
    const userRoleBreakdown = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } }
    ]);

    // Task status breakdown
    const taskStatusBreakdown = await Task.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    // Recent users (last 5)
    const recentUsers = await User.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .select("username email role createdAt");

    // Recent tasks (last 5)
    const recentTasks = await Task.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", "username email")
      .select("title status createdAt dueDate");

    // Most active users (top 5 by task count)
    const mostActiveUsers = await Task.aggregate([
      { $group: { _id: "$user", taskCount: { $sum: 1 } } },
      { $sort: { taskCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userInfo"
        }
      },
      { $unwind: "$userInfo" },
      {
        $project: {
          _id: 0,
          userId: "$userInfo._id",
          username: "$userInfo.username",
          email: "$userInfo.email",
          taskCount: 1
        }
      }
    ]);

    // Overdue tasks (tasks with dueDate in the past and not completed)
    const now = new Date();
    const overdueTasks = await Task.find({
      dueDate: { $lt: now },
      status: { $ne: "completed" }
    })
      .populate("user", "username email")
      .select("title status dueDate user");

    // Recent admin actions (last 5)
    const recentAdminActions = await AdminAction.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("admin", "username email")
      .select("action target targetId details createdAt admin");

    res.json({
      userCount,
      adminCount,
      taskCount,
      userRoleBreakdown,
      taskStatusBreakdown,
      recentUsers,
      recentTasks,
      mostActiveUsers,
      overdueTasks,
      recentAdminActions,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch dashboard data." });
  }
});

export default router;
