import { Context, SessionFlavor } from "grammy";

export type Language = "uz" | "ru";

export type OrderStatus = "pending" | "accepted" | "completed" | "cancelled";

export interface SessionData {
  step?: string;
  language?: Language;
  orderData?: {
    from?: string;
    to?: string;
    day?: string;
    time?: string;
    passengers?: number;
    phone?: string;
    comment?: string;
  };
}

export type MyContext = Context & SessionFlavor<SessionData>;

export interface IUser {
  telegramId: number;
  username?: string;
  firstName?: string;
  lastName?: string;
  phone: string;
  language: Language;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOrder {
  orderId: string;
  passengerId: number;
  passengerPhone: string;
  driverId?: number;
  from: string;
  to: string;
  day: string;
  time: string;
  passengers: number;
  comment?: string;
  status: OrderStatus;
  groupMessageId?: number;
  createdAt: Date;
  updatedAt: Date;
}
