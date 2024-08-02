import mongoose from "mongoose";
const Schema = mongoose.Schema;

const token = Schema({
  token: { type: String, required: true },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
    unique: true,
  },
  createdAt: { type: Date, required: true, default: Date.now, expires: 43200 },
});

const Token = mongoose.model("PasswordResetToken", token);

export default Token;