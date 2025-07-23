import express from "express";
import {
  policyUpdate,
  getPolicy,
  loginAdmin,
  adminSignup,
  getAdminDetail,
  resetAdminPassword,
  updateAdminDetail,
  addUpdateMembership,
  getAllMembership,
  addFAQ,
  updateFAQ,
  getAllFAQs,
  getFAQById,
  addProduct,
  getAllUsers,
  updateProduct,
  getAllProducts,
  getProductById,
  deleteProduct,
  getAllProductsInAdmin,
  getMembershipById,
  deleteMembership,
  getAllTransaction,
  getAllPrescription,
  updateOrderStatus,
  getAllOrders,
  getOrderByUserIdInAdmin,
  getUserDetailsById,
} from "../controllers/adminController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { uploadProfile } from "../middlewares/uploadMiddleware.js";
import { addToCart, checkout } from "../controllers/userController.js";

const router = express.Router();

/**
 * @swagger
 * /api/admin/adminSignup:
 *   post:
 *     summary: Register a new admin
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Admin registered successfully
 *       400:
 *         description: Bad request
 */
router.post("/adminSignup", adminSignup);

/**
 * @swagger
 * /api/admin/loginAdmin:
 *   post:
 *     summary: Login as admin
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post("/loginAdmin", loginAdmin);

/**
 * @swagger
 * /api/admin/getAdminDetail:
 *   get:
 *     summary: Get admin details
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin details retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/getAdminDetail", authMiddleware, getAdminDetail);

/**
 * @swagger
 * /api/admin/resetAdminPassword:
 *   post:
 *     summary: Reset admin password
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newPassword
 *               - confirmPassword
 *             properties:
 *               newPassword:
 *                 type: string
 *               confirmPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Passwords don't match
 */
router.post("/resetAdminPassword", authMiddleware, resetAdminPassword);

/**
 * @swagger
 * /api/admin/updateAdminDetail:
 *   post:
 *     summary: Update admin details
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Admin details updated successfully
 *       400:
 *         description: Bad request
 */
router.post("/updateAdminDetail", authMiddleware, updateAdminDetail);

/**
 * @swagger
 * /api/admin/policyUpdate:
 *   post:
 *     summary: Update policy content
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - content
 *             properties:
 *               type:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Policy updated successfully
 *       400:
 *         description: Bad request
 */
router.post("/policyUpdate", authMiddleware, policyUpdate);

/**
 * @swagger
 * /api/admin/getPolicy:
 *   get:
 *     summary: Get policy content
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Policy retrieved successfully
 *       404:
 *         description: Policy not found
 */
router.get("/getPolicy", authMiddleware, getPolicy);

/**
 * @swagger
 * /api/admin/addUpdateMembership:
 *   post:
 *     summary: Add or update a membership plan
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               membershipId:
 *                 type: string
 *                 description: Optional ID for updating an existing membership
 *               title:
 *                 type: string
 *                 enum: [Basic, Plus, Premium]
 *                 example: Premium
 *               description:
 *                 type: string
 *                 example: Full visual health package with premium support
 *               planType:
 *                 type: string
 *                 enum: [monthly, 6months, 1year]
 *                 example: 1year
 *               price:
 *                 type: number
 *                 example: 499
 *               status:
 *                 type: string
 *                 enum: [active, expired]
 *                 example: active
 *               isRecurring:
 *                 type: boolean
 *                 example: true
 *               durationInDays:
 *                 type: number
 *                 example: 365
 *               benefits:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Unlimited eye exams", "AR fitting", "Priority delivery"]
 *     responses:
 *       200:
 *         description: Membership plan added/updated successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */

router.post("/addUpdateMembership", authMiddleware, addUpdateMembership);

/**
 * @swagger
 * /api/admin/getAllMembership:
 *   get:
 *     summary: Get all membership plans
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Membership plans retrieved successfully
 */
router.get("/getAllMembership", authMiddleware, getAllMembership);

/**
 * @swagger
 * /api/admin/getMembershipById:
 *   get:
 *     summary: Get membership plan by ID
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the membership plan to retrieve
 *     responses:
 *       200:
 *         description: Membership plan retrieved successfully
 *       400:
 *         description: Missing or invalid membership ID
 *       404:
 *         description: Membership plan not found
 */
router.get("/getMembershipById", authMiddleware, getMembershipById);

/**
 * @swagger
 * /api/admin/deleteMembership:
 *   delete:
 *     summary: Delete a membership plan
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the membership plan to delete
 *     responses:
 *       200:
 *         description: Membership plan deleted successfully
 *       400:
 *         description: Missing or invalid membership ID
 */
router.delete("/deleteMembership", authMiddleware, deleteMembership);

