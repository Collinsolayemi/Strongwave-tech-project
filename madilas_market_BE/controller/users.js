import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import otpGenerator from "otp-generator";
import User from "../model/users.js";
import ResetToken from "../model/resetToken.js";
import VerifyToken from "../model/verifyToken.js";
import initMB from "messagebird";
const messagebird = initMB(process.env.MESSAGEBIRD_API_KEY);

import jwt from "jsonwebtoken";

// Used to handle error responses
import { sendError, randomBytes } from "../utils/helpers.js";
import {
  NewUserVerify,
  NewUserVerified,
  UserPasswordReset,
  UserPasswordUpdated,
} from "../utils/mail.js";

// Sign in function
export const loginBuyerOrSeller = async (req, res) => {
  // Get email and password details form the post req data
  const { email, password } = req.body;

  try {
    if (!email) return res.status(400).send("Email address is required");
    if (!password) return res.status(400).send("Please enter your password");

    // check if user.email exist
    const existingUser = await User.findOne({
      $and: [{ email: email }],
      $or: [{ rolea: "seller" }, { role: "buyer" }],
    });

    // json response message if no such user.email is found
    if (!existingUser)
      return res.status(404).json({ error: "This user doesn't exist" });

    if (existingUser.email_verified === false) {
      return res.status(405).json({
        status: 405,
        error:
          "Account has not been verified. A new OTP code has been sent, please check your mail.",
        existingUser,
      });
    }
    // if(existingUser.phone_verified === false){
    //   return res.status(405).json({
    //     status: 405,
    //     message:
    //       "Your phone number has not been verified. A new OTP code has been sent, please check your message.",
    //     existingUser,
    //   });
    // }
    else {
      // check if user.password is correct with the existing password
      const isPasswordCorrect = await bcrypt.compare(
        password,
        existingUser.password
      );

      // json response message if password is incorrect
      if (!isPasswordCorrect)
        return res.status(400).json({
          error: "Information entered is incorrect. Please recheck",
        });

      // Get jsonwebtoken and send t the frontend. Information to store in the token, + secret key string, + How long to stay logged in
      const token = jwt.sign(
        { email: existingUser.email, id: existingUser._id },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "1hr" }
      );

      return res.status(200).json({
        status: 200,
        message: "✅ User Login Successful",
        existingUser,
        token,
      });
    }
  } catch (error) {
    return res.status(400).json({
      status: 400,
      message: "❌ Could not login",
      error: error.message,
    });
  }
};

