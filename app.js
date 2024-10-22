const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const cors = require("cors");
var cookieParser = require("cookie-parser");
const globalErrorHandler = require("./middlewares/globalErrorHandler");
const userRouter = require("./routes/user.route");
const roomRouter = require("./routes/room.route");
const bookingRouter = require("./routes/booking.route");
const notFound = require("./middlewares/notFound");

const app = express();

// parser
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://room-booking-and-management-mern-next.vercel.app",
    ],
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.send("server is working");
});

// api endpoints
app.use("/api/user", userRouter);
app.use("/api/room", roomRouter);
app.use("/api/booking", bookingRouter);
app.use("/uploads", express.static("uploads"));

// Global Error handler middleware
app.use(globalErrorHandler);

// not found middleware
app.use(notFound);

module.exports = app;
