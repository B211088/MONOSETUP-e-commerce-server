import { throwError } from "../../utils/error.js";
import jwt from "jsonwebtoken";
import User from "../user/user.model.js";
import { JWT_SECRET } from "../../configs/index.js";

class AuthService {
  async register({ name, email, password }) {
    const existing = await User.findOne({ email });
    if (existing) throwError("Email already registered!", 400);

    const user = await User.create({
      name,
      email,
      passwordHash: password,
    });

    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      roles: user.roles,
      provider: "local",
    };
  }

  async login({ email, password }) {
    const user = await User.findOne({ email });
    if (!user) {
      throwError("Invalid email!", 401);
    }

   

    const isValidPassword = await user.isValidPassword(password);
    if (!isValidPassword) throwError("Invalid password!", 401);

    const token = jwt.sign(
      { id: user._id, roles: user.roles },
        JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return {
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        roles: user.roles,
        avatar: user.avatar,
      },
    };
  }
}

export default new AuthService();
