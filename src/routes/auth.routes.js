import { Router } from "express";
import { registerUser,login,logoutUser, verifyEmail, refreshAccessToken, forgotPasswordRequest, resetForgotPassword, getCurrentUser, changeCurrentPassword, resendEmailVerification } from "../controllers/auth.controllers.js"
import { validate } from "../middlewares/validator.middlewares.js";
import { userRegisterValidator,userLoginValidator, userForgotPasswordValidator, userChangeCurrentPasswordValidator,userResetPasswordValidator } from "../validators/index.js";
import {verifyJWT} from "../middlewares/auth.middlewares.js";

const router = Router();

// unsecured routes
router.route("/register").post(userRegisterValidator(),validate,registerUser);
router.route("/login").post(userLoginValidator(),validate,login);
router.route("/verify-email/:varificationToken").get(verifyEmail);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/forgot-password").post(userForgotPasswordValidator(),validate,forgotPasswordRequest)
router.route("/reset-password/:resetToken").post(userResetPasswordValidator(),validate,resetForgotPassword)

// secured routes
router.route("/logout").post(verifyJWT,logoutUser);
router.route("/current-user").post(verifyJWT,getCurrentUser);
router.route("/change-password").post(verifyJWT,userChangeCurrentPasswordValidator(),validate,changeCurrentPassword);
router.route("/resend-email-varification").post(verifyJWT,resendEmailVerification);

export default router;