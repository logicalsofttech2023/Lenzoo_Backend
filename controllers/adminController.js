import { Policy, FAQ } from "../models/PolicyModel.js";
import Admin from "../models/AdminModel.js";
import jwt from "jsonwebtoken";
import Membership from "../models/MembershipModel.js";
import Product from "../models/Product.js";
import bcrypt from "bcrypt";
import User from "../models/UserModel.js";
import Purchase from "../models/Purchase.js";
import Transaction from "../models/TransactionModel.js";
import PrescriptionModel from "../models/PrescriptionModel.js";
import {Order} from "../models/Order.js";
import Favorite from "../models/Favorite.js";
import Appointment from "../models/Appointment.js";
import { addNotification } from "../utils/AddNotification.js";


const generateJwtToken = (user) => {
  return jwt.sign(
    { id: user._id, phone: user.phone, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

export const adminSignup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new admin
    const admin = await Admin.create({ name, email, password: hashedPassword });

    res.status(201).json({
      message: "Admin registered successfully",
      admin: { id: admin._id, name: admin.name, email: admin.email },
      token: generateJwtToken(admin),
    });
  } catch (error) {
    console.error("Admin Signup Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if admin exists
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    res.status(200).json({
      message: "Admin logged in successfully",
      admin: { id: admin._id, name: admin.name, email: admin.email },
      token: generateJwtToken(admin),
    });
  } catch (error) {
    console.error("Admin Login Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getAdminDetail = async (req, res) => {
  try {
    const adminId = req.user.id;

    // Await the query to resolve
    const admin = await Admin.findById(adminId).select("-otp -otpExpiresAt");

    if (!admin) {
      return res.status(400).json({ message: "User not found", status: false });
    }

    res.status(200).json({
      message: "Admin data fetched successfully",
      status: true,
      data: admin,
    });
  } catch (error) {
    console.error("Error fetching admin details:", error);
    res.status(500).json({ message: "Internal Server Error", status: false });
  }
};

export const resetAdminPassword = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { newPassword, confirmPassword } = req.body;

    if (!adminId || !newPassword || !confirmPassword) {
      return res.status(400).json({
        message: "Admin ID, new password, and confirm password are required",
        status: false,
      });
    }

    // Find admin by ID
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res
        .status(404)
        .json({ message: "Admin not found", status: false });
    }

    // Check if newPassword and confirmPassword match
    if (newPassword !== confirmPassword) {
      return res
        .status(400)
        .json({ message: "Passwords do not match", status: false });
    }

    // Check if new password is same as old password
    const isSamePassword = await bcrypt.compare(newPassword, admin.password);
    if (isSamePassword) {
      return res.status(400).json({
        message: "New password cannot be the same as the old password",
        status: false,
      });
    }

    // Hash the new password
    admin.password = await bcrypt.hash(newPassword, 10);
    await admin.save();

    res
      .status(200)
      .json({ message: "Password reset successful", status: true });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ message: "Internal Server Error", status: false });
  }
};

export const updateAdminDetail = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { name, email } = req.body;

    // Validate input
    if (!name || !email) {
      return res.status(400).json({
        message: "name, and email are required",
        status: false,
      });
    }

    // Find and update admin
    const updatedAdmin = await Admin.findByIdAndUpdate(
      adminId,
      { name, email },
      { new: true, select: "-password -otp -otpExpiresAt" }
    );

    if (!updatedAdmin) {
      return res
        .status(400)
        .json({ message: "Admin not found", status: false });
    }

    res.status(200).json({
      message: "Admin details updated successfully",
      status: true,
      data: updatedAdmin,
    });
  } catch (error) {
    console.error("Error updating admin details:", error);
    res.status(500).json({ message: "Internal Server Error", status: false });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    let { page = 1, limit = 10, search = "", status } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    let searchFilter = { role: "user", firstName: { $exists: true, $ne: "" } };
    if (search) {
      searchFilter = {
        $or: [
          { firstName: { $regex: search, $options: "i" } },
          { lastName: { $regex: search, $options: "i" } },
          { userEmail: { $regex: search, $options: "i" } },
        ],
      };
    }

    if (status) {
      searchFilter.status = status === "true";
    }

    const users = await User.find(searchFilter)
      .select("-otp -otpExpiresAt -password")
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    const totalUsers = await User.countDocuments(searchFilter);

    res.status(200).json({
      message: "Users fetched successfully",
      status: true,
      data: users,
      totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      message: "Internal Server Error",
      status: false,
      error: error.message,
    });
  }
};

