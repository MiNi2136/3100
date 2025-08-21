import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/userRoutes.js";
import SessionRoutes from "./routes/SessionRoutes.js";
import connectDB from "./config/db.js";

// Initialize the app
const app = express();
const PORT = process.env.PORT || 5000;
// Middleware
app.use(
  cors({
    origin: function(origin, callback) {
      const allowedOrigins = [process.env.CLIENT_URL || "http://localhost:3000", "http://localhost:3001"];
      // allow requests with no origin (like mobile apps or curl requests)
      if(!origin) return callback(null, true);
      if(allowedOrigins.indexOf(origin) === -1){
        const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json({ limit: "50mb" }));
app.use(express.static("public"));
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
// Connect to MongoDB
connectDB();

// Routes
app.use("/users", userRoutes);
app.use("/sessions", SessionRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
