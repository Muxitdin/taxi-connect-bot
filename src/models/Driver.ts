import mongoose, { Schema, Document } from "mongoose";

export interface IDriver {
  telegramId: number;
  totalOrdersToday: number;
  lastOrderDate: Date;
}

export interface IDriverDocument extends IDriver, Document {}

const DriverSchema = new Schema<IDriverDocument>(
  {
    telegramId: { type: Number, required: true, unique: true },
    totalOrdersToday: { type: Number, default: 0 },
    lastOrderDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Driver = mongoose.model<IDriverDocument>("Driver", DriverSchema);
