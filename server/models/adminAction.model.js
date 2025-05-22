import mongoose from "mongoose";

const adminActionSchema = new mongoose.Schema(
  {
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      required: true,
    },
    target: {
      type: String, // e.g., "User", "Task"
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    details: {
      type: Object, // Additional info about the action
    },
  },
  { timestamps: true }
);

const AdminAction = mongoose.model("AdminAction", adminActionSchema);

export default AdminAction;