export const getUserByIdInAdmin = async (req, res) => {
  try {
    const userId = req.query.id;
    let user = await User.findById(userId).select("-otp -otpExpiresAt");
    let membership = await Purchase.find({ userId: userId })
      .populate("membershipId")
      .sort({ createdAt: -1 });
    if (!user) {
      return res.status(404).json({ message: "User not found", status: false });
    }

    res.status(200).json({
      message: "User fetched successfully",
      status: true,
      data: { ...user, membership },
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", status: false });
  }
};

export const policyUpdate = async (req, res) => {
  try {
    const { type, content } = req.body;
    if (!type || !content) {
      return res
        .status(400)
        .json({ message: "Type and content are required", status: false });
    }

    let policy = await Policy.findOne({ type });
    if (policy) {
      policy.content = content;
      await policy.save();
      return res
        .status(200)
        .json({ message: "Policy updated successfully", status: true, policy });
    } else {
      policy = new Policy({ type, content });
      await policy.save();
      return res
        .status(200)
        .json({ message: "Policy created successfully", status: true, policy });
    }
  } catch (error) {
    console.error("Error updating policy:", error);
    res.status(500).json({
      message: "Internal Server Error",
      status: false,
      error: error.message,
    });
  }
};

export const getPolicy = async (req, res) => {
  try {
    const { type } = req.query;
    if (!type) {
      return res
        .status(400)
        .json({ message: "Policy type is required", status: false });
    }

    const policy = await Policy.findOne({ type });
    if (!policy) {
      return res
        .status(404)
        .json({ message: "Policy not found", status: false });
    }

    res
      .status(200)
      .json({ message: "Policy fetched successfully", status: true, policy });
  } catch (error) {
    console.error("Error fetching policy:", error);
    res.status(500).json({
      message: "Internal Server Error",
      status: false,
      error: error.message,
    });
  }
};

export const addUpdateMembership = async (req, res) => {
  try {
    const {
      title,
      description,
      membershipId,
      planType,
      price,
      status,
      benefits,
      durationInDays,
      isRecurring,
    } = req.body;

    if (!title || !description || !planType || !price || !durationInDays) {
      return res.status(400).json({
        message: "Missing required fields",
        status: false,
      });
    }

    let membership;

    if (membershipId) {
      // Update existing
      membership = await Membership.findById(membershipId);

      if (!membership) {
        return res.status(404).json({
          message: "Membership not found",
          status: false,
        });
      }

      membership.title = title ?? membership.title;
      membership.description = description ?? membership.description;
      membership.planType = planType ?? membership.planType;
      membership.price = price ?? membership.price;
      membership.status = status ?? membership.status;
      membership.benefits = benefits ?? membership.benefits;
      membership.durationInDays = durationInDays ?? membership.durationInDays;
      membership.isRecurring = isRecurring ?? membership.isRecurring;

      await membership.save();

      return res.status(200).json({
        message: "Membership updated",
        membership,
        status: true,
      });
    } else {
      // Create new
      const newMembership = new Membership({
        title,
        description,
        planType,
        price,
        status,
        benefits,
        durationInDays,
        isRecurring,
      });

      await newMembership.save();

      return res.status(201).json({
        message: "Membership created",
        membership: newMembership,
        status: true,
      });
    }
  } catch (error) {
    console.error("Error in addUpdateMembership:", error);
    return res.status(500).json({
      message: "Internal server error",
      status: false,
    });
  }
};

export const getAllMembership = async (req, res) => {
  try {
    const membership = await Membership.find();
    if (!membership) {
      return res
        .status(404)
        .json({ message: "Membership not found", status: false });
    }
    res.status(200).json({
      message: "Membership fetched successfully",
      status: true,
      membership,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal Server Error",
      status: false,
      error: error.message,
    });
  }
};

export const getMembershipById = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ message: "Membership ID is required" });
    }

    const membership = await Membership.findById(id);
    if (!membership) {
      return res.status(404).json({ message: "Membership not found" });
    }

    res
      .status(200)
      .json({ message: "Membership fetched successfully", membership });
  } catch (error) {
    console.error("Error fetching membership:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteMembership = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ message: "Membership ID is required" });
    }

    const membership = await Membership.findByIdAndDelete(id);
    if (!membership) {
      return res.status(404).json({ message: "Membership not found" });
    }

    res.status(200).json({ message: "Membership deleted successfully" });
  } catch (error) {}
};

