import AdminAction from "../models/adminAction.model.js";

/**
 * Logs an admin action.
 * @param {ObjectId} adminId - The admin user's ID.
 * @param {String} action - Description of the action.
 * @param {String} [target] - Target entity type (e.g., "User", "Task").
 * @param {ObjectId} [targetId] - Target entity ID.
 * @param {Object} [details] - Additional details.
 */
export const logAdminAction = async (
  adminId,
  action,
  target,
  targetId,
  details
) => {
  try {
    await AdminAction.create({
      admin: adminId,
      action,
      target,
      targetId,
      details,
    });
  } catch (err) {
    console.error("Failed to log admin action:", err.message);
  }
};
