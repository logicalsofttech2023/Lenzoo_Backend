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
  checkout,
  addToCart,
  getCart,
  updateCartQuantity,
  cancelOrder,
  getOrders,
  chatBot,
  updateLocation,
  bookAppointment,
  cancelAppointmentByUser,
  getAppointmentsByUser,
  getUserNotifications,
  rescheduleAppointment,
  addShippingAddress,
  getShippingAddresses,
  updateShippingAddress,
  deleteShippingAddress,
  measure,
  saveMeasurement,
  getAvailableCenter,
} from "../controllers/userController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { uploadProfile } from "../middlewares/uploadMiddleware.js";
import { prescription } from "../middlewares/prescription.js";
import optionalAuth from "../middlewares/optionalMiddleware.js";
import {
  getAllTestResult,
  getAstigmatismQuestion,
  getAstigmatismResult,
  getColorQuestion,
  getColorTestResult,
  getContrastResults,
  getQuestion,
  getResult,
  getSingleContrastQuestion,
  getTumblingEQuestion,
  getTumblingEResult,
  startAstigmatismTest,
  startColorTest,
  startContrastTest,
  startTest,
  startTumblingETest,
  submitAnswer,
  submitAstigmatismAnswer,
  submitColorAnswer,
  submitContrastAnswer,
  submitTumblingEAnswer,
} from "../controllers/visualAcuityController.js";

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
 *               address:
 *                 type: string
 *               dob:
 *                 type: string
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
 *     summary: Get all products available to the user (with favorite status, search & pagination)
 *     security:
 *       - bearerAuth: []  # Optional bearer token (set via optionalAuth middleware)
 *     parameters:
 *       - in: query
 *         name: suitableFor
 *         schema:
 *           type: string
 *           enum: [Men, Women, Kids]
 *         description: Filter products based on target user category
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
 *                 products:
 *                   type: array
 *                   items:
 *                     type: object
 *                     allOf:
 *                       - $ref: '#/components/schemas/Product'
 *                       - type: object
 *                         properties:
 *                           status:
 *                             type: boolean
 *                             description: true if product is marked as favorite by logged-in user
 *       401:
 *         description: Unauthorized - invalid or missing token (ignored if using optionalAuth)
 *       500:
 *         description: Server error
 */
router.get("/getAllProductsInUser", optionalAuth, getAllProductsInUser);

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
/**
 *
 * @swagger
 * /api/user/addToCart:
 *   post:
 *     summary: Add a product to the user's cart
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *             properties:
 *               productId:
 *                 type: string
 *                 description: ID of the product
 *               quantity:
 *                 type: integer
 *                 default: 1
 *                 description: Quantity of the product
 *     responses:
 *       200:
 *         description: Product added to cart
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 cart:
 *                   $ref: '#/components/schemas/Cart'
 *       400:
 *         description: Missing  productId
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
router.post("/addToCart", authMiddleware, addToCart);

/**
 * @swagger
 * /api/user/checkout:
 *   post:
 *     summary: Checkout and create an order from the cart
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - shippingAddressId
 *             properties:
 *               shippingAddressId:
 *                 type: string
 *                 description: ID of the selected shipping address
 *     responses:
 *       201:
 *         description: Order placed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Order placed successfully
 *                 order:
 *                   $ref: '#/components/schemas/Order'
 *                 transaction:
 *                   $ref: '#/components/schemas/Transaction'
 *       400:
 *         description: Missing userId, shipping address, or cart is empty
 *       500:
 *         description: Server error
 */
router.post("/checkout", authMiddleware, checkout);

