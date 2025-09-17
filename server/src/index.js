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
const PORT = process.env.PORT;
const __dirname = path.resolve()

app.use(express.json())
app.use(cookieParser())
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}))
// routers
app.use('/api/auth/', AuthRoute);
app.use('/api/messages/', MessageRoute);

if (process.env.NODE_ENV === 'production'){
  app.use(express.static(path.join(__dirname, "../client/dist")))

  app.get('*', (req, res) => {
    res.sendFile((path.join(__dirname, "../client", "dist", "index.html")))
  })
}

server.listen(PORT, () => {
  console.log(`server start on http://localhost:${PORT}`);
  connectDB()
})