// Buyer Sign up function
export const registerBuyer = async (req, res) => {
  // Get email,password and etc details form the post req data
  const { email, password, first_name, last_name, phone } = req.body;

  try {
    if (!email) return res.status(400).send("Email address is required");
    if (!password) return res.status(400).send("Please create a password");

    // check if user(email ) is an existing user. Why? to not duplicate email addresses!
    const existingUser = await User.findOne({ email });
    if (existingUser) return sendError(res, "This email already exist");

    // Hash the password using bcrypt. password,+salt(level of hashing difficulty)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create our user object with all the information on the database
    const profile = new User({
      email,
      password: hashedPassword,
      first_name,
      last_name,
      phone,
      role: "buyer",
    });

    const OTP = otpGenerator.generate(6, {
      digits: true,
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    const verifyToken = new VerifyToken({
      userId: profile._id,
      token: OTP,
    });

    // console.log(verifyToken);
    // console.log(new Date().getTime(), new Date().getTime() + 1200000);

    // Get jsonwebtoken and send t the frontend. Information to store in the token, + secret key string, + How long to stay logged in
    const token = jwt.sign(
      { email: profile.email, id: profile._id },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1hr" }
    );

    await profile.save();
    await verifyToken.save();

    // Send Email to support that a new user has signed up
    NewUserVerify(profile.email, OTP);

    // console.log("Email sent out");

    // console.log("Profile saved and Token generated");

    return res.status(200).json({
      status: "PENDING EMAIL VERIFICATION",
      message: "✅ New buyer created",
      profile,
      token,
    });
  } catch (error) {
    // console.log(error)
    return res.status(400).json({
      status: "FAILED",
      message: "❌ Failed to create new user",
      error: error.message,
    });
  }
};

// Seller Sign up function
export const registerSeller = async (req, res) => {
  // Get email,password and etc details form the post req data
  const {
    email,
    password,
    first_name,
    last_name,
    phone,
    store_name,
    store_description,
    store_location,
    store_owner_address,
    isInMandilasMarket,
  } = req.body;

  try {
    if (!email) return res.status(400).send("Email address is required");
    if (!password) return res.status(400).send("Please create a password");
    if (isInMandilasMarket === false)
      return res.status(400).json({
        error:
          "seller must have a physical store in 8 Broad Street, Lagos, Nigeria",
      });

    // check if user(email ) is an existing user. Why? to not duplicate email addresses!
    const existingUser = await User.findOne({ email });
    if (existingUser) return sendError(res, "This email already exist");

    // Hash the password using bcrypt. password,+salt(level of hashing difficulty)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create our user object with all the information on the database
    const profile = new User({
      email,
      password: hashedPassword,
      first_name,
      last_name,
      phone,
      store_name,
      store_description,
      store_location,
      store_owner_address,
      isInMandilasMarket,
      role: "seller",
    });

    const OTP = otpGenerator.generate(6, {
      digits: true,
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    const verifyToken = new VerifyToken({
      userId: profile._id,
      token: OTP,
    });

    // console.log(verifyToken);
    // console.log(new Date().getTime(), new Date().getTime() + 1200000);

    // Get jsonwebtoken and send t the frontend. Information to store in the token, + secret key string, + How long to stay logged in
    const token = jwt.sign(
      { email: profile.email, id: profile._id },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1hr" }
    );

    await profile.save();
    await verifyToken.save();

    // Send Email to support that a new user has signed up
    NewUserVerify(profile.email, OTP);

    // console.log("Email sent out");

    // console.log("Profile saved and Token generated");

    return res.status(200).json({
      status: "PENDING EMAIL VERIFICATION",
      message: "✅ New seller created and submitted for approval",
      profile,
      token,
    });
  } catch (error) {
    // console.log(error)
    return res.status(400).json({
      status: "FAILED",
      message: "❌ Failed to create new user",
      error: error.message,
    });
  }
};

// verify users email address
export const verifyEmail = async (req, res) => {
  try {
    const { userId } = req.params;
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return sendError(res, "invalid request. User is required to signUp");
    }
    const { otp } = req.body;
    if (!otp) {
      return sendError(res, "invalid request. OTP is required");
    } else {
      const userVerification = await VerifyToken.find({ userId });
      // console.log(userVerification);

      if (userVerification.length <= 0) {
        return sendError(res, "Accounts has been verified. Please log in");
      } else {
        const { expiresAt } = userVerification[0];
        const hashedOTP = userVerification[0].token;

        // console.log(expiresAt, hashedOTP, otp);

        // console.log(expiresAt, new Date().getTime());

        if (expiresAt) {
          const isMatched = await bcrypt.compare(otp, hashedOTP);

          // console.log(isMatched);

          if (!isMatched) {
            return sendError(
              res,
              "Invalid code. Please check your inbox and provide valid otp code"
            );
          } else {
            // console.log(userVerification[0].id);
            await User.updateOne({ _id: userId }, { email_verified: true });
            await VerifyToken.deleteMany({ userId });

            NewUserVerified(existingUser.email);

            return res.status(201).json({
              status: "SUCCESS",
              message: "✅ User Email Verified successfully",
            });
          }
        } else {
          // user otp record has expired
          await VerifyToken.deleteMany({ userId });
          return sendError(res, "Code has expired. Please request a new otp");
        }
      }
    }
  } catch (error) {
    return res.status(400).json({ status: "FAILED", error: error.message });
  }
};

// Resend Otp Code Change
export const resendOTP = async (req, res) => {
  try {
    let { email } = req.body;

    if (!email) {
      return sendError(res, "Empty user details are not allowed");
    } else {
      // check if user.email exist
      const existingUser = await User.findOne({ email });

      const userId = existingUser._id;
      // console.log(userId);

      // delete existing records and resend
      await VerifyToken.deleteMany({ userId });

      const OTP = otpGenerator.generate(5, {
        digits: true,
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });

      const verifyToken = new VerifyToken({
        userId,
        token: OTP,
      });

      // Send Email to support that a new user has signed up
      NewUserVerify(email, OTP);

      await verifyToken.save();

      // console.log("New Token generated");

      return res.status(200).json({
        status: "PENDING",
        message: "✅New OTP sent to Email",
      });
    }
  } catch (error) {
    return res.status(400).json({ status: "FAILED", error: error.message });
  }
};

// Sending Phone Verification OTP
export const sendPhoneVerifationOTP = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (user.phone_verified === true) {
      return res.status(400).json({ error: "phone number already verified" });
    }
    messagebird.verify.create(
      user.phone,
      {
        originator: "Mandilas",
        template: "Your verification code is %token.",
      },
      (err, response) => {
        if (err) {
          console.log(err);
          return res.status(400).json({
            error: err.errors[0].description,
          });
        } else {
          user.phone_verified_id = response.id;
          return res.status(201).json({
            error: "phone verification code sent",
          });
        }
      }
    );
  } catch (error) {
    // console.log(error)
    return res.status(500).json({
      error: error.message,
    });
  }
};

export const verifyPhoneNumber = async (req, res) => {
  try {
    const { userId } = req.params;
    const { token } = req.body;
    const user = await User.findById(userId);
    if (user.phone_verified === true) {
      return res.status(400).json({ error: "phone number already verified" });
    }
    const response = await messagebird.verify.verify(
      user.phone_verified_id,
      token
    );
    if (response) {
      return res.status(200).json({
        message: "phone number verified successfully",
      });
    }
  } catch (error) {
    return res.status(400).json({
      error: error.errors[0].description,
    });
  }
};

// Get profile of registered user
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");

    return res.status(200).json({
      user: user,
    });
  } catch (error) {
    return res.status(500).json({ status: "FAILED", error: err.message });
  }
};

