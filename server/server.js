const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const connectDb = require("./db/conn");
const errorMiddleware = require("./middlewares/errorMiddleware");
const authRoutes = require('./router/auth.routes');
const userRoutes = require('./router/user.routes');
const leadRoutes = require('./router/lead.routes');

const PORT = process.env.PORT || 5000;

// Middleware
const corsOptions = {
  origin: true, // reflects the request origin
  // origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true, // 🔥 required for cookies, auth headers
};
app.use(cors(corsOptions));

// app.use(cors({ origin: [/\.netlify\.app$/, "https://app.paisavidhya.com", "https://staging.app.paisavidhya.com"], credentials: true }));


// app.use(helmet());
// app.use(morgan('dev'));
app.use(express.json());

app.get("/api/health", (req, res) => res.status(200).send("ok"));


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

app.use('/api/leads', leadRoutes);

app.use('/api/audit', require('./router/audit.routes'));



// // Routes
// app.get("/", (req, res) => res.send("Welcome to Paisavidhya.com API"));


// Error handling middleware
app.use(errorMiddleware);

// Start the server
connectDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
