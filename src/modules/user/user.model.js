import mongoose from "mongoose";
import argon2 from "argon2";
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name must be at most 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    passwordHash: {
      type: String,
      required: function () {
        return this.provider === "local";
      },
    },
    roles: {
      type: [String],
      enum: ["user", "admin"],
      default: ["user"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    avatar: {
      url: {
        type: String,
        default: null,
      },
      publicId: {
        type: String,
        default: null,
      },
    },
    provider: {
      type: String,
      enum: ["local", "google"],
      required: true,
    },
    firebaseUid: {
      type: String,
      default: null,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function () {
  if (this.provider !== 'local') return;
  if (!this.isModified('passwordHash')) return;
  if (!this.passwordHash) return;

  this.passwordHash = await argon2.hash(this.passwordHash);
});
userSchema.methods.isValidPassword = async function (password) {
  return await argon2.verify(this.passwordHash, password);
};
userSchema.set("toJSON", {
  transform: (doc, ret, options) => {
    delete ret.passwordHash;
    return ret;
  },
});
const User = mongoose.model("User", userSchema);

export default User;
