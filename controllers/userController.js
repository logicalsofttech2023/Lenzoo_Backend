import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import User from "../models/UserModel.js";
import path from "path";
import crypto from "crypto";
import Transaction from "../models/TransactionModel.js";
import { addNotification } from "../utils/AddNotification.js";
import Membership from "../models/MembershipModel.js";
import Purchase from "../models/Purchase.js";
import Product from "../models/Product.js";
import Favorite from "../models/Favorite.js";
import { calculateEndDate } from "../utils/dateUtils.js";
import Prescription from "../models/PrescriptionModel.js";

const generateJwtToken = (user) => {
  return jwt.sign(
    { id: user._id, phone: user.phone, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

const generateFourDigitOtp = () => {
  return Math.floor(1000 + Math.random() * 9000).toString(); // Generates a random 4-digit number
};

const generateTransactionId = () => {
  const randomString = crypto.randomBytes(5).toString("hex").toUpperCase(); // 10 characters
  const formattedId = `QV${randomString.match(/.{1,2}/g).join("")}`; // PJ + split into 2-char groups
  return formattedId;
};

export const generateOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({
        message: "phone, is required",
        status: false,
      });
    }

    let user = await User.findOne({ phone });

    const generatedOtp = generateFourDigitOtp();
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

    if (user) {
      user.otp = generatedOtp;
      user.otpExpiresAt = otpExpiresAt;
    } else {
      user = new User({
        phone,
        otp: generatedOtp,
        otpExpiresAt,
      });
    }

    await user.save();

    res.status(200).json({
      message: "OTP generated and sent successfully",
      status: true,
      data: user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error", status: false });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { phone, otp, firebaseToken } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({
        message: "phone, and otp are required",
        status: false,
      });
    }

    let user = await User.findOne({ phone });

    if (!user || user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP", status: false });
    }

    if (new Date() > new Date(user.otpExpiresAt)) {
      return res.status(400).json({ message: "OTP expired", status: false });
    }

    user.otpExpiresAt = "";
    user.isVerified = true;
    user.firebaseToken = firebaseToken;
    await user.save();

    let token = "";
    let userExit = false;
    if (user.firstName) {
      token = generateJwtToken(user);
      userExit = true;
    }

    res.status(200).json({
      message: "OTP verified successfully",
      status: true,
      token,
      userExit,
      data: user,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", status: false });
  }
};

export const resendOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({
        message: "phone are required",
        status: false,
      });
    }

    let user = await User.findOne({ phone });
    if (!user) {
      return res.status(400).json({ message: "User not found", status: false });
    }

    const generatedOtp = generateFourDigitOtp();
    user.otp = generatedOtp;
    user.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();

    res.status(200).json({
      message: "OTP resent successfully",
      status: true,
      data: user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", status: false });
  }
};