/**
 * @swagger
 * /api/user/getCart:
 *   get:
 *     summary: Get the user's cart details
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 cart:
 *                   $ref: '#/components/schemas/Cart'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/getCart", authMiddleware, getCart);

/**
 * @swagger
 * /api/user/updateCartQuantity:
 *   post:
 *     summary: Update product quantity in user's cart
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - productId
 *               - action
 *             properties:
 *               userId:
 *                 type: string
 *               productId:
 *                 type: string
 *               action:
 *                 type: string
 *                 enum: [increment, decrement]
 *                 description: Action to perform on quantity increment, decrement
 *                 default: increment
 *     responses:
 *       200:
 *         description: Cart quantity updated
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post("/updateCartQuantity", authMiddleware, updateCartQuantity);

/**
 * @swagger
 * /api/user/cancelOrder:
 *   post:
 *     summary: Cancel an order by orderId and userId
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *               - userId
 *             properties:
 *               orderId:
 *                 type: string
 *               userId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order cancelled successfully
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
router.post("/cancelOrder", authMiddleware, cancelOrder);

/**
 * @swagger
 * /api/user/getOrders:
 *   get:
 *     summary: Get all orders for the logged-in user
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Orders fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 orders:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Order'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/getOrders", authMiddleware, getOrders);

/**
 * @swagger
 * /api/user/chatBot:
 *   post:
 *     summary: Send a message to chatbot and get automated response
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 example: "how to schedule exam"
 *     responses:
 *       200:
 *         description: Chatbot response returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reply:
 *                   type: string
 *                   example: "Go to the Schedule tab and choose your nearest center."
 *       400:
 *         description: Message is required
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post("/chatBot", authMiddleware, chatBot);

/**
 * @swagger
 * /api/user/updateLocation:
 *   post:
 *     summary: Update user's location information
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               latitude:
 *                 type: number
 *                 format: double
 *                 example: 28.6139
 *               longitude:
 *                 type: number
 *                 format: double
 *                 example: 77.2090
 *               address:
 *                 type: string
 *                 example: "New Delhi, India"
 *     responses:
 *       200:
 *         description: Location updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Location updated successfully"
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *                 status:
 *                   type: boolean
 *                   example: false
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Server Error"
 *                 status:
 *                   type: boolean
 *                   example: false
 */
router.post("/updateLocation", authMiddleware, updateLocation);

/**
 * @swagger
 * /api/user/bookAppointment:
 *   post:
 *     summary: Book an eye test appointment
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - centerId
 *               - date
 *               - time
 *             properties:
 *               centerId:
 *                 type: string
 *                 description: ID of the center/unit where the appointment is to be booked
 *                 example: "64cfd33408a9b2d8a5edc123"
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Appointment date
 *                 example: "2025-07-30"
 *               time:
 *                 type: string
 *                 description: Appointment time in 24-hour format
 *                 example: "15:30"
 *               notes:
 *                 type: string
 *                 description: Optional notes or special requests
 *                 example: "Please ensure vision screening only"
 *     responses:
 *       201:
 *         description: Appointment booked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Appointment booked"
 *                 appointment:
 *                   $ref: '#/components/schemas/Appointment'
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "centerId, date, and time are required"
 *       409:
 *         description: Time slot already booked
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "You have already booked this time slot at this center."
 *       500:
 *         description: Server error
 */
router.post("/bookAppointment", authMiddleware, bookAppointment);

/**
 * @swagger
 * /api/user/cancelAppointmentByUser:
 *   post:
 *     summary: Cancel a booked appointment by user
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: string
 *                 example: "64e8f31248a4bc2fe0d8a345"
 *     responses:
 *       200:
 *         description: Appointment cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Appointment cancelled by user"
 *       404:
 *         description: Appointment not found
 *       500:
 *         description: Server error
 */
router.post(
  "/cancelAppointmentByUser",
  authMiddleware,
  cancelAppointmentByUser
);

/**
 * @swagger
 * /api/user/getAvailableCenter:
 *   get:
 *     summary: Get all available centers for the logged-in user
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: available centers fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 orders:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Center'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/getAvailableCenter", getAvailableCenter);

/**
 * @swagger
 * /api/user/getAppointmentsByUser:
 *   get:
 *     summary: Get all appointments for the logged-in user
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user appointments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 appointments:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Appointment'
 *       500:
 *         description: Server error
 */
router.get("/getAppointmentsByUser", authMiddleware, getAppointmentsByUser);

/**
 * @swagger
 * /api/user/getUserNotifications:
 *   get:
 *     summary: Get all notifications for the logged-in user
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 notifications:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Notification'
 *       500:
 *         description: Server error
 */
router.get("/getUserNotifications", authMiddleware, getUserNotifications);

/**
 * @swagger
 * /api/user/rescheduleAppointment:
 *   post:
 *     summary: Reschedule an appointment
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - appointmentId
 *               - newDate
 *               - newTime
 *             properties:
 *               appointmentId:
 *                 type: string
 *               newDate:
 *                 type: string
 *                 format: date
 *               newTime:
 *                 type: string
 *                 example: "15:30"
 *     responses:
 *       200:
 *         description: Appointment rescheduled successfully
 *       404:
 *         description: Appointment not found
 *       500:
 *         description: Server error
 */