// update profile of registered user
export const updateUserProfile = async (req, res) => {
  try {
    const { id: _id } = req.params;
    const profileUpdate = req.body;

    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(404).send("No profile with that id");
    }

    const updatedUser = await User.findByIdAndUpdate(
      _id,
      { ...profileUpdate, _id },
      {
        new: true,
      }
    ).select("-password");

    return res.status(200).json(updatedUser);
  } catch (err) {
    return res.status(500).json({ status: "FAILED", error: err.message });
  }
};

// update password of registered user
export const updatePassword = async (req, res) => {
  try {
    const { id: _id } = req.params;
    const { password } = req.body;

    const user = await User.findById(_id);
    if (!user) return res.status(404).send("User not found");
    // console.log(_id, password);
    const salt = await bcrypt.genSalt(10);
    const newPassword = await bcrypt.hash(password, salt);

    const changePassword = await User.findByIdAndUpdate(
      _id,
      {
        password: newPassword,
      },
      {
        new: true,
      }
    );
    return res.status(200).json({
      status: true,
      message: "Password successfully updated",
      changePassword,
    });
  } catch (error) {
    return res.status(500).json({ status: "FAILED", error: error.message });
  }
};

// forgot password of registered user
export const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return sendError(res, "please provide a valid email!");

    const user = await User.findOne({ email });
    if (!user) return sendError(res, "User not found, invalid request");

    const token = await ResetToken.findOne({ owner: user._id });
    if (token)
      return sendError(
        res,
        "New request token can only be generated after 30 minutes"
      );

    const newToken = await randomBytes();
    const resetToken = new ResetToken({ owner: user._id, token: newToken });

    await resetToken.save();

    // Send Email to support that a new user has signed up
    UserPasswordReset(newToken, email, req);
    // console.log(email);

    return res.status(201).json({
      success: true,
      message: "Password Reset link is sent to your email",
    });
  } catch (error) {
    return res.status(500).json({ status: "FAILED", error: error.message });
  }
};

// reset password of registered user
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const resetToken = await ResetToken.findOne({ token });
    if (!resetToken) return sendError(res, "Reset token not found!");

    const user = await User.findById(resetToken.owner);
    if (!user) return sendError(res, "User not found");

    const isSamePassword = await user.comparePassword(password);
    if (isSamePassword)
      return sendError(res, "New password cannot be old password");

    if (password.trim().length < 8 || password.trim().length > 20)
      return sendError(res, "Password must be 8-20 characters long");

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password.trim(), salt);
    await user.save();

    await ResetToken.findByIdAndDelete(resetToken._id);

    UserPasswordUpdated(user.email);
    // console.log(user.email);

    return res.status(201).json({
      success: true,
      message: "Password Reset successful",
    });
  } catch (error) {
    return res.status(500).json({ status: "FAILED", error: error.message });
  }
};
