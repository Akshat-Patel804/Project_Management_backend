import { body } from "express-validator";
import {AvailableUserRole} from "../utils/constanse.js"

const userRegisterValidator = () => {
    return[
        body("email")
            .trim()
            .notEmpty()
            .withMessage("Email is required")
            .isEmail()
            .withMessage("Email is invalid"),
        body("username")
            .trim()
            .notEmpty()
            .withMessage("Username is required")
            .isLowercase()
            .withMessage("Username must be in lowercase")
            .isLength({min:4})
            .withMessage("Username must be atlest 4 characters long"),
        body("password")
            .trim()
            .notEmpty()
            .withMessage("Password is required"),
        body("fullName")
            .optional()
            .trim()
    ]
}

const userLoginValidator = () => {
    return [
        body("email")
            .optional()
            .isEmail()
            .withMessage("Email is invalid"),
        body("password")
            .notEmpty()
            .withMessage("Password is required")
    ]
}

const userChangeCurrentPasswordValidator = () => {
    return [
        body("oldPassword").notEmpty().withMessage("Old Password is Required"),
        body("newPassword").notEmpty().withMessage("new Password is required")
    ]
}

const userForgotPasswordValidator = () => {
    return[
        body("email").notEmpty().withMessage("Email is required").isEmail().withMessage("Email is invalid")
    ]
}

const userResetPasswordValidator = () => {
    return[
        body("newPassword").notEmpty().withMessage("password is required")
    ]
}

const createProjectValidator = () => {
    return[
        body("name")
          .notEmpty()
          .withMessage("Name is Required"),
        body("description")
          .optional(),
    ];
}

const addMembertoProjectValidator = () => {
    return[
        body("email")
          .trim()
          .notEmpty()
          .withMessage("Email is required")
          .isEmail()
          .withMessage("Email is invalid"),
        body("role")
          .notEmpty()
          .withMessage("Role is required")
          .isIn(AvailableUserRole)
          .withMessage("Role is invalid")

    ]
}

export {
    userRegisterValidator,userLoginValidator,userChangeCurrentPasswordValidator,userForgotPasswordValidator,userResetPasswordValidator,createProjectValidator,addMembertoProjectValidator
}