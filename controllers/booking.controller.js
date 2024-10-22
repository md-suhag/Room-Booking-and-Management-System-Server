const Booking = require("../models/booking.model");
const Room = require("../models/room.model");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const generateDateRange = require("../utils/generateDataRange");

const bookRoom = catchAsync(async (req, res, next) => {
  const { roomId, userId, startDate, endDate } = req.body;

  const room = await Room.findById(roomId);
  if (!room) {
    return next(new AppError("Room not found", 404));
  }

  if (new Date(startDate) >= new Date(endDate)) {
    return next(new AppError("End date must be after start date", 400));
  }

  // Generate an array of dates for the booking
  const bookingDates = generateDateRange(startDate, endDate);

  // Check for date conflicts with existing bookings
  const conflictingBookings = await Booking.find({
    roomId,
    dates: { $in: bookingDates },
  });

  if (conflictingBookings.length > 0) {
    return next(
      new AppError(
        "The room is already booked during the selected dates. Please choose different dates.",
        400
      )
    );
  }

  const newBooking = await Booking.create({
    userId,
    roomId,
    dates: bookingDates,
  });

  return res.status(201).json({
    success: true,
    message: "Room booked successfully!",
    data: newBooking,
  });
});

const cancelBooking = catchAsync(async (req, res, next) => {
  const bookingId = req.params.id;
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    return next(new AppError("Booking not found!", 404));
  }
  await Booking.findByIdAndDelete(bookingId);

  return res.status(204).json({
    success: true,
    message: "Booking canceled successfully!",
  });
});

const updateBooking = catchAsync(async (req, res, next) => {
  const bookingId = req.params.id;
  const { roomId, startDate, endDate } = req.body;

  if (!startDate || !endDate) {
    return next(new AppError("Please provide both start and end dates.", 400));
  }

  const dateRange = generateDateRange(startDate, endDate);

  const booking = await Booking.findById(bookingId);
  if (!booking) {
    return next(new AppError("Booking not found!", 404));
  }

  const room = await Room.findById(roomId);
  if (!room) {
    return next(new AppError("Room not found", 404));
  }

  // Check for booking conflicts
  const conflictingBooking = await Booking.findOne({
    roomId,
    dates: { $in: dateRange },
    _id: { $ne: bookingId },
  });

  if (conflictingBooking) {
    return next(
      new AppError(
        "The room is already booked for some or all of the selected dates.",
        400
      )
    );
  }
  booking.roomId = roomId || booking.roomId;
  booking.dates = dateRange;
  if (
    bookingStatus &&
    ["confirmed", "pending", "cancelled"].includes(bookingStatus)
  ) {
    booking.bookingStatus = bookingStatus;
  }

  await booking.save();

  return res.status(200).json({
    success: true,
    message: "Booking updated successfully!",
    data: booking,
  });
});

const getAllBookings = catchAsync(async (req, res, next) => {
  const bookings = await Booking.find()
    .populate("userId", "name email")
    .populate("roomId", "title rent");

  if (!bookings) {
    return next(new AppError("No bookings found", 404));
  }

  return res.status(200).json({
    success: true,
    results: bookings.length,
    data: bookings,
  });
});

const getUserBookings = catchAsync(async (req, res, next) => {
  const bookings = await Booking.find({ userId: req.user._id })
    .populate("roomId", "title rent facilities picture")
    .populate("userId", "name email");

  if (!bookings || bookings.length === 0) {
    return next(new AppError("No bookings found for this user", 404));
  }

  return res.status(200).json({
    success: true,
    results: bookings.length,
    data: bookings,
  });
});
module.exports = {
  bookRoom,
  cancelBooking,
  updateBooking,
  getAllBookings,
  getUserBookings,
};
