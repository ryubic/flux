import mongoose, { Schema } from "mongoose";
import { SUPPORTED_CURRENCIES } from "../constants.js";

const organizationSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      unique: true,
      index: true,
      set: (v) => v.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()),
    },
    address: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      validate: {
        validator: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
        message: "Invalid email format",
      },
    },
    phone: {
      type: String,
      trim: true,
      validate: {
        validator: (v) => /^[0-9+\-()\s]{6,20}$/.test(v),
        message: "Invalid phone number format",
      },
    },
    taxNumber: {
      type: String,
      trim: true,
      default: null,
    },
    logoUrl: {
      type: String,
      trim: true,
      validate: {
        validator: (v) => !v || /^https?:\/\/.+/.test(v),
        message: "Invalid URL",
      },
    },
    invoicePrefix: {
      type: String,
      trim: true,
      uppercase: true,
      default: "INV",
    },
    currency: {
      type: String,
      trim: true,
      uppercase: true,
      default: "USD",
      enum: SUPPORTED_CURRENCIES,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
  },
  { timestamps: true }
);

organizationSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

organizationSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

export const Organization = mongoose.model("Organization", organizationSchema);
