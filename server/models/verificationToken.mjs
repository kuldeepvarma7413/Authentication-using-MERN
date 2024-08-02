import mongoose from "mongoose";
import Token from "./passwordResetToken.mjs";
const Schema = mongoose.Schema;

const VerifyToken = new Schema({
  token: { type: String, required: true, unique: true },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
    unique: true,
  },
  createdAt: { type: Date, required: true, default: Date.now, expires: 43200 },
});

const VToken = mongoose.model("EmailVerificationToken", VerifyToken);

export default VToken;