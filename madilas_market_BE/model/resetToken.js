import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const { Schema } = mongoose;

const resetTokenSchema = new Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  token: {
    type: String,
    required: true,
  },
  resetTokenExpired: {
    type: Date,
    required: true
  },
});

resetTokenSchema.pre("save", async function (next) {
  if (this.isModified("token")) {
    const hash = await bcrypt.hash(this.token, 8);
    this.token = hash;
    this.resetTokenExpired = Date.now() + 10 * 60 * 1000 // token expires in 5 minutes
  }
  next();
});


resetTokenSchema.methods.compareToken = async function (token) {
  const result = bcrypt.compareSync(token, this.token);
  return result;
};

export default mongoose.model("ResetToken", resetTokenSchema);
