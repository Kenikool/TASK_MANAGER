import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";

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

// GET /api/profile - Get current user's profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch profile" });
  }
};

// PUT /api/profile - Update profile info (username, email, profileImg)
export const updateProfile = async (req, res) => {
  try {
    const { username, email, profileImg } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) return res.status(404).json({ error: "User not found" });

    // Check for unique username/email if changed
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser)
        return res.status(400).json({ error: "Username already taken" });
      user.username = username;
    }
    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail)
        return res.status(400).json({ error: "Email already taken" });
      user.email = email;
    }

    // Handle profile image upload (URL or base64)
    if (profileImg && typeof profileImg === "string" && profileImg.trim() !== "") {
      if (isValidUrl(profileImg)) {
        user.profileImg = profileImg;
      } else if (isBase64Image(profileImg)) {
        try {
          const uploadResponse = await cloudinary.uploader.upload(profileImg, {
            folder: "profile_pics",
            resource_type: "image",
          });
          user.profileImg = uploadResponse.secure_url;
        } catch (err) {
          return res.status(400).json({ error: "Failed to upload image to Cloudinary.", details: err.message });
        }
      } else {
        return res.status(400).json({ error: "Profile image must be a valid URL or base64 image string." });
      }
    }

    await user.save();
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      profileImg: user.profileImg,
      role: user.role,
      createdAt: user.createdAt,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to update profile" });
  }
};

// PUT /api/profile/password - Change password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res
        .status(400)
        .json({ error: "Both current and new password are required" });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch)
      return res.status(400).json({ error: "Current password is incorrect" });

    if (newPassword.length < 6)
      return res
        .status(400)
        .json({ error: "New password must be at least 6 characters" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to change password" });
  }
};