export const completeRegistration = async (req, res) => {
  try {
    const { phone, firstName, userEmail, firebaseToken, lastName } = req.body;
    const profileImage = req.file ? req.file.path : "";

    let user = await User.findOne({ phone });
    if (!user || !user.isVerified) {
      return res
        .status(400)
        .json({ message: "User not verified", status: false });
    }

    if (!firstName) {
      return res
        .status(400)
        .json({ message: "firstName are required", status: false });
    }

    user.firstName = firstName || "";
    user.userEmail = userEmail || "";
    user.profileImage = profileImage || "";
    user.lastName = lastName || "";
    user.isVerified = false;
    user.firebaseToken = firebaseToken || "";
    await user.save();

    const token = generateJwtToken(user);

    res.status(201).json({
      message: "User registered successfully",
      status: true,
      token,
      data: user,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", status: false });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { firstName, userEmail, lastName } = req.body;

    // Fixing profile image path
    const profileImage = req.file
      ? req.file.path.split(path.sep).join("/")
      : "";

    let user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found", status: false });
    }

    // Update fields
    if (firstName) user.firstName = firstName;
    if (userEmail) user.userEmail = userEmail;
    if (profileImage) user.profileImage = profileImage;
    if (lastName) user.lastName = lastName;

    await user.save();

    res
      .status(200)
      .json({ message: "Profile updated successfully", status: true, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", status: false });
  }
};

export const getUserById = async (req, res) => {
  try {
    const userId = req.user.id;
    let user = await User.findById(userId).select("-otp -otpExpiresAt"); // Exclude sensitive fields
    if (!user) {
      return res.status(404).json({ message: "User not found", status: false });
    }

    res
      .status(200)
      .json({ message: "User fetched successfully", status: true, data: user });
  } catch (error) {
    res.status(500).json({ message: "Server Error", status: false });
  }
};

export const addMoneyToWallet = async (req, res) => {
  try {
    const userId = req.user.id;
    let { amount } = req.body;

    // Convert amount to number
    amount = parseFloat(amount);

    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount", status: false });
    }

    let user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found", status: false });
    }

    // Ensure wallet is a number
    user.wallet = Number(user.wallet) + amount;
    await user.save();

    // Generate unique transaction ID using crypto
    const transactionId = generateTransactionId();

    // Create a new transaction record
    const transaction = new Transaction({
      userId,
      amount,
      type: "addMoney",
      status: "success",
      transactionId,
      description: `Added ₹${amount} to wallet`,
    });

    await transaction.save();

    // 🛎️ Send notification
    const title = "Wallet Amount Added";
    const body = `₹${amount} has been added to your wallet. Your new balance is ₹${user.wallet}.`;

    try {
      // 💾 Add notification to DB
      await addNotification(userId, title, body);

      // 📲 Send push notification if token exists
      // if (user.firebaseToken) {
      //   await sendNotification(user.firebaseToken, title, body);
      // }
    } catch (notificationError) {
      console.error("Notification Error:", notificationError);
      // Notification fail hone par bhi success response bhej rahe hain
    }

    res.status(200).json({
      message: `₹${amount} added to wallet successfully`,
      status: true,
      walletBalance: user.wallet,
      transaction,
    });
  } catch (error) {
    console.error("Error in addMoneyToWallet:", error);
    res.status(500).json({ message: "Server Error", status: false });
  }
};

export const createPurchase = async (req, res) => {
  try {
    const { userId, membershipId, amount } = req.body;

    if (!userId || !membershipId || !amount) {
      return res
        .status(400)
        .json({ message: "Missing required fields", status: false });
    }

    const membership = await Membership.findById(membershipId);
    if (!membership) {
      return res
        .status(404)
        .json({ message: "Membership not found", status: false });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found", status: false });
    }

    const startDate = new Date();
    const endDate = calculateEndDate(startDate, membership.durationInDays);

    const purchase = new Purchase({
      userId,
      membershipId,
      amount,
      type: "purchase",
      startDate,
      endDate,
    });
    await purchase.save();

    const transactionId = generateTransactionId();
    const transaction = new Transaction({
      userId,
      amount,
      type: "purchase",
      status: "success",
      transactionId,
      description: `Purchased membership: ${membership.title}`,
    });
    await transaction.save();

    const title = "Membership Purchase Successful";
    const body = `You have successfully purchased the ${membership.title} plan for ₹${amount}.`;

    try {
      await addNotification(userId, title, body);
    } catch (notificationError) {
      console.error("Notification Error:", notificationError);
    }

    res.status(201).json({
      message: "Purchase successful",
      status: true,
      purchase,
      transaction,
    });
  } catch (error) {
    console.error("Error in createPurchase:", error);
    res.status(500).json({ message: "Internal Server Error", status: false });
  }
};

export const renewMembership = async (req, res) => {
  try {
    const userId = req.user.id;
    const { membershipId, amount } = req.body;

    if (!membershipId || !amount) {
      return res
        .status(400)
        .json({ message: "Missing required fields", status: false });
    }

    const membership = await Membership.findById(membershipId);
    if (!membership) {
      return res
        .status(404)
        .json({ message: "Membership not found", status: false });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found", status: false });
    }

    const startDate = new Date();
    const endDate = calculateEndDate(startDate, membership.durationInDays);

    const renewedPurchase = new Purchase({
      userId,
      membershipId,
      amount,
      type: "renewal",
      startDate,
      endDate,
    });
    await renewedPurchase.save();

    const transactionId = generateTransactionId();
    const transaction = new Transaction({
      userId,
      amount,
      type: "renewal",
      status: "success",
      transactionId,
      description: `Renewed membership: ${membership.title}`,
    });
    await transaction.save();

    const title = "Membership Renewed Successfully";
    const body = `Your ${membership.title} plan has been renewed successfully for ₹${amount}.`;

    try {
      await addNotification(userId, title, body);
    } catch (notificationError) {
      console.error("Notification Error:", notificationError);
    }

    res.status(200).json({
      message: "Membership renewed successfully",
      status: true,
      purchase: renewedPurchase,
      transaction,
    });
  } catch (error) {
    console.error("Error in renewMembership:", error);
    res.status(500).json({ message: "Internal Server Error", status: false });
  }
};

export const getMyPlan = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find the most recent purchase for the user
    const latestPurchase = await Purchase.findOne({ userId })
      .sort({ createdAt: -1 })
      .populate("membershipId");

    if (!latestPurchase) {
      return res.status(404).json({
        message: "No membership plan found for this user",
        status: false,
      });
    }

    res.status(200).json({
      status: true,
      message: "Membership plan fetched successfully",
      plan: latestPurchase,
    });
  } catch (error) {
    console.error("Error in getMyPlan:", error);
    res.status(500).json({ message: "Internal Server Error", status: false });
  }
};

export const getAllProductsInUser = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      products,
      message: "Products fetched successfully",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Server Error", error });
  }
};

export const toggleFavoriteProduct = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.query;

    const existingFavorite = await Favorite.findOne({ userId, productId });

    if (existingFavorite) {
      // Remove favorite
      await Favorite.findByIdAndDelete(existingFavorite._id);
      return res
        .status(200)
        .json({ success: true, message: "Product removed from favorites" });
    } else {
      // Add favorite
      const newFavorite = new Favorite({ userId, productId });
      await newFavorite.save();
      return res
        .status(200)
        .json({ success: true, message: "Product added to favorites" });
    }
  } catch (error) {
    console.error("❌ Toggle Favorite Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error });
  }
};

export const getUserFavorites = async (req, res) => {
  try {
    const userId = req.user.id;

    const favorites = await Favorite.find({ userId }).populate("productId");

    const favoriteProducts = favorites.map((fav) => fav.productId);

    return res.status(200).json({
      success: true,
      favorites: favoriteProducts,
      message: "Favorites fetched successfully",
    });
  } catch (error) {
    console.error("❌ Fetch Favorites Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error });
  }
};

export const addPrescription = async (req, res) => {
  try {
    const userId = req.user.id;
    const { notes } = req.body;

    if (!req.file) {
      return res
        .status(400)
        .json({ message: "Prescription file is required", status: false });
    }

    // Clean and normalize the path to be relative: "uploads/filename.ext"
    const relativePath = path
      .join("uploads", path.basename(req.file.path))
      .replace(/\\/g, "/");

    const prescription = await Prescription.create({
      userId,
      notes,
      prescriptionFile: relativePath,
    });

    res.status(201).json({
      status: true,
      message: "Prescription uploaded successfully",
      data: prescription,
    });
  } catch (error) {
    console.error("Error uploading prescription:", error);
    res.status(500).json({ status: false, message: "Internal Server Error" });
  }
};
