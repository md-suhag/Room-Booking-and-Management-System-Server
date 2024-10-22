const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    rent: {
      type: Number,
      required: true,
    },
    facilities: {
      type: [String],
      required: true,
    },
    picture: {
      type: [String],
      required: true,
    },
  },
  { timestamps: true }
);

const Room = mongoose.model("Room", roomSchema);

module.exports = Room;