router.post("/rescheduleAppointment", authMiddleware, rescheduleAppointment);

/**
 * @swagger
 * /api/user/addShippingAddress:
 *   post:
 *     summary: Add a new shipping address
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - phone
 *               - address
 *               - pincode
 *               - addressType
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *               pincode:
 *                 type: string
 *               addressType:
 *                 type: string
 *               isDefault:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Address added successfully
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Server error
 */
router.post("/addShippingAddress", authMiddleware, addShippingAddress);

/**
 * @swagger
 * /api/user/getShippingAddresses:
 *   get:
 *     summary: Get all shipping addresses for the logged-in user
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Shipping addresses fetched successfully
 *       500:
 *         description: Server error
 */
router.get("/getShippingAddresses", authMiddleware, getShippingAddresses);

/**
 * @swagger
 * /api/user/updateShippingAddress:
 *   post:
 *     summary: Update a shipping address
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - name
 *               - email
 *               - phone
 *               - address
 *               - pincode
 *               - addressType
 *             properties:
 *               id:
 *                 type: string
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *               pincode:
 *                 type: string
 *               addressType:
 *                 type: string
 *               isDefault:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Address updated successfully
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Server error
 */
router.post("/updateShippingAddress", authMiddleware, updateShippingAddress);

/**
 * @swagger
 * /api/user/deleteShippingAddress:
 *   post:
 *     summary: Delete a shipping address
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Address deleted successfully
 *       500:
 *         description: Server error
 */
router.post("/deleteShippingAddress", authMiddleware, deleteShippingAddress);

/**
 * @swagger
 * /api/user/measure:
 *   post:
 *     summary: Upload face image and measure face attributes
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image file of the user's face
 *     responses:
 *       200:
 *         description: Measurement saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Measurement saved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                     imageUrl:
 *                       type: string
 *                     faceShape:
 *                       type: string
 *                     measurementAccuracy:
 *                       type: string
 *                     cheekboneWidth:
 *                       type: number
 *                     faceLength:
 *                       type: number
 *                     foreheadWidth:
 *                       type: number
 *                     jawWidth:
 *                       type: number
 *                     nasoPupillaryDistance:
 *                       type: object
 *                       properties:
 *                         leftEye:
 *                           type: string
 *                         rightEye:
 *                           type: string
 *                     pupilHeight:
 *                       type: string
 *                     pupillaryDistance:
 *                       type: string
 *       400:
 *         description: Invalid response from Python server
 *       401:
 *         description: Unauthorized - missing or invalid token
 *       500:
 *         description: Server error or image processing failure
 */
router.post("/measure", authMiddleware, uploadProfile.single("image"), measure);

/**
 * @swagger
 * /api/user/saveMeasurement:
 *   post:
 *     summary: Save face measurement result to database
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - imageUrl
 *               - faceShape
 *               - measurementAccuracy
 *               - message
 *               - cheekboneWidth
 *               - faceLength
 *               - foreheadWidth
 *               - jawWidth
 *               - pupilHeight
 *               - pupillaryDistance
 *               - nasoPupillaryDistance
 *             properties:
 *               imageUrl:
 *                 type: string
 *               faceShape:
 *                 type: string
 *               measurementAccuracy:
 *                 type: string
 *               message:
 *                 type: string
 *               cheekboneWidth:
 *                 type: number
 *               faceLength:
 *                 type: number
 *               foreheadWidth:
 *                 type: number
 *               jawWidth:
 *                 type: number
 *               pupilHeight:
 *                 type: string
 *               pupillaryDistance:
 *                 type: string
 *               nasoPupillaryDistance:
 *                 type: object
 *                 properties:
 *                   leftEye:
 *                     type: string
 *                   rightEye:
 *                     type: string
 *     responses:
 *       200:
 *         description: Measurement saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Measurement saved successfully
 *                 data:
 *                   type: object
 *       400:
 *         description: Missing or invalid input data
 *       401:
 *         description: Unauthorized - missing or invalid token
 *       500:
 *         description: Server error
 */
router.post("/saveMeasurement", authMiddleware, saveMeasurement);

