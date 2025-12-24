import jwt from "jsonwebtoken";
import { successResponse } from "../../utils/response.js";
import { auth } from "../../configs/firebase-admin.config.js";
import { JWT_SECRET } from "../../configs/index.js";
import User from "../user/user.model.js";
import authService from "./auth.service.js";

class AuthControler {
  async register(req, res, next) {
    try {
      console.log(req.body);
      const user = await authService.register(req.body);
      return successResponse(res, user, "Register Account Successfully!", 201);
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const data = await authService.login(req.body);
      res.cookie("token", data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000,
      });

      return successResponse(res, data.user, "Login Successfully!", 200);
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });
      return successResponse(res, null, "Logout successful");
    } catch (err) {
      next(err);
    }
  }

   async googleLogin(req, res, next) {
    try {
      const { idToken } = req.body;


      if (!idToken) {
        return res.status(400).json({
          success: false,
          message: "Google ID Token là bắt buộc",
        });
      }

      const decodedToken = await auth.verifyIdToken(idToken);
     

   
      if (decodedToken.firebase.sign_in_provider !== "google.com") {
        return res.status(400).json({
          success: false,
          message: "Token không phải từ Google Sign-In",
        });
      }

 
      let user = await User.findOne({ email: decodedToken.email });

      if (!user) {
   
        user = await User.create({
          email: decodedToken.email,
          name: decodedToken.name,
          avatar: { url: decodedToken.picture },
          provider: "google",
          firebaseUid: decodedToken.uid,
          emailVerified: decodedToken.email_verified,
        });
      } else {
       
        user.name = decodedToken.name;
        user.avatar = { url: decodedToken.picture };
        user.emailVerified = decodedToken.email_verified;
        user.lastLogin = new Date();
        
        if (user.provider === "local") {
          user.provider = "google";
          user.firebaseUid = decodedToken.uid;
        }
        
        await user.save();
      }

      const token = jwt.sign(
        { 
          id: user._id, 
          email: user.email,
          provider: "google" 
        },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

     
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({
        success: true,
        message: "Đăng nhập Google thành công",
        data: {
          user: {
            id: user._id,
            email: user.email,
            name: user.name,
            avatar: user.avatar,
            provider: "google",

          },
        },
      });
    } catch (error) {
      console.error("Google login error:", error);
      res.status(401).json({
        success: false,
        message: error.message || "Đăng nhập Google thất bại",
      });
    }
  }

}

export default new AuthControler();
