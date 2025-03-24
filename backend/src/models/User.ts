import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcrypt";
import validator from "validator";

export interface IUser {
  email: string;
  name?: string;
  password: string;
  role: "user" | "admin";
  apiKey?: string;
  active: boolean;
  lastLogin?: Date;
  passwordChangedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserDocument extends IUser, Document {
  comparePassword(candidatePassword: string): Promise<boolean>;
  isModified(path: string): boolean;
  isNew: boolean;
}

// Export User type for backward compatibility
export type User = UserDocument;

const UserSchema = new Schema<UserDocument>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: (value: string) => validator.isEmail(value),
        message: "Invalid email format",
      },
      index: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters long"],
      validate: {
        validator: (value) => {
          // At least one uppercase, one lowercase, and one number (special characters optional)
          const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
          return passwordRegex.test(value);
        },
        message:
          "Password must contain at least one uppercase letter, one lowercase letter, and one number",
      },
    },
    name: {
      type: String,
      trim: true,
      maxlength: [50, "Name cannot be more than 50 characters"],
    },
    role: {
      type: String,
      enum: {
        values: ["admin", "user"],
        message: "{VALUE} is not a valid role",
      },
      default: "user",
    },
    apiKey: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
    passwordChangedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Hash password before saving
UserSchema.pre<UserDocument>("save", async function (next) {
  try {
    console.log("User model pre-save hook: Checking password modification");
    if (!this.isModified("password")) {
      console.log(
        "User model pre-save hook: Password not modified, skipping hash"
      );
      return next();
    }

    console.log(
      "User model pre-save hook: Generating salt and hashing password"
    );
    // Generate salt and hash password
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);

    // Update passwordChangedAt if password is modified
    if (this.isModified("password") && !this.isNew) {
      this.passwordChangedAt = new Date();
    }

    console.log("User model pre-save hook: Password hashed successfully");
    next();
  } catch (error) {
    console.error("User model pre-save hook error:", error);
    next(error instanceof Error ? error : new Error("Password hashing failed"));
  }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error("Password comparison failed");
  }
};

// Static method to find by API key
UserSchema.statics.findByApiKey = function (apiKey: string) {
  return this.findOne({ apiKey, active: true });
};

// Static method to find by email
UserSchema.statics.findByEmail = function (email: string) {
  return this.findOne({ email, active: true });
};

export default mongoose.model<UserDocument>("User", UserSchema);
