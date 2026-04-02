import mongoose, { Schema } from "mongoose";

const invoiceSchema = new Schema({
  invoiceNumber: {
    type: String,
    required: true,
    trim: true,
  },
  customer: {
    type: Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
  },
  items: [
    {
      item: {
        type: Schema.Types.ObjectId,
        ref: "Items",
      },
      quantity: {
        type: Number,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
    },
  ],
  subtotal: {
    type: Number,
    required: true,
    min: 0,
  },
  tax: {
    type: Number,
    required: true,
    min: 0,
  },
  discount: {
    type: Number,
    required: true,
    min: 0,
  },
  total: {
    type: Number,
    required: true,
    min: 0,
  },
});

export const Invoice = mongoose.model("Invoice", invoiceSchema)