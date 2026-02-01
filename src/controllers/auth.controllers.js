import {User} from "../models/user.models.js";
import {ApiResponse} from "../utils/api-response.js";
import {ApiError} from '../utils/api-error.js';
import {asyncHandler} from "../utils/async-handler.js"
import {emailVerificationMailContent, forgotPasswordMailGenContent, sendEmail} from "../utils/mail.js"
import {jwt} from "jsonwebtoken"

const generateAccessAndRefershTokens = async(userId) => {
    try{
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})

        return {accessToken,refreshToken} 
    }catch(error){
        console.error("JWT_GENERATION_ERROR:", error);
        throw new ApiError(
            500,
            "Something went wrong while generating access token"
        )
    }
}

const registerUser = asyncHandler(async(req,res)=>{
    const {email,username,password,role} = req.body

    const existedUser = await User.findOne({
        $or: [{username}, {email}]
    })

    if(existedUser){
        throw new ApiError(409, "user with email or username is already registered",[])
    }

    const user = await User.create({
        email,
        password,
        username,
        isEmailVerified: false
    })

    const {hashedToken, unHashedToken, tokenExpiry} = user.generateTemporaryToken()

    user.emailVerificationToken = hashedToken
    user.emailVerificationExpiry = tokenExpiry

    await user.save({validateBeforeSave: false})
    await sendEmail(
        {
            email: user?.email,
            subject: "please verify your email",
            mailgenContent: emailVerificationMailContent(
                user.username,
                `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unHashedToken}`
            )
        }
    );


    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken -emailVerificationToken -emailVerificationExpiry",
    )

    if(!createdUser){
        throw new ApiError(500, "something went wrong while registering a user")
    }

    return res
      .status(201)
      .json(
        new ApiResponse(
            200,
            {user: createdUser},
            "User registered Successfully"
        )
      )
});

const login = asyncHandler(async(req,res)=>{
    const {email, password, username} = req.body

    if(!email){
        throw new ApiError(400,"Email is required")
    }

    const user = await User.findOne({email});

    if(!user){
        throw new ApiError(400,"User does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if(!isPasswordValid){
        throw new ApiError(400,"invalid credentials");
    }

    const {accessToken,refreshToken} = await generateAccessAndRefershTokens(user._id);

     const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken -emailVerificationToken -emailVerificationExpiry",
    )

    const options = {
        httpOnly: true,
        secure: true 
    }

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser,
                accessToken,
                refreshToken
            },
            "User loggedin User"
        )
      )


})

const logoutUser = asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: "",
            },
        },
        {
            new: true,
        },
    );

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
      .status(200)
      .clearCookie("accessToken",options)
      .clearCookie("refreshToken",options)
      .json(
        new ApiResponse(200,{},"User Loggedout")
      )
});

const getCurrentUser = asyncHandler(async(req,res)=>{
    return res
      .status(200)
      .json(
        new ApiResponse(
            200,
            req.user,
            "Current User fatched successfully"
        )
      )
});

const verifyEmail = asyncHandler(async(req,res)=>{
    const {verificationToken} = req.params

    if(!verificationToken){
        throw new ApiError(400,"Email verification token is missing")
    }

    let hashedToken = crypto
      .createHash("sha256")
      .update(verificationToken)
      .digest("hex")

    const user = await User.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationExpiry: {$gt: Date.now()}
      })

    if(!user){
        throw new ApiError(400,"Email verification Token is invalid and missing")
    }

    user.emailVerificationExpiry = undefined
    user.emailVerificationToken = undefined

    user.isEmailVerified = true
    await user.save({validateBeforeSave: false})

    return res
      .status(200)
      .json(
        new ApiResponse(
            200,
            {
                isEmailVerified: true
            },
            "Email is verified "
        )
      )
})

