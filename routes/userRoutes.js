import express from "express";
import {
  generateOtp,
  verifyOtp,
  resendOtp,
  completeRegistration,
  updateProfile,
  getUserById,
  addMoneyToWallet,
  createPurchase,
  renewMembership,
  getMyPlan,
  getAllProductsInUser,
  toggleFavoriteProduct,
  getUserFavorites,
  addPrescription,
} from "../controllers/userController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { uploadProfile } from "../middlewares/uploadMiddleware.js";
import { prescription } from "../middlewares/prescription.js";

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
router.post(
  "/completeRegistration",
  uploadProfile.single("profileImage"),
  completeRegistration
);

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
router.post(
  "/updateProfile",
  authMiddleware,
  uploadProfile.single("profileImage"),
  updateProfile
);

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

/**
 * @swagger
 * /api/user/createPurchase:
 *   post:
 *     tags: [User]
 *     summary: Create a membership purchase
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, membershipId, amount]
 *             properties:
 *               userId:
 *                 type: string
 *               membershipId:
 *                 type: string
 *               amount:
 *                 type: number
 *                 example: 500
 *     responses:
 *       200:
 *         description: Membership purchase created successfully
 */
router.post("/createPurchase", authMiddleware, createPurchase);

/**
 * @swagger
 * /api/user/renewMembership:
 *   post:
 *     tags: [User]
 *     summary: Renew user's membership
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [membershipId, amount]
 *             properties:
 *               membershipId:
 *                 type: string
 *               amount:
 *                 type: number
 *                 example: 500
 *     responses:
 *       200:
 *         description: Membership renewed successfully
 */
router.post("/renewMembership", authMiddleware, renewMembership);

/**
 * @swagger
 * /api/user/getMyPlan:
 *   get:
 *     tags: [User]
 *     summary: Get logged-in user's current membership plan
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's current plan details
 */
router.get("/getMyPlan", authMiddleware, getMyPlan);

/**
 * @swagger
 * /api/user/getAllProductsInUser:
 *   get:
 *     tags: [User]
 *     summary: Get all products available to the logged-in user (with search & pagination)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term to filter products by name
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Products fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *                 currentPage:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 totalItems:
 *                   type: integer
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       500:
 *         description: Server error
 */
router.get("/getAllProductsInUser", authMiddleware, getAllProductsInUser);

/**
 * @swagger
 * /api/user/toggleFavoriteProduct:
 *   get:
 *     tags: [User]
 *     summary: Toggle favorite status of a product for the logged-in user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the product to toggle favorite
 *     responses:
 *       200:
 *         description: Product added to or removed from favorites
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad Request - missing or invalid productId
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       500:
 *         description: Server error
 */
router.get("/toggleFavoriteProduct", authMiddleware, toggleFavoriteProduct);

/**
 * @swagger
 * /api/user/getUserFavorites:
 *   get:
 *     tags: [User]
 *     summary: Get all favorite products for the logged-in user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Favorite products fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 favorites:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       500:
 *         description: Server error
 */
router.get("/getUserFavorites", authMiddleware, getUserFavorites);

/**
 * @swagger
 * /api/user/uploadPrescription:
 *   post:
 *     tags: [User]
 *     summary: Upload a prescription file
 *     description: Allows logged-in users to upload a prescription file with optional notes.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               prescriptionFile:
 *                 type: string
 *                 format: binary
 *                 description: The prescription image or document file
 *               notes:
 *                 type: string
 *                 description: Optional notes about the prescription
 *     responses:
 *       201:
 *         description: Prescription uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     userId:
 *                       type: string
 *                     notes:
 *                       type: string
 *                     prescriptionFile:
 *                       type: string
 *                     uploadedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad Request (file missing)
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */

router.post(
  "/uploadPrescription",
  authMiddleware,
  prescription.single("prescriptionFile"),
  addPrescription
);
export default router;
