import {User} from "../models/user.models.js";
import {ApiResponse} from "../utils/api-response.js";
import {ApiError} from '../utils/api-error.js';
import {asyncHandler} from "../utils/async-handler.js"
import {emailVerificationMailContent, sendEmail} from "../utils/mail.js"

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
      .cookie("refreshtoken", refreshToken, options)
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

export {registerUser,login};