export const addFAQ = async (req, res) => {
  try {
    const { question, answer, category } = req.body;

    if (!question || !answer) {
      return res
        .status(400)
        .json({ message: "Question and answer are required." });
    }

    const newFAQ = new FAQ({
      question,
      answer,
      category,
    });

    await newFAQ.save();

    res.status(200).json({ message: "FAQ added successfully", faq: newFAQ });
  } catch (error) {
    console.error("Error adding FAQ:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateFAQ = async (req, res) => {
  try {
    const { question, answer, category, isActive, id } = req.body;

    const updatedFAQ = await FAQ.findByIdAndUpdate(
      id,
      { question, answer, category, isActive },
      { new: true, runValidators: true }
    );

    if (!updatedFAQ) {
      return res.status(404).json({ message: "FAQ not found" });
    }

    res
      .status(200)
      .json({ message: "FAQ updated successfully", faq: updatedFAQ });
  } catch (error) {
    console.error("Error updating FAQ:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllFAQs = async (req, res) => {
  try {
    const faqs = await FAQ.find().sort({ createdAt: -1 });
    res.status(200).json({ faqs, message: "FAQ fetch successfully" });
  } catch (error) {
    console.error("Error fetching FAQs:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getFAQById = async (req, res) => {
  try {
    const { id } = req.query;
    const faq = await FAQ.findById(id);

    if (!faq) {
      return res.status(404).json({ message: "FAQ not found" });
    }

    res.status(200).json({ faq, message: "FAQ fetch successfully" });
  } catch (error) {
    console.error("Error fetching FAQ:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const addProduct = async (req, res) => {
  try {
    const {
      name,
      title,
      description,
      originalPrice,
      sellingPrice,
      productType,
      frameType,
      frameShape,
      frameSize,
      suitableFor,
      frameWidth,
      frameDimensions,
      frameColor,
      weight,
      material,
      pupillaryDistance,
      faceShape,
      quantityAvailable,
    } = req.body;

    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map((file) => `uploads/${file.filename}`);
    }

    // Required field validation
    if (
      !name ||
      !title ||
      !originalPrice ||
      !sellingPrice ||
      !productType ||
      !frameType ||
      !frameShape ||
      !frameSize ||
      !suitableFor?.length ||
      !quantityAvailable
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be filled",
      });
    }

    const newProduct = new Product({
      name,
      title,
      description,
      images,
      originalPrice,
      sellingPrice,
      productType,
      frameType,
      frameShape,
      frameSize,
      suitableFor,
      frameWidth,
      frameDimensions,
      frameColor,
      weight,
      material,
      pupillaryDistance,
      faceShape,
      quantityAvailable,
    });

    await newProduct.save();
    return res.status(201).json({ success: true, product: newProduct });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Server Error", error });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const { search = "", page = 1, limit = 10 } = req.query;

    const query = {
      name: { $regex: search, $options: "i" },
    };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [products, total] = await Promise.all([
      Product.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Product.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      message: "Fetched products successfully",
      data: products,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalItems: total,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching products",
      error: error.message,
    });
  }
};

export const getAllProductsInAdmin = async (req, res) => {
  try {
    let { page = 1, limit = 10, search = "" } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    let searchFilter = {};

    if (search) {
      searchFilter = {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { title: { $regex: search, $options: "i" } },
          { productType: { $regex: search, $options: "i" } },
          { frameType: { $regex: search, $options: "i" } },
          { frameShape: { $regex: search, $options: "i" } },
        ],
      };
    }

    const products = await Product.find(searchFilter)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    const totalProducts = await Product.countDocuments(searchFilter);

    return res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      data: products,
      totalProducts,
      totalPages: Math.ceil(totalProducts / limit),
      currentPage: page,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.query;

    const product = await Product.findById(id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    return res.status(200).json({ success: true, product });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Server Error", error });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.query;

    // Fetch existing product
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Destructure request body
    const {
      name,
      title,
      description,
      originalPrice,
      sellingPrice,
      productType,
      frameType,
      frameShape,
      frameSize,
      suitableFor,
      frameWidth,
      frameDimensions,
      frameColor,
      weight,
      material,
      pupillaryDistance,
      faceShape,
      quantityAvailable,
    } = req.body;

    // Validate required fields
    if (
      !name ||
      !title ||
      !originalPrice ||
      !sellingPrice ||
      !productType ||
      !frameType ||
      !frameShape ||
      !frameSize ||
      !quantityAvailable ||
      !suitableFor?.length
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be filled",
      });
    }

    // Handle uploaded images
    let uploadedImages = [];
    if (req.files && req.files.length > 0) {
      uploadedImages = req.files.map((file) => `uploads/${file.filename}`);
    }

    // Update directly from req.body with validation
    product.name = name;
    product.title = title;
    product.description = description;
    product.originalPrice = originalPrice;
    product.sellingPrice = sellingPrice;
    product.productType = productType;
    product.frameType = frameType;
    product.frameShape = frameShape;
    product.frameSize = frameSize;
    product.suitableFor = suitableFor;
    product.frameWidth = frameWidth;
    product.frameDimensions = frameDimensions;
    product.frameColor = frameColor;
    product.weight = weight;
    product.material = material;
    product.pupillaryDistance = pupillaryDistance;
    product.faceShape = faceShape;
    product.quantityAvailable = quantityAvailable;

    // Append new images if any
    if (uploadedImages.length > 0) {
      product.images = [...product.images, ...uploadedImages];
    }

    await product.save();

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.query;

    const deletedProduct = await Product.findByIdAndDelete(id);
    if (!deletedProduct) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Server Error", error });
  }
};

export const getAllPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.find()
      .populate("userId membershipId")
      .sort({ createdAt: -1 });
    res.status(200).json({
      purchases,
      status: true,
      message: "All purchases fetched successfully",
    });
  } catch (error) {
    console.error("Error in getAllPurchases:", error);
    res.status(500).json({ message: "Internal Server Error", status: false });
  }
};

export const getAllTransaction = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    // First, find matching user IDs if search keyword is provided
    let userFilter = {};

    if (search) {
      const regex = new RegExp(search, "i");
      const matchingUsers = await User.find({
        $or: [{ firstName: regex }, { lastName: regex }],
      }).select("_id");

      const userIds = matchingUsers.map((user) => user._id);
      userFilter.userId = { $in: userIds };
    }

    const totalTransactions = await Transaction.countDocuments(userFilter);

    const transactions = await Transaction.find(userFilter)
      .populate("userId")
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    return res.status(200).json({
      message: "Transaction history fetched successfully",
      status: true,
      totalTransactions,
      currentPage: pageNum,
      totalPages: Math.ceil(totalTransactions / limitNum),
      data: transactions,
    });
  } catch (error) {
    console.error("Error fetching transaction history:", error);
    return res.status(500).json({
      message: "Server Error",
      status: false,
    });
  }
};