/**
 * @swagger
 * /api/admin/addFAQ:
 *   post:
 *     summary: Add a new FAQ
 *     tags: [FAQ]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - question
 *               - answer
 *               - category
 *             properties:
 *               question:
 *                 type: string
 *               answer:
 *                 type: string
 *               category:
 *                 type: string
 *     responses:
 *       201:
 *         description: FAQ added successfully
 *       400:
 *         description: Bad request
 */
router.post("/addFAQ", authMiddleware, addFAQ);

/**
 * @swagger
 * /api/admin/updateFAQ:
 *   post:
 *     summary: Update an FAQ
 *     tags: [FAQ]
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
 *               question:
 *                 type: string
 *               answer:
 *                 type: string
 *               category:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: FAQ updated successfully
 *       404:
 *         description: FAQ not found
 */
router.post("/updateFAQ", authMiddleware, updateFAQ);

/**
 * @swagger
 * /api/admin/getAllFAQs:
 *   get:
 *     summary: Get all FAQs
 *     tags: [FAQ]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: FAQs retrieved successfully
 */
router.get("/getAllFAQs", authMiddleware, getAllFAQs);

/**
 * @swagger
 * /api/admin/getFAQById:
 *   get:
 *     summary: Get FAQ by ID
 *     tags: [FAQ]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: FAQ retrieved successfully
 *       404:
 *         description: FAQ not found
 */
router.get("/getFAQById", authMiddleware, getFAQById);

/**
 * @swagger
 * /api/admin/addProduct:
 *   post:
 *     summary: Add a new product
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - title
 *               - originalPrice
 *               - sellingPrice
 *               - productType
 *               - frameType
 *               - frameShape
 *               - frameSize
 *               - suitableFor
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Upload multiple product images
 *               name:
 *                 type: string
 *                 default: Classic Black Eyewear
 *               title:
 *                 type: string
 *                 default: Stylish Full Rim Round Eyeglasses
 *               description:
 *                 type: string
 *                 default: Lightweight and durable eyeglasses perfect for everyday wear.
 *               originalPrice:
 *                 type: number
 *                 default: 2999
 *               sellingPrice:
 *                 type: number
 *                 default: 1499
 *               productType:
 *                 type: string
 *                 enum: [Eyeglasses, Sunglasses, Computer Glasses, Reading Glasses, Contact Lenses]
 *                 default: Eyeglasses
 *               frameType:
 *                 type: string
 *                 enum: [Full Rim, Half Rim, Rimless]
 *                 default: Full Rim
 *               frameShape:
 *                 type: string
 *                 enum: [Round, Rectangle, Square, Aviator, Cat Eye, Hexagonal, Wayfarer]
 *                 default: Round
 *               frameSize:
 *                 type: string
 *                 enum: [Extra Narrow, Narrow, Medium, Wide, Extra Wide]
 *                 default: Medium
 *               suitableFor:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [Men, Women, Kids]
 *                 default: [Men, Women]
 *                 description: Who this product is suitable for
 *               frameWidth:
 *                 type: string
 *                 default: 140 mm
 *               frameDimensions:
 *                 type: string
 *                 default: 52-18-140
 *               frameColor:
 *                 type: string
 *                 default: Black
 *               weight:
 *                 type: string
 *                 default: 22g
 *               material:
 *                 type: string
 *                 default: TR90
 *     responses:
 *       201:
 *         description: Product added successfully
 *       400:
 *         description: Bad request
 */
router.post(
  "/addProduct",
  uploadProfile.array("images", 100),
  authMiddleware,
  addProduct
);

/**
 * @swagger
 * /api/admin/getAllProducts:
 *   get:
 *     summary: Get all products
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 */
router.get("/getAllProducts", authMiddleware, getAllProducts);

/**
 * @swagger
 * /api/admin/getAllProductsInAdmin:
 *   get:
 *     summary: Get all products with pagination and search (Admin only)
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         description: Number of products per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           default: ""
 *         description: Search by product name, title, type, frame type or shape
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
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Products fetched successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *                 totalProducts:
 *                   type: integer
 *                   example: 35
 *                 totalPages:
 *                   type: integer
 *                   example: 4
 *                 currentPage:
 *                   type: integer
 *                   example: 1
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */
router.get("/getAllProductsInAdmin", authMiddleware, getAllProductsInAdmin);

/**
 * @swagger
 * /api/admin/getProductById:
 *   get:
 *     summary: Get product by ID
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Product retrieved successfully
 *       404:
 *         description: Product not found
 */
router.get("/getProductById", authMiddleware, getProductById);

/**
 * @swagger
 * /api/admin/updateProduct:
 *   post:
 *     summary: Update a product
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *       - in: formData
 *         name: images
 *         type: file
 *         description: Product images
 *         required: false
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               originalPrice:
 *                 type: number
 *               sellingPrice:
 *                 type: number
 *               productType:
 *                 type: string
 *               frameType:
 *                 type: string
 *               frameShape:
 *                 type: string
 *               frameSize:
 *                 type: string
 *               suitableFor:
 *                 type: string
 *               frameWidth:
 *                 type: string
 *               frameDimensions:
 *                 type: string
 *               frameColor:
 *                 type: string
 *               weight:
 *                 type: string
 *               material:
 *                 type: string
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       404:
 *         description: Product not found
 */
