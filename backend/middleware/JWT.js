import dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";

function verifyToken(req, res, next) {
  // Verify user Token from cookies or headers
  let token = req.cookies.token;
  
  // If no token in cookies, check Authorization header
  if (!token && req.headers.authorization) {
    token = req.headers.authorization.replace('Bearer ', '');
  }
  
  if (!token) return res.status(401).send("Access Denied");

  // Handle demo token for development
  if (token === 'demo-token-for-development') {
    req.user = { email: 'demo@teacher.com' };
    next();
    return;
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).send("Invalid Token");
  }
}

function verifyTokenSync(token) {
  // Synchronously verify token without middleware
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return null;
  }
}

function generateToken(data) {
  // Will generate token using user info and server secret key
  return jwt.sign(data, process.env.JWT_SECRET, { expiresIn: "5h" });
}

const JWT = {
  verifyToken,
  verifyTokenSync,
  generateToken,
};

export default JWT;
