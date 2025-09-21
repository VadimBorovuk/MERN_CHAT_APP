import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser'
import AuthRoute from "./routes/auth.route.js";
import MessageRoute from "./routes/message.route.js";
import {connectDB} from "./lib/db.js";
import cors from "cors";

import path from "path";

import {app, server} from "./lib/socket.js";

dotenv.config();
const PORT = process.env.PORT || 5004;
const __dirname = path.resolve()

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.use(cookieParser())
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true
}))
// routers
app.use('/api/auth/', AuthRoute);
app.use('/api/messages/', MessageRoute);

// if (process.env.NODE_ENV === 'production'){
//   app.use(express.static(path.join(__dirname, "../frontend/dist")))
//
//   app.use((req, res) => {
//     res.sendFile(path.join(__dirname, 'frontend', 'dist', 'index.html'));
//   });
// }


if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

// if (process.env.NODE_ENV === 'production') {
//   const frontendPath = path.join(__dirname, "../frontend/dist");
//   app.use(express.static(frontendPath));
//   app.get("*", (req, res, next) => {
//     if (req.path.startsWith("/api")) return next();
//     res.sendFile(path.join(frontendPath, "index.html"));
//   });
// }

server.listen(PORT, () => {
  console.log(`server start on http://localhost:${PORT}`);
  connectDB()
})
