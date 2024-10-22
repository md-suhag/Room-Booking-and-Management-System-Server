const express = require("express");
const {
  createRoom,
  updateRoom,
  deleteRoom,
  getAllRoom,
  getSingleRoom,
} = require("../controllers/room.controller");
const upload = require("../config/multer");
const { authenticateJWT, authorizeRoles } = require("../middlewares/auth");

const roomRouter = express.Router();

roomRouter.get("/", getAllRoom);
roomRouter.get("/:id", getSingleRoom);
roomRouter.post(
  "/create",
  authenticateJWT,
  authorizeRoles(["admin"]),
  upload.array("pictures", 5),
  createRoom
);
roomRouter.put(
  "/:id",
  authenticateJWT,
  authorizeRoles(["admin"]),
  upload.array("pictures", 5),
  updateRoom
);
roomRouter.delete(
  "/:id",
  authenticateJWT,
  authorizeRoles(["admin"]),
  deleteRoom
);
module.exports = roomRouter;
