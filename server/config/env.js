// server\config\env.js
import dotenv from "dotenv";

dotenv.config({
    path: process.env.NODE_ENV === "production"
        ? ".env.production"
        : ".env.development",
    quiet: true
});

// console.log("Loaded ENV:", process.env.NODE_ENV);