const resendEmailVerification = asyncHandler(async(req,res)=>{
    const user = await User.findById(req.user?._id);

    if(!user){
        throw new ApiError(404,"User Doesnot Exist");
    }

    if(user.isEmailVerified){
        throw new ApiError(409,"Email is already verified")
    }

    const {hashedToken, unHashedToken, tokenExpiry} = user.generateTemporaryToken()

    user.emailVerificationToken = hashedToken
    user.emailVerificationExpiry = tokenExpiry

    await user.save({validateBeforeSave: false})
    await sendEmail(
        {
            email: user?.email,
            subject: "please verify your email",
            mailgenContent: emailVerificationMailContent(
                user.username,
                `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unHashedToken}`
            )
        }
    );

    return res
      .status(200)
      .json(
        new ApiResponse(
            200,
            "mail has been sent to your Email ID"
        )
      )

})

const refreshAccessToken = asyncHandler(async(req,res)=>{ 
    const incommingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incommingRefreshToken){
        throw new ApiError(401, "Unauthorized access")
    }

    try {
        const decodedToken = jwt.verify(incommingRefreshToken,process.env.REFRESH_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id);

        if(!user){
            throw new ApiError(401,"invalid refresh token ")
        }

        if(incommingRefreshToken !== user?.refreshToken){
            throw new ApiError(401,"refresh token is expired")
        }

        const options = {
            httpOnly: true,
            secure: true
        }

       const {accessToken,refreshToken: newRefreshToken} = await generateAccessAndRefershTokens(user._id)

       user.refreshToken = newRefreshToken;
       await user.save()

       return res
         .status(200)
         .cookie("accessToken",accessToken,options)
         .cookie("refreshToken",newRefreshToken,options)
         .json(
            new ApiResponse(
                200,
                {accessToken,refreshToken: newRefreshToken},
                "access token refreshed"
            )
         )


    } catch (error) {
         throw new ApiError(401,"invalid Refresh token")

    }

})

const forgotPasswordRequest = asyncHandler(async(req,res)=>{ 
    const {email} = req.body

    const user = await User.findOne({email});

    if(!user){
        throw new ApiError(404,"User does not exist",[])
    }

    const {unHashedToken,hashedToken,tokenExpiry} = user.generateTemporaryToken();

    user.forgotPasswordToken = hashedToken
    user.forgotPasswordExpiry = tokenExpiry

    await user.save({validateBeforeSave:false})

    await sendEmail(
        {
            email: user?.email,
            subject: "Password reset Request",
            mailgenContent: forgotPasswordMailGenContent(
                user.username,
                `${process.env.FORGOT_PASSWORD_REDIRECT_URL}/${unHashedToken}`,
            )
        }
    )

    return res
      .status(200)
      .json(
        new ApiResponse(
            200,
            {},
            "Password reset mail has been sent on your mail id" 
        )
      )
})

const resetForgotPassword = asyncHandler(async(req,res)=>{

    const {resetToken} = req.params
    const {newPassword} = req.body

    let hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex")

    const user = await User.findOne({
        forgotPasswordToken: hashedToken,
        forgotPasswordExpiry: {$gt: Date.now()}

      })

      if(!user){
        throw new ApiError(489,"Token is invalid or expired")
      }

      user.forgotPasswordExpiry = undefined
      user.forgotPasswordToken = undefined

      user.password = newPassword

      await user.save({validateBeforeSave:false})

      return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "Password reset Successfully"
            )
        )
 })


 const changeCurrentPassword = asyncHandler(async(req,res)=>{
    const {oldPassword, newPassword} = req.body

    const user = await User.findById(req.user?._id);

    const isPasswordValid = await user.isPasswordCorrect(oldPassword)

    if(!isPasswordValid){
        throw new ApiError(400,"invalid old Password")
    }

    user.password = newPassword
    await user.save({validateBeforeSave:false})

    return res
      .status(200)
      .json(
        new ApiResponse(
            200,
            {},
            "Password changed successfully"
        )
      )
  })
// const getCurrentUser = asyncHandler(async(req,res)=>{ })

export {registerUser,login,logoutUser,getCurrentUser,verifyEmail,resendEmailVerification,refreshAccessToken,forgotPasswordRequest,resetForgotPassword,changeCurrentPassword};