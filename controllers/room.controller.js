const Room = require("../models/room.model");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const fs = require("fs");
const path = require("path");

const getAllRoom = catchAsync(async (req, res, next) => {
  const rooms = await Room.find({});

  if (rooms.length === 0) {
    return next(new AppError("No rooms found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Room fetched successfully",
    data: rooms,
  });
});
const getSingleRoom = catchAsync(async (req, res, next) => {
  const roomId = req.params.id;
  const room = await Room.findById(roomId);
  if (!room) {
    return next(new AppError("Room not found!", 404));
  }
  return res.status(200).json({
    success: true,
    message: "Room fetched successfully!",
    data: room,
  });
});

const createRoom = catchAsync(async (req, res, next) => {
  const { title, rent, facilities } = req.body;

  if (!title || !rent || !facilities || !req.files) {
    return next(new AppError("Please provide all required fields", 400));
  }

  // Get array of file names from uploaded images
  const picture = req.files.map((file) => file.filename);

  const room = new Room({
    title,
    rent,
    facilities,
    picture,
  });
  await room.save();

  return res.status(201).json({
    success: true,
    message: "Room created successfully",
    data: room,
  });
});

const updateRoom = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { title, rent, facilities } = req.body;

  const room = await Room.findById(id);
  if (!room) {
    return next(new AppError("Room not found", 404));
  }

  // Update room fields
  room.title = title || room.title;
  room.rent = rent || room.rent;
  room.facilities = facilities ? facilities.split(",") : room.facilities;

  // If images are uploaded, update the picture array
  if (req.files && req.files.length > 0) {
    const pictures = req.files.map((file) => file.filename);
    room.picture = [...room.picture, ...pictures];
  }

  await room.save();

  res.status(200).json({
    success: true,
    message: "Room updated successfully",
    room,
  });
});

const deleteRoom = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const room = await Room.findById(id);
  if (!room) {
    return next(new AppError("Room not found", 404));
  }

  if (room.picture && room.picture.length > 0) {
    room.picture.forEach((fileName) => {
      const filePath = path.join(__dirname, "..", "uploads", fileName);

      fs.unlink(filePath, (err) => {
        if (err) {
          console.log(err);
          return next(new AppError("Error deleting file", 500));
        }
      });
    });
  }

  const data = await Room.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: "Room deleted successfully",
    data,
  });
});

module.exports = {
  getAllRoom,
  getSingleRoom,
  createRoom,
  updateRoom,
  deleteRoom,
};
