import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.mjs";
import { getDb } from "../db/conn.mjs";

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
    return res.status(400).json({ message: "User already exists" });
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

  // create jwt token
  const token = jwt.sign(
    { username: savedUser.username, email: savedUser.email },
    process.env.JWT_SECRET
  );
  res.json({ token: token });
});

// login API
router.post("/login", async (req, res) => {
  //   check email or username
  const email_username = req.body.emailOrUsername;
  const email_or_username = checkEmailOrUsername(email_username);
  let user = null;

  const db = getDb().connection;

  if (email_or_username === "email") {
    user = await db.collection("users").findOne({ email: email_username, accountType: "local" });
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

  // create jwt token
  const token = jwt.sign(
    { username: user.username, email: user.email },
    process.env.JWT_SECRET
  );
  res.json({ token: token });
});

// reset password API
router.post("/forgot-password", async (req, res) =>{
    const email_username = req.body.emailOrUsername;
    var email_or_username = checkEmailOrUsername(email_username);
    
    let user = null;
    const db = getDb().connection;

    if(email_or_username === "email"){
        user = await db.collection("users").findOne({email: email_username, accountType: "local"});
    } else if(email_or_username === "username"){
        user = await db.collection("users").findOne({username: email_username, accountType: "local"});
    }
    if(!user){
        return res.status(400).json({message: "User not found"});
    }
    // send password reset email
    res.json({message: "Password reset email sent"});
})

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
