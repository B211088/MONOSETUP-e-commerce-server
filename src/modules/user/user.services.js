import { uploadToCloudinary, deleteFromCloudinary } from "../../utils/cloudinary.util.js";
import User from "./user.model.js";

class UserService {
  async uploadAvatar(userId, file) {
    try {
      if (!file) {
        throw new Error("No file uploaded");
      }
      const user = await User.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }
    
      if (user.avatar?.publicId) {
        await deleteFromCloudinary(user.avatar.publicId);
      }

    
      const result = await uploadToCloudinary(file, "avatars");
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          avatar: {
            url: result.secure_url,
            publicId: result.public_id,
          },
        },
        { new: true }
      );

      return {
        success: true,
        data: updatedUser,
        message: "Avatar uploaded successfully",
      };
    } catch (error) {
      throw error;
    }
  }
}

export default new UserService();
