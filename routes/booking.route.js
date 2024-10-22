const express = require("express");
const {
  bookRoom,
  cancelBooking,
  updateBooking,
  getAllBookings,
  getUserBookings,
} = require("../controllers/booking.controller");
const { authenticateJWT, authorizeRoles } = require("../middlewares/auth");

const bookingRouter = express.Router();

bookingRouter.post("/book-room", authenticateJWT, bookRoom);
bookingRouter.delete(
  "/:id",
  authenticateJWT,
  authorizeRoles(["admin"]),
  cancelBooking
);
bookingRouter.put(
  "/:id",
  authenticateJWT,
  authorizeRoles(["admin"]),
  updateBooking
);
bookingRouter.get(
  "/",
  authenticateJWT,
  authorizeRoles(["admin"]),
  getAllBookings
);
bookingRouter.get("/:userId", authenticateJWT, getUserBookings);
module.exports = bookingRouter;
