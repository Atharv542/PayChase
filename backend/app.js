require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");

const authRoutes = require("./routes/auth.routes");
const itemRoutes= require('./routes/item.routes');
const profileRoutes=require('./routes/profile.routes');
const documentRoutes= require('./routes/document.routes');
const aiRoutes= require('./routes/ai.routes')
const aiRewrite= require('./routes/ai.rewrites')

const app = express();
app.set("trust proxy", 1);
connectDB();

app.use(
  cors({
    origin: [
      "https://paychase-frontend.onrender.com",
    ],
    credentials: true,
  })
);


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/items",itemRoutes);
app.use("/api/profile",profileRoutes);
app.use("/api/documents",documentRoutes);
app.use('/api/ai',aiRoutes)
app.use('/api/rewrite',aiRewrite)


app.listen(8080, () => console.log("Backend running on 8080"));
