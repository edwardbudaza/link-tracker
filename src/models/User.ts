import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcrypt";

export interface User extends Document {
  email: string;
  password: string;
  name?: string;
  role: "admin" | "user";
  apiKey?: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<User>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    apiKey: {
      type: String,
      unique: true,
      sparse: true,
    },
  },
  { timestamps: true }
);

//Hash password before saving
UserSchema.pre<User>("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next;
  } catch (error: any) {
    next(error);
  }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<User>("User", UserSchema);
