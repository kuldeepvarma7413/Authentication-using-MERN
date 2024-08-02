import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.mjs";
import Token from "../models/passwordResetToken.mjs";
import { getDb } from "../db/conn.mjs";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.mjs";
import VToken from "../models/verificationToken.mjs";
import { OAuth2Client } from "google-auth-library";

const router = express.Router();

// Register API
router.post("/register", async (req, res) => {
  // check valid email
  if (!isValidEmail(req.body.email)) {
    return res.status(400).json({ message: "Invalid email" });
  }
  // check valid password
  if (!isValidPassword(req.body.password)) {
    return res.status(400).json({ message: "Invalid password" });
  }
  // check valid username
  if (!isValidUsername(req.body.username)) {
    return res.status(400).json({ message: "Invalid username" });
  }

  const db = getDb().connection;

  //   check if user exists
  const user = await db.collection("users").findOne({
    $or: [
      { email: req.body.email, accountType: "local" },
      { username: req.body.username, accountType: "local" },
    ],
  });
  if (user) {
    // check if verified
    if (user.isVerified) {
      return res.status(400).json({ message: "User already exists" });
    }
    // send verification mail
    let token = db
      .collection("emailverificationtokens")
      .findOne({ user: user._id });
    if (token) {
      await db
        .collection("emailverificationtokens")
        .deleteOne({ user: user._id });
    }
    // create new token
    let verificationToken = new VToken({
      user: user._id,
      token: crypto.randomBytes(16).toString("hex"),
    });

    verificationToken = await verificationToken.save();

    // create veriication link
    let url = `${process.env.CLIENT_URL}/verify-email/${verificationToken.token}`;

    // send Email
    await sendEmail(
      user.email,
      "Email Verification",
      "Click this link to verify your email\n" + url
    );

    return res
      .status(200)
      .json({ message: "Verification mail sent. Please verify." });
  }
  // hash password
  const numSaltRounds = process.env.NODE_ENV === "development" ? 1 : 10;
  const password = await bcrypt.hash(req.body.password, numSaltRounds);
  // create new user
  const newUser = new User({
    email: req.body.email,
    username: req.body.username,
    password: password,
  });

  const savedUser = await newUser.save();

  let token = db
    .collection("emailverificationtokens")
    .findOne({ user: savedUser._id });
  if (token) {
    await db
      .collection("emailverificationtokens")
      .deleteOne({ user: savedUser._id });
  }

  // create new token
  let verificationToken = new VToken({
    user: savedUser._id,
    token: crypto.randomBytes(16).toString("hex"),
  });

  verificationToken = await verificationToken.save();

  // create veriication link
  let url = `${process.env.CLIENT_URL}/verify-email/${verificationToken.token}`;

  // send Email
  await sendEmail(
    savedUser.email,
    "Email Verification",
    "Click this link to verify your email\n" + url
  );

  return res
    .status(201)
    .json({ message: "Verification mail sent. Please verify." });
});

