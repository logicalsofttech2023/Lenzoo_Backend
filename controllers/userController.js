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
import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import { Policy, FAQ } from "../models/PolicyModel.js";

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

export const addToCart = async (req, res) => {
  try {
    const { userId, productId, quantity = 1 } = req.body;

    if (!userId || !productId) {
      return res.status(400).json({
        success: false,
        message: "userId and productId are required",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (quantity > product.quantityAvailable) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.quantityAvailable} items in stock`,
      });
    }

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({
        userId,
        items: [{ productId, quantity }],
      });
    } else {
      const itemIndex = cart.items.findIndex(
        (item) => item.productId.toString() === productId
      );

      if (itemIndex > -1) {
        const existingQty = cart.items[itemIndex].quantity;
        const newQty = existingQty + quantity;

        if (newQty > product.quantityAvailable) {
          return res.status(400).json({
            success: false,
            message: `Cannot add ${quantity}. Only ${
              product.quantityAvailable - existingQty
            } more allowed`,
          });
        }

        cart.items[itemIndex].quantity = newQty;
      } else {
        cart.items.push({ productId, quantity });
      }
    }

    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Product added to cart",
      cart,
    });
  } catch (error) {
    console.error("Add to Cart Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error,
    });
  }
};

export const getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "userId is required" });
    }

    const cart = await Cart.findOne({ userId }).populate("items.productId");

    if (!cart) {
      return res.status(200).json({ success: true, cart: { items: [] } });
    }

    return res.status(200).json({
      success: true,
      cart,
    });
  } catch (error) {
    console.error("Get Cart Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server Error", error });
  }
};

export const updateCartQuantity = async (req, res) => {
  try {
    const { userId, productId, action } = req.body;

    if (!userId || !productId || !["increment", "decrement"].includes(action)) {
      return res.status(400).json({
        success: false,
        message:
          "userId, productId, and valid action (increment/decrement) are required",
      });
    }

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );
    if (itemIndex === -1) {
      return res
        .status(404)
        .json({ success: false, message: "Product not in cart" });
    }

    if (action === "increment") {
      const product = await Product.findById(productId);
      if (!product) {
        return res
          .status(404)
          .json({ success: false, message: "Product not found" });
      }

      if (cart.items[itemIndex].quantity + 1 > product.quantityAvailable) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.quantityAvailable} items in stock`,
        });
      }
      cart.items[itemIndex].quantity += 1;
    } else if (action === "decrement") {
      if (cart.items[itemIndex].quantity > 1) {
        cart.items[itemIndex].quantity -= 1;
      } else {
        return res.status(400).json({
          success: false,
          message: "Minimum quantity is 1",
        });
      }
    }

    await cart.save();

    return res
      .status(200)
      .json({ success: true, message: "Cart updated", cart });
  } catch (error) {
    console.error("Update Cart Quantity Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server Error", error });
  }
};

export const checkout = async (req, res) => {
  try {
    const userId = req.user.id;
    const {shippingAddress } = req.body;

    if (!userId || !shippingAddress) {
      return res.status(400).json({
        success: false,
        message: "userId and shipping address are required",
      });
    }

    // Get user's cart
    const cart = await Cart.findOne({ userId }).populate("items.productId");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    // Prepare order items and calculate total
    let totalAmount = 0;
    const orderItems = cart.items.map((item) => {
      const price = item.productId.sellingPrice || 0;
      const quantity = item.quantity;
      totalAmount += price * quantity;

      return {
        productId: item.productId._id,
        quantity,
        price,
      };
    });

    // Create order
    const newOrder = new Order({
      userId,
      items: orderItems,
      totalAmount,
      shippingAddress,
      paymentStatus: "pending",
    });

    await newOrder.save();

    // Clear user's cart
    await Cart.findOneAndDelete({ userId });

    // 🔐 Generate Transaction ID
    const transactionId = generateTransactionId();

    // 💳 Create a Transaction Record
    const transaction = new Transaction({
      userId,
      amount: totalAmount,
      type: "checkout",
      status: "success",
      transactionId,
      description: `Order placed worth ₹${totalAmount}`,
    });

    await transaction.save();

    // 🔔 Notify User
    const user = await User.findById(userId);

    const title = "Order Placed Successfully";
    const body = `Your order of ₹${totalAmount} has been placed. Order ID: ${newOrder._id}`;

    try {
      await addNotification(userId, title, body);

      // Optional push notification
      // if (user.firebaseToken) {
      //   await sendNotification(user.firebaseToken, title, body);
      // }
    } catch (notificationError) {
      console.error("Notification Error:", notificationError);
    }

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order: newOrder,
      transaction,
    });
  } catch (error) {
    console.error("Checkout Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server Error", error });
  }
};

export const getOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "userId is required" });
    }

    const orders = await Order.find({ userId })
      .populate("items.productId")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("Get Orders Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server Error", error });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const { orderId, userId } = req.body;

    if (!orderId || !userId) {
      return res.status(400).json({
        success: false,
        message: "orderId and userId are required",
      });
    }

    const order = await Order.findOne({ _id: orderId, userId });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (["shipped", "delivered", "cancelled"].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled at this stage (${order.orderStatus})`,
      });
    }

    order.orderStatus = "cancelled";
    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    console.error("Cancel Order Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error,
    });
  }
};

export const chatBot = async (req, res) => {
  try {
    const userId = req.user.id;
    const { message } = req.body;

    if (!message || !userId)
      return res.status(400).json({ error: "Message and userId are required" });

    const lowerMsg = message.toLowerCase();

    // Check for English order-related keywords
    const orderKeywords = [
      "order",
      "delivery",
      "status",
      "track",
      "shipped",
      "cancel",
      "where",
      "when",
    ];
    const isOrderQuery = orderKeywords.some((word) => lowerMsg.includes(word));

    if (lowerMsg.includes("order") && isOrderQuery) {
      const latestOrder = await Order.findOne({ userId })
        .sort({ createdAt: -1 })
        .populate("items.productId");

      if (!latestOrder) {
        return res.json({ reply: "You don't have any recent orders." });
      }

      const status = latestOrder.paymentStatus;
      const totalItems = latestOrder.items.length;
      const totalAmount = latestOrder.totalAmount;

      return res.json({
        reply: `Your latest order has ${totalItems} item(s) with a total of ₹${totalAmount}. Current status: ${status}.`,
      });
    }

    // Check against static FAQs
    const faqs = await FAQ.find();
    const bestMatch = faqs.find((faq) =>
      lowerMsg.includes(faq.question.toLowerCase())
    );

    if (bestMatch) {
      return res.json({ reply: bestMatch.answer });
    }

    return res.json({
      reply:
        "Sorry, I couldn't understand that. Please contact our support team for help.",
    });
  } catch (err) {
    console.error("ChatBot Error:", err);
    return res.status(500).json({ error: "Server Error" });
  }
};


