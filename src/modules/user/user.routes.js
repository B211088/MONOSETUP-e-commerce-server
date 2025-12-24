import { Router } from "express";
import userController from "./user.controller.js";
import verifyToken, { authorizeRoles } from "../../middlewares/auth.middlewares.js";
import upload from "../../middlewares/uploads.js";

const router = Router();

router.get("/get-all", verifyToken,  authorizeRoles("admin"), (req, res, next) =>
  userController.getAllUsers(req, res, next)
);

router.post("/upload-avatar", verifyToken, upload.single("avatar"), (req, res, next) =>
  userController.uploadAvatar(req, res, next)
);

export default router;
