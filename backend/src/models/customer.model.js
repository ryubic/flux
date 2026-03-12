import mongoose, { Schema } from "mongoose";

const customerSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    nameLowerCase: {
      type: String,
      required: true,
      trim: true,
      index: true,
      default: this.name.toLowercase()
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      validate: {
        validator: (v) => /^[0-9+\-()\s]{6,20}$/.test(v),
        message: "Invalid phone number format",
      },
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      validate: {
        validator: (v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
        message: "Invalid email format",
      },
    },
    address: {
      type: String,
      trim: true,
    },
    taxNumber: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

export const Customer = mongoose.model("Customer", customerSchema);
