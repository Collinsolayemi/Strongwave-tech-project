import mongoose from "mongoose";
import bcrypt from "bcryptjs";
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    email: {
      type: String,
      trim: true,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      trim: true,
      required: true,
      min: 8,
      max: 64,
    },
    first_name: {
      type: String,
      trim: true,
    },
    last_name: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      unique: true,
    },
    role: {
      type: String,
      enum: ["admin", "buyer", "seller"],
      required: true,
    },
    store_name: {
      type: String,
      trim: true,
    },
    store_id: {
      type: String,
      trim: true,
    },
    store_description: {
      type: String,
      trim: true,
      max: 2000,
    },
    store_location: {
      type: String,
      trim: true,
    },
    store_owner_address: {
      address_line1: {
        type: String,
        trim: true,
      },
      lga: {
        type: String,
        trim: true,
      },
      city: {
        type: String,
        trim: true,
      },
      state: {
        type: String,
        trim: true,
      },
    },
    email_verified: {
      type: Boolean,
      default: false,
      required: true,
    },
    phone_verified_id: {
      type: String,
    },
    phone_verified: {
      type: Boolean,
      default: false,
      required: true,
    },
    isInMandilasMarket: {
      type: Boolean,
    },
    isApproved: {
      type: String,
      enum: ["approved", "declined"],
      trim: true,
    },
  },
  { timestamps: true }
);

userSchema.methods.comparePassword = async function (password) {
  const result = bcrypt.compareSync(password, this.password);
  return result;
};

export default mongoose.model("User", userSchema);
