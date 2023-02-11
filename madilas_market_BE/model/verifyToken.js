import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const { Schema } = mongoose;

const verifyTokenSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    // expires: 120, //Token expires in 30 minute,
    default: new Date().getTime(),
  },
  expiresAt: {
    type: Date,
    default: new Date().getTime() + 1200000,
  },
});

verifyTokenSchema.pre("save", async function (next) {
  if (this.isModified("token")) {
    const hash = await bcrypt.hash(this.token, 8);
    this.token = hash;
  }
  next();
});

verifyTokenSchema.methods.compareToken = async function (token) {
  const result = bcrypt.compareSync(token, this.token);
  return result;
};

export default mongoose.model("VerifyToken", verifyTokenSchema);
