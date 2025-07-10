import express from "express";
import { policyUpdate, getPolicy, loginAdmin, adminSignup, getAdminDetail, resetAdminPassword, updateAdminDetail, addUpdateMembership, getAllMembership, addFAQ, updateFAQ, getAllFAQs, getFAQById, addProduct } from "../controllers/adminController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { uploadProfile } from "../middlewares/uploadMiddleware.js";

const router = express.Router();

router.post("/adminSignup", adminSignup);

router.post("/loginAdmin", loginAdmin);

router.get("/getAdminDetail", authMiddleware, getAdminDetail);

router.post("/resetAdminPassword", authMiddleware, resetAdminPassword);

router.post("/updateAdminDetail", authMiddleware, updateAdminDetail);

router.post("/policyUpdate", authMiddleware, policyUpdate);

router.get("/getPolicy", authMiddleware, getPolicy);

router.post("/addUpdateMembership", authMiddleware, addUpdateMembership);

router.get("/getAllMembership", authMiddleware, getAllMembership);

router.post("/addFAQ", authMiddleware, addFAQ);

router.post("/updateFAQ", authMiddleware, updateFAQ);

router.get("/getAllFAQs", authMiddleware, getAllFAQs);

router.get("/getFAQById", authMiddleware, getFAQById);

router.post("/addProduct", uploadProfile.array("images", 100)
, authMiddleware, addProduct);





export default router;
