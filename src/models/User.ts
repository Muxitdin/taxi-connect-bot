import mongoose, { Schema, Document } from "mongoose";
import { IUser, Language } from "../types";

export interface IUserDocument extends IUser, Document {}

const UserSchema = new Schema<IUserDocument>(
  {
    telegramId: { type: Number, required: true, unique: true },
    username: { type: String },
    firstName: { type: String },
    lastName: { type: String },
    phone: { type: String, required: true },
    language: { type: String, enum: ["uz", "ru"], default: "uz" },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUserDocument>("User", UserSchema);