// login API
router.post("/login", async (req, res) => {
  //   check email or username
  const email_username = req.body.emailOrUsername;
  const email_or_username = checkEmailOrUsername(email_username);
  let user = null;

  try {
    const db = getDb().connection;

    if (email_or_username === "email") {
      user = await db
        .collection("users")
        .findOne({ email: email_username, accountType: "local" });
    } else if (email_or_username === "username") {
      user = await db.collection("users").findOne({
        username: email_username,
        accountType: "local",
      });
    } else {
      return res.status(400).json({ message: "Invalid email or username" });
    }

    //   match password
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // check if email is verified
    if (!user.isVerified) {
      return res.status(400).json({ message: "Email not verified" });
    }

    // create jwt token
    const token = jwt.sign(
      { username: user.username, email: user.email },
      process.env.JWT_SECRET
    );
    return res.json({ token: token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// verify email
router.post("/verify-email", async (req, res) => {
  const { token, userId } = req.body;
  try {
    // find token
    const db = getDb().connection;
    let vtoken = await db
      .collection("emailverificationtokens")
      .findOne({ token: token });
    if (!vtoken) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // find user
    let user = await db.collection("users").findOne({ _id: vtoken.user });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // update user verification status
    await db
      .collection("users")
      .findOneAndUpdate({ _id: vtoken.user }, { $set: { isVerified: true } });

    // delete token
    await db
      .collection("emailverificationtokens")
      .deleteOne({ _id: vtoken._id });

    return res.json({ message: "Email verified" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// reset password API to send password reset email
router.post("/forgot-password", async (req, res) => {
  const email_username = req.body.emailOrUsername;
  var email_or_username = checkEmailOrUsername(email_username);

  try {
    let user = null;
    const db = getDb().connection;

    if (email_or_username === "email") {
      user = await db
        .collection("users")
        .findOne({ email: email_username, accountType: "local" });
    } else if (email_or_username === "username") {
      user = await db
        .collection("users")
        .findOne({ username: email_username, accountType: "local" });
    }
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    // check if token already exists
    let token = await db
      .collection("passwordresettokens")
      .findOne({ user: user._id });
    if (token) {
      await db.collection("passwordresettokens").deleteOne({ user: user._id });
    }

    // create new token
    let resetToken = new Token({
      user: user._id,
      token: crypto.randomBytes(16).toString("hex"),
    });
    await resetToken.save();

    let url = `${process.env.CLIENT_URL}/reset-password/${resetToken.token}`;

    // send email
    await sendEmail(
      user.email,
      "Password Reset",
      "Click this link to reset your password\n" + url
    );

    return res.json({
      status: "OK",
      message: "Password reset email sent",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// reset password API to reset password
router.post("/reset-password", async (req, res) => {
  const { token, password } = req.body;
  try {
    // find token
    const db = getDb().connection;
    let resetToken = await db
      .collection("passwordresettokens")
      .findOne({ token: token });
    if (!resetToken) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }
    // find user
    const user = await db
      .collection("users")
      .findOne({ _id: resetToken.user, accountType: "local" });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // validate password
    if (!isValidPassword(password)) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // check password should not be same as the old password
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      return res.status(400).json({ message: "Password cannot be same" });
    }

    // hash password
    const numSaltRounds = process.env.NODE_ENV === "development" ? 1 : 10;
    const hassedPassword = await bcrypt.hash(password, numSaltRounds);

    // update password
    await db
      .collection("users")
      .findOneAndUpdate(
        { _id: resetToken.user },
        { $set: { password: hassedPassword } }
      );

    // delete token
    await db
      .collection("passwordresettokens")
      .deleteOne({ _id: resetToken._id });

    return res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// google auth API

const oAuth2Client = new OAuth2Client({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: process.env.GOOGLE_REDIRECT_URI,
});

const getUserData = async (access_token) => {
  const res = await fetch(
    `https://www.googleapis.com/oauth2/v3/userinfo?alt=json&access_token=${access_token}`
  );
  return await res.json();
};

router.get("/google-request", async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Referrer-Policy", "no-referrer-when-downgrade");

  const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  const authorizeURI = client.generateAuthUrl({
    access_type: "offline",
    scope: ["email", "profile"],
    prompt: "consent",
  });

  return res.json({ url: authorizeURI });
});

router.get("/google", async (req, res) => {
  const access_code = req.query.code;
  try {
    const response = await oAuth2Client.getToken(access_code);
    await oAuth2Client.setCredentials(response.tokens);
    const googleUser = oAuth2Client.credentials;
    const userData = await getUserData(googleUser.access_token);

    const db = getDb().connection;

    // check if user already exists
    const user = await db
      .collection("users")
      .findOne({ email: userData.email, accountType: "google" });

    let token = null;
    if (user) {
      token = jwt.sign(
        { username: user.username, email: user.email },
        process.env.JWT_SECRET
      );
    } else {
      // if user doesn't exist, create new user
      const newUser = new User({
        name: userData.name,
        email: userData.email,
        photo: userData.picture,
        username:
          userData.email.split("@")[0].substr(0, 8) +
          Math.floor(Math.random() * 1000),
        accountType: "google",
        isVerified: true,
      });
      // see new user

      const savedUser = await newUser.save();
      token = jwt.sign(
        { username: savedUser.username, email: savedUser.email },
        process.env.JWT_SECRET
      );
    }
    return res.redirect(
      `${process.env.CLIENT_URL}/google-auth-success?token=${token}`
    );
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// functions
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
const usernameRegex = /^[a-z0-9_.]{2,}$/;

function isValidEmail(email) {
  return emailRegex.test(email);
}

function isValidPassword(password) {
  return passwordRegex.test(password);
}

function isValidUsername(username) {
  return usernameRegex.test(username);
}

function checkEmailOrUsername(str) {
  if (isValidEmail(str)) {
    return "email";
  } else if (isValidUsername(str)) {
    return "username";
  } else {
    return "invalid";
  }
}

export default router;
