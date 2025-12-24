import User from "./user.model.js";
import userService from "./user.services.js";
import { successResponse, errorResponse } from "../../utils/response.js";

class UserController {

    async getAllUsers(req, res, next) {
        try {
            const users = await User.find();
            res.status(200).json({
                success: true,
                data: users,
            });
        } catch (err) {
            next(err);
        }
    }

    async uploadAvatar(req, res, next) {
        try {
            if (!req.file) {
                return errorResponse(res, "No file uploaded", 400);
            }
            const result = await userService.uploadAvatar(req.user.id, req.file);
            return successResponse(res, result.data, result.message, 200);
        } catch (error) {
            next(error);
        }
    }
}

export default new UserController();