export const getAllPrescription = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    // First, find matching user IDs if search keyword is provided
    let userFilter = {};

    if (search) {
      const regex = new RegExp(search, "i");
      const matchingUsers = await User.find({
        $or: [{ firstName: regex }, { lastName: regex }],
      }).select("_id");

      const userIds = matchingUsers.map((user) => user._id);
      userFilter.userId = { $in: userIds };
    }

    const totalPrescriptions = await PrescriptionModel.countDocuments(
      userFilter
    );

    const prescriptions = await PrescriptionModel.find(userFilter)
      .populate("userId")
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    return res.status(200).json({
      message: "Prescription fetched successfully",
      status: true,
      totalPrescriptions,
      currentPage: pageNum,
      totalPages: Math.ceil(totalPrescriptions / limitNum),
      data: prescriptions,
    });
  } catch (error) {
    console.error("Error fetching prescription:", error);
    return res.status(500).json({
      message: "Server Error",
      status: false,
    });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    const allowedStatuses = [
      "placed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];

    if (!orderId || !status) {
      return res.status(400).json({
        success: false,
        message: "orderId and status are required",
      });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    // Update status
    order.orderStatus = status;
    await order.save();

    // 🔔 Notify User
    const userId = order.userId;
    const user = await User.findById(userId);

    if (user) {
      const statusMessages = {
        placed: "has been placed successfully",
        processing: "is now being processed",
        shipped: "has been shipped",
        delivered: "has been delivered",
        cancelled: "has been cancelled",
      };

      const title = "Order Status Update";
      const body = `Your order (ID: ${order._id}) ${statusMessages[status]}.`;

      try {
        await addNotification(userId, title, body);

        // Optional push notification
        if (user.firebaseToken) {
          // await sendNotification(user.firebaseToken, title, body);
        }
      } catch (notificationError) {
        console.error("Notification Error:", notificationError);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    console.error("Update Order Status Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error,
    });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const { search = "", page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = {};

    // Get matching user IDs if search keyword is provided
    if (search) {
      const userQuery = {
        $or: [
          { firstName: { $regex: search, $options: "i" } },
          { lastName: { $regex: search, $options: "i" } },
        ],
      };

      const matchingUsers = await User.find(userQuery).select("_id");
      const matchingUserIds = matchingUsers.map((user) => user._id);

      query.$or = [
        { orderId: { $regex: search, $options: "i" } },
        { userId: { $in: matchingUserIds } },
      ];
    }

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate("userId", "firstName lastName email")
        .populate("items.productId")
        .populate("shippingAddress")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Order.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      message: "Fetched orders successfully",
      data: orders,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalItems: total,
    });
  } catch (error) {
    console.error("Error in getAllOrders:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching orders",
      error: error.message,
    });
  }
};

