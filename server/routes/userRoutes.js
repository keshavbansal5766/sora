import express from "express";
import {
  acceptConnectionRequest,
  connectDatabse,
  discoveredUsers,
  followUser,
  getUserConnections,
  getUserData,
  sendConnectionRequest,
  unFollowUser,
  updateUserData,
} from "../controllers/userController.js";
import { protect } from "../middlewares/auth.js";
import { upload } from "../configs/multer.js";

const userRouter = express.Router();
userRouter.post("/text-save", connectDatabse)
userRouter.get("/data", protect, getUserData);
userRouter.post(
  "/update",
  upload.fields([
    { name: "profile", maxCount: 1 },
    { name: "cover", maxCount: 1 },
  ]),
  protect,
  updateUserData,
);
userRouter.post("/discover", protect, discoveredUsers);
userRouter.post("/follow", protect, followUser);
userRouter.post("/unfollow", protect, unFollowUser);
userRouter.post("/connect", protect, sendConnectionRequest);
userRouter.post("/accept", protect, acceptConnectionRequest);
userRouter.post("/connections", protect, getUserConnections);

export default userRouter;