/**
 * @swagger
 * /api/user/startTest:
 *   post:
 *     summary: Start a new visual acuity test
 *     tags: [Visual Acuity Test]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - activeEye
 *             properties:
 *               activeEye:
 *                 type: string
 *                 enum: [left, right]
 *     responses:
 *       200:
 *         description: Test started successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post("/startTest", authMiddleware, startTest);

/**
 * @swagger
 * /api/user/getQuestion:
 *   get:
 *     summary: Get the current question for the test
 *     tags: [Visual Acuity Test]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: testId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the active test
 *     responses:
 *       200:
 *         description: Returns question, options, and size
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Test not found
 *       500:
 *         description: Server error
 */
router.get("/getQuestion", authMiddleware, getQuestion);

/**
 * @swagger
 * /api/user/submitAnswer:
 *   post:
 *     summary: Submit an answer for the current visual acuity question
 *     tags: [Visual Acuity Test]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - testId
 *               - selectedOption
 *               - correct
 *               - size
 *             properties:
 *               testId:
 *                 type: string
 *               selectedOption:
 *                 type: string
 *               correct:
 *                 type: boolean
 *               size:
 *                 type: string
 *     responses:
 *       200:
 *         description: Answer submitted successfully and size updated
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post("/submitAnswer", authMiddleware, submitAnswer);

/**
 * @swagger
 * /api/user/getResult:
 *   get:
 *     summary: Get final result of visual acuity test
 *     tags: [Visual Acuity Test]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: testId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Test result retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Test not found
 *       500:
 *         description: Server error
 */
router.get("/getResult", authMiddleware, getResult);

/**
 * @swagger
 * /api/user/startContrastTest:
 *   post:
 *     summary: Start a new color vision test
 *     tags: [Contrast Test]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - activeEye
 *             properties:
 *               activeEye:
 *                 type: string
 *                 enum: [left, right]
 *                 example: right
 *     responses:
 *       200:
 *         description: Test started successfully
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Server error
 */
router.post("/startContrastTest", authMiddleware, startContrastTest);

/**
 * @swagger
 * /api/user/getSingleContrastQuestion:
 *   get:
 *     summary: Get a single color test question
 *     tags: [Contrast Test]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Fetched a color test question
 *       404:
 *         description: No more questions or test not started
 *       500:
 *         description: Server error
 */
router.get(
  "/getSingleContrastQuestion",
  authMiddleware,
  getSingleContrastQuestion
);

/**
 * @swagger
 * /api/user/submitContrastAnswer:
 *   post:
 *     summary: Submit an answer to a color test question
 *     tags: [Contrast Test]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - selectedIndex
 *               - correct
 *               - colors
 *               - differentColor
 *               - opacityLevel
 *             properties:
 *               selectedIndex:
 *                 type: integer
 *                 example: 3
 *               correct:
 *                 type: boolean
 *                 example: true
 *               colors:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: color
 *                 example: ["#FF0000", "#FF0000", "#FF0000", "#FFFF00"]
 *               differentColor:
 *                 type: string
 *                 example: "#FFFF00"
 *               opacityLevel:
 *                 type: number
 *                 example: 1
 *     responses:
 *       200:
 *         description: Answer submitted successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post("/submitContrastAnswer", authMiddleware, submitContrastAnswer);

/**
 * @swagger
 * /api/user/getContrastResults:
 *   get:
 *     summary: Get final results of the color test
 *     tags: [Contrast Test]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Color test results returned
 *       404:
 *         description: No results found
 *       500:
 *         description: Server error
 */
router.get("/getContrastResults", authMiddleware, getContrastResults);

/**
 * @swagger
 * /api/user/startColorTest:
 *   post:
 *     summary: Start the color test
 *     tags: [Color Test]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - activeEye
 *             properties:
 *               activeEye:
 *                 type: string
 *                 enum: [left, right]
 *                 description: The eye being tested
 *                 example: right
 *     responses:
 *       200:
 *         description: Color test started successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post("/startColorTest", authMiddleware, startColorTest);

/**
 * @swagger
 * /api/user/getColorQuestion:
 *   get:
 *     summary: Get a new color vision question
 *     tags: [Color Test]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Question fetched successfully
 *       404:
 *         description: No more questions
 *       500:
 *         description: Server error
 */
router.get("/getColorQuestion", authMiddleware, getColorQuestion);

