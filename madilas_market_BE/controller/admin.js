import User from "../model/users.js";
import bcrypt from "bcryptjs";
import { sellerRequestApproved, sellerRequestDeclined } from "../utils/mail.js";
import jwt from "jsonwebtoken";

export const createAdmin = async(req, res) => {
  try {
     //get details from post request;
    const {
      email,
      password,
      first_name,
      last_name,
      phone
    } = req.body;

    if (!email) return res.status(400).send("Email address is required");
    if (!password) return res.status(400).send("Please create a password");
    if (email !== process.env.ADMIN_EMAIL) return res.status(401).send("Not Authorized");

     // check if user(email ) is an existing user. Why? to not duplicate email addresses!
    const existingUser = await User.findOne({ email });
    if (existingUser) return sendError(res, "This email already exist");
 
     // Hash the password using bcrypt. password,+salt(level of hashing difficulty)
     const salt = await bcrypt.genSalt(10);
     const hashedPassword = await bcrypt.hash(password, salt);
 
     // Create our admin user object with all the information on the database
     const admin = new User({
       email,
       password: hashedPassword,
       first_name,
       last_name,
       phone,
       role: "admin"
     });

     await admin.save();

    return res.status(201).json({
      status: "SUCCESS",
      message: "✅ Admin created",
      admin
    });
  
  } catch (error) {
    return res.status(500).json({
      status: "FAILED",
      message: "❌ Failed to create admin",
      error: error.message
    });
  }
};

// Admin Sign in function
export const loginAdmin = async (req, res) => {
  // Get email and password details form the post req data
  const { email, password} = req.body;

  try {
    if (!email) return res.status(400).send("Email address is required");
    if (!password) return res.status(400).send("Please enter your password");

    // check if user.email exist
    const existingAdmin = await User.findOne({$and: [{ email: email }, {role: 'admin'}]});

    // json response message if no such user.email is found
    if (!existingAdmin)
      return res.status(404).json({ error: "This admin doesn't exist" });

    else {
      // check if user.password is correct with the existing password
      const isPasswordCorrect = await bcrypt.compare(
        password,
        existingAdmin.password
      );

      // json response message if password is incorrect
      if (!isPasswordCorrect)
        return res.status(400).json({
          error: "Password is incorrect. Please recheck your password",
        });

      // Get jsonwebtoken and send t the frontend. Information to store in the token, + secret key string, + How long to stay logged in
      const token = jwt.sign(
        { email: existingAdmin.email, id: existingAdmin._id },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "1hr" }
      );

      return res.status(200).json({
        status: 200,
        message: "✅ Admin Login Successful",
        existingAdmin,
        token,
      });
    }
  } catch (error) {
    return res.status(400).json({
      status: 400,
      message: "❌ Admin could not login",
      error: error.message,
    });
  }
};

export const approveSeller = async(req, res, next) => {
  try {
    const {sellerId} = req.params;
    const {isApproval} = req.body;
    const seller = await User.findOne({$and: [{_id: sellerId}, {role: 'seller'}]}).select('-password');
    if(!seller){
      return res.status(404).json({
        error: 'seller not found'
      })
    }
    if(isApproval === 'approved'){
      //generating store id
      // //first count the number of seller in user collection
      const numberOfSeller = await User.countDocuments({$and: [{role: 'seller'}, {isApproved: 'approved'}]})
      const storeId = `MANDILAS-${(numberOfSeller + 1).toLocaleString(undefined, {minimumIntegerDigits:3})}`;
      console.log(storeId)
      seller.store_id = storeId;
      seller.isApproved = 'approved'
      await seller.save();
      // send a mail to seller
      sellerRequestApproved(seller.email, seller.store_id)
      return res.status(201).json({
        message: '✅ Seller Request Approved',
        seller: seller
      })
    }
    if(isApproval === 'declined'){
      seller.isApproved = 'declined'
      await seller.save()
      // send a mail to seller
      sellerRequestDeclined(seller.email)

      return res.status(201).json({
        message: '✅ Seller Request Declined',
        seller: seller
      })
    }
  } catch (error) {
    return res.status(500).json({
      error: error.message
    })
  }
  
};

export const getUsersPerRole = async(req, res, next) => {
  const {role} = req.query
  const usersPerRole = await User.find({role: role});
  if(usersPerRole.length === 0){
    return res.status(404).json({
      error: 'No user with that role'
    })
  }
  return res.status(200).json({
    usersPerRole
  })
}