export const getOrderByUserIdInAdmin = async (req, res) => {
  try {
    const { userId } = req.query;
    const orders = await Order.find({ userId }).populate("items.productId").populate("shippingAddress");

    return res.status(200).json({
      success: true,
      message: "Fetched orders successfully",
      data: orders,
    });
  } catch (error) {
    console.error("Error in getOrderByUserIdInAdmin:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching orders",
      error: error.message,
    });
  }
};

export const getUserDetailsById = async (req, res) => {
  try {
    const { id } = req.query;

    const user = await User.findById(id).lean();
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const orders = await Order.find({ userId: id }).populate("items.productId");
    const prescriptions = await PrescriptionModel.find({ userId: id });
    const favorites = await Favorite.find({ userId: id }).populate("productId");
    const appointments = await Appointment.find({ userId: id }).populate("userId");

    user.orders = orders;
    user.prescriptions = prescriptions;
    user.favorites = favorites;
    user.appointments = appointments;

    return res.status(200).json({
      success: true,
      message: "User details fetched successfully",
      user,
    });
  } catch (error) {
    console.error("Error in getUserDetailsById:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching user details",
      error: error.message,
    });
  }
};

export const getAllAppointments = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    let userFilter = {};

    if (search) {
      const regex = new RegExp(search, "i");
      const matchingUsers = await User.find({
        $or: [{ firstName: regex }, { lastName: regex }],
      }).select("_id");

      const userIds = matchingUsers.map((user) => user._id);
      userFilter.userId = { $in: userIds };
    }

    const totalAppointments = await Appointment.countDocuments(userFilter);

    const Appointments = await Appointment.find(userFilter)
      .populate("userId")
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    return res.status(200).json({
      message: "Appointments fetched successfully",
      status: true,
      totalAppointments,
      currentPage: pageNum,
      totalPages: Math.ceil(totalAppointments / limitNum),
      data: Appointments,
    });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return res.status(500).json({
      message: "Server Error",
      status: false,
    });
  }
};

export const updateAppointmentStatus = async (req, res) => {
  try {
    const { status, id } = req.body;

    const allowedStatuses = [
      "booked",
      "cancelled_by_admin",
      "completed",
      "rescheduled",
    ];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const updated = await Appointment.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    
    if (!updated)
      return res.status(404).json({ status: false, message: "Appointment not found" });

    const userDetail = await User.findById(updated.userId);
    

    if (!userDetail) {
      return res.status(400).json({ message: "User not found", status: false });
    }
    // 🔔 Send Notification to user
    const user = userDetail._id;
    let title = "Appointment Status Updated";
    let body = `Your eye test appointment has been ${status.replaceAll(
      "_",
      " "
    )}.`;

    try {
      await addNotification(user._id, title, body);

      // 🔁 Uncomment if using Firebase Cloud Messaging
      // if (userDetail.firebaseToken) {
      //   await sendNotification(user.firebaseToken, title, body);
      // }
    } catch (notificationErr) {
      console.error("Notification error:", notificationErr);
    }

    res.status(200).json({ status: true, message: "Status updated",  appointment: updated });
  } catch (error) {
    res.status(500).json({ status: false, message: "Update failed", error });
  }
};
