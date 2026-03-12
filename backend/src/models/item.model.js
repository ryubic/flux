import mongoose, { Schema } from "mongoose";

const itemSchema = new Schema(
  {
    name: {
      type: String,
      require: true,
      trim: true,
      unique: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    unit: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
  },
  { timestamps: true }
);

itemSchema.pre("save", function () {
  if (this.name) {
    const normalized = this.name.trim().toLowerCase();
    this.name = normalized.charAt(0).toUpperCase() + normalized.slice(1);
  }
});

export const Items = mongoose.model("Items", itemSchema);
