import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import { Bot } from "grammy";
import { MyContext } from "./types";
import { createSessionMiddleware } from "./middleware/session";
import { t } from "./locales";
import { mainMenuKeyboard } from "./keyboards";
import { User } from "./models";
import {
  handleStart,
  handleLanguageSelection,
  handlePhoneShare,
  handleChangeLanguage,
  handleOrderTaxi,
  handleFromCity,
  handleToCity,
  handleBackToFrom,
  handleTime,
  handleBackToTo,
  handlePassengers,
  handleBackToTime,
  handleUseMyPhone,
  handleEnterOtherPhone,
  handlePhoneInput,
  handleBackToPassengers,
  handleSkipComment,
  handleCommentInput,
  handleBackToPhone,
  handleConfirmOrder,
  handleCancelOrder,
  handleDeclineOrder,
  handleMyProfile,
  handleMyOrders,
} from "./handlers";

// Environment variables
const BOT_TOKEN = process.env.BOT_TOKEN;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/taxi-connect";
const DRIVERS_GROUP_ID = process.env.DRIVERS_GROUP_ID || "";
const PORT = process.env.PORT || 3000;

if (!BOT_TOKEN) {
  console.error("BOT_TOKEN is required!");
  process.exit(1);
}

if (!DRIVERS_GROUP_ID) {
  console.error("DRIVERS_GROUP_ID is required!");
  process.exit(1);
}

// Create bot instance
const bot = new Bot<MyContext>(BOT_TOKEN);

// Bot username (will be set after bot starts)
let botUsername = "";

// Add session middleware
bot.use(createSessionMiddleware());

// Command handlers - /start with deep link support
bot.command("start", (ctx) => handleStart(ctx, bot, DRIVERS_GROUP_ID, botUsername));

// Callback query handlers
bot.callbackQuery(/^lang_(uz|ru)$/, handleLanguageSelection);

// Order flow callbacks
bot.callbackQuery(/^from_/, handleFromCity);
bot.callbackQuery(/^to_/, handleToCity);
bot.callbackQuery("back_to_from", handleBackToFrom);
bot.callbackQuery(/^time_/, handleTime);
bot.callbackQuery("back_to_to", handleBackToTo);
bot.callbackQuery(/^passengers_/, handlePassengers);
bot.callbackQuery("back_to_time", handleBackToTime);
bot.callbackQuery("use_my_phone", handleUseMyPhone);
bot.callbackQuery("enter_other_phone", handleEnterOtherPhone);
bot.callbackQuery("back_to_passengers", handleBackToPassengers);
bot.callbackQuery("skip_comment", handleSkipComment);
bot.callbackQuery("back_to_phone", handleBackToPhone);
bot.callbackQuery("confirm_order", (ctx) => handleConfirmOrder(ctx, bot, DRIVERS_GROUP_ID, botUsername));
bot.callbackQuery("cancel_order", handleCancelOrder);

// Driver callbacks - decline order (accept is handled via deep link in /start)
bot.callbackQuery(/^decline_/, (ctx) => handleDeclineOrder(ctx, bot, DRIVERS_GROUP_ID, botUsername));

// Contact handler for phone registration
bot.on("message:contact", handlePhoneShare);

// Text message handler
bot.on("message:text", async (ctx) => {
  const text = ctx.message.text;
  const lang = ctx.session.language || "uz";
  const step = ctx.session.step;

  // Check if user is registered
  const telegramId = ctx.from?.id;
  if (telegramId) {
    const user = await User.findOne({ telegramId });
    if (user && !ctx.session.language) {
      ctx.session.language = user.language;
    }
  }

  // Main menu buttons
  if (text === t(lang, "orderTaxi") || text === t("uz", "orderTaxi") || text === t("ru", "orderTaxi")) {
    await handleOrderTaxi(ctx);
    return;
  }

  if (text === t(lang, "myOrders") || text === t("uz", "myOrders") || text === t("ru", "myOrders")) {
    await handleMyOrders(ctx);
    return;
  }

  if (text === t(lang, "myProfile") || text === t("uz", "myProfile") || text === t("ru", "myProfile")) {
    await handleMyProfile(ctx);
    return;
  }

  if (text === t(lang, "changeLanguage") || text === t("uz", "changeLanguage") || text === t("ru", "changeLanguage")) {
    await handleChangeLanguage(ctx);
    return;
  }

  // Handle phone input during order flow
  if (step === "enter_phone_manually") {
    await handlePhoneInput(ctx);
    return;
  }

  // Handle comment input during order flow
  if (step === "add_comment") {
    await handleCommentInput(ctx);
    return;
  }

  // Default: show main menu if user is registered
  if (telegramId) {
    const user = await User.findOne({ telegramId });
    if (user) {
      await ctx.reply(t(user.language, "mainMenu"), {
        reply_markup: mainMenuKeyboard(user.language),
      });
    }
  }
});

// Error handler
bot.catch((err) => {
  console.error("Bot error:", err);
});

// Express server for health check
const app = express();

app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Taxi Connect Bot is running" });
});

app.get("/health", (req, res) => {
  res.json({ status: "healthy" });
});

// Start the bot and server
async function main() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Start Express server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

    // Get bot info to get username
    const botInfo = await bot.api.getMe();
    botUsername = botInfo.username;
    console.log(`Bot username: @${botUsername}`);

    // Start bot
    console.log("Starting bot...");
    await bot.start({
      onStart: (info) => {
        console.log(`Bot @${info.username} is running!`);
      },
    });
  } catch (error) {
    console.error("Failed to start:", error);
    process.exit(1);
  }
}

main();