router.post(
  "/updateProduct",
  uploadProfile.array("images", 100),
  authMiddleware,
  updateProduct
);

/**
 * @swagger
 * /api/admin/deleteProduct:
 *   get:
 *     summary: Delete a product
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       404:
 *         description: Product not found
 */
router.get("/deleteProduct", authMiddleware, deleteProduct);

/**
 * @swagger
 * /api/admin/getAllUsers:
 *   get:
 *     summary: Get all users
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *         required: false
 *         default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *         required: false
 *         default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         required: false
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         required: false
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 */
router.get("/getAllUsers", authMiddleware, getAllUsers);

/**
 * @swagger
 * /api/admin/getAllTransaction:
 *   get:
 *     summary: Get all transaction history with optional search
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         required: false
 *         default: 1
 *         description: Current page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         required: false
 *         default: 10
 *         description: Number of records per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         required: false
 *         description: Search by user's first or last name
 *     responses:
 *       200:
 *         description: Transaction history fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 status:
 *                   type: boolean
 *                 totalTransactions:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Transaction'
 */
router.get("/getAllTransaction", authMiddleware, getAllTransaction);

/**
 * @swagger
 * /api/admin/getAllPrescription:
 *   get:
 *     summary: Get all prescription records with optional search
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         required: false
 *         default: 1
 *         description: Current page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         required: false
 *         default: 10
 *         description: Number of records per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         required: false
 *         description: Search by user's first or last name
 *     responses:
 *       200:
 *         description: Prescription records fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 status:
 *                   type: boolean
 *                 totalPrescriptions:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Prescription'
 */
router.get("/getAllPrescription", authMiddleware, getAllPrescription);

/**
 * @swagger
 * /api/admin/updateOrderStatus:
 *   get:
 *     summary: Update the status of an order
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: orderId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the order to update
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [placed, processing, shipped, delivered, cancelled]
 *         required: true
 *         description: New status for the order
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 order:
 *                   $ref: '#/components/schemas/Order'
 *       400:
 *         description: Missing or invalid parameters
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
router.post("/updateOrderStatus", authMiddleware, updateOrderStatus);

/**
 * @swagger
 * /api/admin/getAllOrders:
 *   get:
 *     summary: Get all orders with optional search and pagination
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         required: false
 *         description: Search by user's first or last name
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         required: false
 *         default: 1
 *         description: Current page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         required: false
 *         default: 10
 *         description: Number of orders per page
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
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Order'
 *                 currentPage:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 totalItems:
 *                   type: integer
 *       500:
 *         description: Server error
 */
router.get("/getAllOrders", authMiddleware, getAllOrders);

/**
 * @swagger
 * /api/admin/getOrderByUserIdInAdmin:
 *   get:
 *     summary: Get all orders by userId (Admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: MongoDB ObjectId of the user
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
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Fetched orders successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     description: Order details
 *       500:
 *         description: Error fetching orders
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Error fetching orders
 *                 error:
 *                   type: string
 *                   example: Internal server error
 */
router.get("/getOrderByUserIdInAdmin", authMiddleware, getOrderByUserIdInAdmin);

/**
 * @swagger
 * /api/admin/getUserDetailsById:
 *   get:
 *     summary: Get user details along with order history (Admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: MongoDB ObjectId of the user
 *     responses:
 *       200:
 *         description: User details fetched successfully
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
 *                   example: User details fetched successfully
 *                 user:
 *                   type: object
 *                   description: User data with order history
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 64a3c1b9fbd6ae0013b79abc
 *                     firstName:
 *                       type: string
 *                       example: John
 *                     lastName:
 *                       type: string
 *                       example: Doe
 *                     email:
 *                       type: string
 *                       example: john@example.com
 *                     phone:
 *                       type: string
 *                       example: 9876543210
 *                     wallet:
 *                       type: number
 *                       example: 150.5
 *                     orders:
 *                       type: array
 *                       description: List of orders placed by the user
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: 64a5d1e2bf6c2b00123abcde
 *                           totalAmount:
 *                             type: number
 *                             example: 999.99
 *                           paymentStatus:
 *                             type: string
 *                             example: success
 *                           shippingAddress:
 *                             type: string
 *                             example: 123 Street, City, India
 *                           items:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 productId:
 *                                   type: object
 *                                   description: Product info
 *                                 quantity:
 *                                   type: number
 *                                   example: 2
 *                                 price:
 *                                   type: number
 *                                   example: 499.99
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: User not found
 *       500:
 *         description: Error fetching user details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Error fetching user details
 *                 error:
 *                   type: string
 *                   example: Internal server error
 */
router.get("/getUserDetailsById", authMiddleware, getUserDetailsById);

export default router;
