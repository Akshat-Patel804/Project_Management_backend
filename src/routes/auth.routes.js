import { Router } from "express";
import { registerUser,login,logoutUser, verifyEmail, refreshAccessToken } from "../controllers/auth.controllers.js"
import { validate } from "../middlewares/validator.middlewares.js";
import { userRegisterValidator,userLoginValidator } from "../validators/index.js";
import {verifyJWT} from "../middlewares/auth.middlewares.js";

const router = Router();

// unsecured routes
router.route("/register").post(userRegisterValidator(),validate,registerUser);
router.route("/login").post(userLoginValidator(),validate,login);
router.route("/verify-email/:varificationToken").get(verifyEmail);
router.route("/refresh-token").post(refreshAccessToken);

// secured routes
router.route("/logout").post(verifyJWT,logoutUser);


export default router;