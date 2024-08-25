import "dotenv/config";
import jwt from "jsonwebtoken";
import express from "express";
const router = express.Router();

router.use((req, res, next) => {
  const bearer = req.headers["authorization"];
  const token = bearer.split(" ")[1];
  if (!token) {
    res.status(401).send("Unauthorized access");
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      res.status(401).send("Unauthorized access");
    }
    return decoded;
  });
  req.user = decoded;
  next();
});

export default router;