/**
 * @swagger
 * /api/user/submitColorAnswer:
 *   post:
 *     summary: Submit answer for current color question
 *     tags: [Color Test]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - selectedOption
 *             properties:
 *               selectedOption:
 *                 type: string
 *                 example: "8"
 *     responses:
 *       200:
 *         description: Answer submitted successfully
 *       400:
 *         description: Invalid answer
 *       500:
 *         description: Server error
 */
router.post("/submitColorAnswer", authMiddleware, submitColorAnswer);

/**
 * @swagger
 * /api/user/getColorTestResult:
 *   get:
 *     summary: Get the final result of the color test
 *     tags: [Color Test]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Final test result
 *       404:
 *         description: Result not found
 *       500:
 *         description: Server error
 */
router.get("/getColorTestResult", authMiddleware, getColorTestResult);

/**
 * @swagger
 * /api/user/startAstigmatismTest:
 *   post:
 *     summary: Start the astigmatism test
 *     tags: [Astigmatism Test]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Test started successfully
 *       500:
 *         description: Server error
 */
router.post("/startAstigmatismTest", authMiddleware, startAstigmatismTest);

/**
 * @swagger
 * /api/user/getAstigmatismQuestion:
 *   get:
 *     summary: Get current question/image for astigmatism test
 *     tags: [Astigmatism Test]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Question/image data returned
 *       404:
 *         description: No question found
 *       500:
 *         description: Server error
 */
router.get("/getAstigmatismQuestion", authMiddleware, getAstigmatismQuestion);

/**
 * @swagger
 * /api/user/submitAstigmatismAnswer:
 *   post:
 *     summary: Submit user answer for astigmatism test
 *     tags: [Astigmatism Test]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               selectedOption:
 *                 type: string
 *                 example: "Yes"
 *     responses:
 *       200:
 *         description: Answer submitted successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post(
  "/submitAstigmatismAnswer",
  authMiddleware,
  submitAstigmatismAnswer
);

/**
 * @swagger
 * /api/user/getAstigmatismResult:
 *   get:
 *     summary: Get final result of the astigmatism test
 *     tags: [Astigmatism Test]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Astigmatism test result
 *       404:
 *         description: Result not found
 *       500:
 *         description: Server error
 */
router.get("/getAstigmatismResult", authMiddleware, getAstigmatismResult);

/**
 * @swagger
 * /api/user/startTumblingETest:
 *   post:
 *     summary: Start the astigmatism test
 *     tags: [TumblingE Test]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Test started successfully
 *       500:
 *         description: Server error
 */
router.post("/startTumblingETest", authMiddleware, startTumblingETest);

/**
 * @swagger
 * /api/user/getTumblingEQuestion:
 *   get:
 *     summary: Get current question/image for TumblingE test
 *     tags: [TumblingE Test]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Question/image data returned
 *       404:
 *         description: No question found
 *       500:
 *         description: Server error
 */
router.get("/getTumblingEQuestion", authMiddleware, getTumblingEQuestion);
/**
 * @swagger
 * /api/tumblingE/submitTumblingEAnswer:
 *   post:
 *     summary: Submit answer for Tumbling E Test
 *     tags: [TumblingE Test]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - selectedDirection
 *             properties:
 *               selectedDirection:
 *                 type: string
 *                 enum: [up, down, left, right]
 *                 example: down
 *     responses:
 *       200:
 *         description: Answer submitted successfully and next question returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 finished:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Answer submitted
 *                 currentStep:
 *                   type: number
 *                   example: 3
 *                 question:
 *                   type: object
 *                   properties:
 *                     instruction:
 *                       type: string
 *                     image:
 *                       type: string
 *                       example: e_up.svg
 *                     direction:
 *                       type: string
 *                       example: up
 *                     size:
 *                       type: string
 *                       example: 50px
 *                     options:
 *                       type: array
 *                       items:
 *                         type: string
 *       400:
 *         description: Invalid input or test not found
 *       500:
 *         description: Server error
 */
router.post("/submitTumblingEAnswer", authMiddleware, submitTumblingEAnswer);
/**
 * @swagger
 * /api/user/getTumblingEResult:
 *   get:
 *     summary: Get final result of the astigmatism test
 *     tags: [TumblingE Test]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: TumblingE test result
 *       404:
 *         description: Result not found
 *       500:
 *         description: Server error
 */
router.get("/getTumblingEResult", authMiddleware, getTumblingEResult);

router.get("/getAllTestResult", authMiddleware, getAllTestResult);
export default router;
