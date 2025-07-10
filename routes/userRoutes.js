import express from "express";
import {
  generateOtp,
  verifyOtp,
  resendOtp,
  completeRegistration,
  updateProfile,
  getUserById,
  addMoneyToWallet,
} from "../controllers/userController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { uploadProfile } from "../middlewares/uploadMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/user/generateOtp:
 *   post:
 *     tags: [User]
 *     summary: Generate OTP for a phone number
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [phone]
 *             properties:
 *               phone:
 *                 type: string
 *                 example: "9876543210"
 *     responses:
 *       200:
 *         description: OTP sent successfully
 */
router.post("/generateOtp", generateOtp);

/**
 * @swagger
 * /api/user/verifyOtp:
 *   post:
 *     tags: [User]
 *     summary: Verify OTP
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [phone, otp, firebaseToken]
 *             properties:
 *               phone:
 *                 type: string
 *               otp:
 *                 type: string
 *               firebaseToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP verified
 */
router.post("/verifyOtp", verifyOtp);

/**
 * @swagger
 * /api/user/resendOtp:
 *   post:
 *     tags: [User]
 *     summary: Resend OTP
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [phone]
 *             properties:
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP resent
 */
router.post("/resendOtp", resendOtp);

/**
 * @swagger
 * /api/user/completeRegistration:
 *   post:
 *     tags: [User]
 *     summary: Complete user registration
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [phone, firstName, lastName, userEmail, firebaseToken]
 *             properties:
 *               phone:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               userEmail:
 *                 type: string
 *               firebaseToken:
 *                 type: string
 *               profileImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Registration complete
 */
router.post("/completeRegistration", uploadProfile.single("profileImage"), completeRegistration);

/**
 * @swagger
 * /api/user/updateProfile:
 *   post:
 *     tags: [User]
 *     summary: Update user profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               userEmail:
 *                 type: string
 *               profileImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile updated
 */
router.post("/updateProfile", authMiddleware, uploadProfile.single("profileImage"), updateProfile);

/**
 * @swagger
 * /api/user/getUserById:
 *   get:
 *     tags: [User]
 *     summary: Get user details by ID
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User details fetched
 */
router.get("/getUserById", authMiddleware, getUserById);

/**
 * @swagger
 * /api/user/addMoneyToWallet:
 *   post:
 *     tags: [User]
 *     summary: Add money to wallet
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount]
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 100
 *     responses:
 *       200:
 *         description: Money added to wallet
 */
router.post("/addMoneyToWallet", authMiddleware, addMoneyToWallet);




export default router;
