import { generateTokenAndSetCookie } from "../utils/generateToken.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { logAdminAction } from "../utils/adminActionLogger.js";

export const signup = async (req, res) => { 
  try {
    const { username, email, password } = req.body;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "Username is already taken" });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ error: "Email is already taken" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters long" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      generateTokenAndSetCookie(newUser._id, res);
      await newUser.save();

      // If an admin is creating this user (e.g., via an admin panel), log the action
      if (req.user && req.user.role === "admin") {
        await logAdminAction(
          req.user._id,
          "Created new user",
          "User",
          newUser._id,
          { username: newUser.username, email: newUser.email }
        );
      }

      res.status(201).json({
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        profileImg: newUser.profileImg,
      });
    } else {
      res.status(400).json({ error: "Invalid user data" });
    }
  } catch (error) {
    console.log("Error in signup controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user?.password || ""
    );

    if (!user || !isPasswordCorrect) {
      return res.status(400).json({ error: "Invalid username or password" });
    }

    generateTokenAndSetCookie(user._id, res);

    // Log admin logins for audit purposes
    if (user.role === "admin") {
      await logAdminAction(
        user._id,
        "Admin login",
        "User",
        user._id,
        { username: user.username, email: user.email }
      );
    }

    res.status(200).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      profileImg: user.profileImg,
    });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const logout = async (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    
    // Log admin logouts
    if (req.user && req.user.role === "admin") {
      await logAdminAction(
        req.user._id,
        "Admin logout",
        "User",
        req.user._id,
        { username: req.user.username, email: req.user.email }
      );
    }
    
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.status(200).json(user);
  } catch (error) {
    console.log("Error in getMe controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
