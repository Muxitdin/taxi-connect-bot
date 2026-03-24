import mongoose, { Schema, Document } from "mongoose";
import { IOrder } from "../types";

export interface IOrderDocument extends IOrder, Document {}

const OrderSchema = new Schema<IOrderDocument>(
  {
    orderId: { type: String, required: true, unique: true },
    passengerId: { type: Number, required: true },
    passengerPhone: { type: String, required: true },
    driverId: { type: Number },
    from: { type: String, required: true },
    to: { type: String, required: true },
    day: { type: String, required: true },
    time: { type: String, required: true },
    passengers: { type: Number, required: true },
    comment: { type: String },
    status: {
      type: String,
      enum: ["pending", "accepted", "completed", "cancelled"],
      default: "pending",
    },
    groupMessageId: { type: Number },
  },
  { timestamps: true }
);

export const Order = mongoose.model<IOrderDocument>("Order", OrderSchema);
