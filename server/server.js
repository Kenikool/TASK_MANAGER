import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.route.js";
import taskRoutes from "./routes/task.route.js";
//import userRoutes from "./routes/user.js";
import { v2 as cloudinary } from "cloudinary";
import adminRoutes from "./routes/adminDashboard.js";
import profileRoutes from "./routes/profile.routes.js";

// Configure Cloudinary (ensure these env vars are set)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: 326412937225825, //process.env.CLOUDINARY_API_KEY ,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
dotenv.config();

const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());

// routes
app.get(
  "/",
  async(req, (res) => {
    res.send("Hello World");
  })
);
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/profile", profileRoutes);
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});
