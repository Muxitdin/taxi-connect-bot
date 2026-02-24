import { Bot } from "grammy";
import { MyContext } from "../types";
import { User, Order } from "../models";
import { t, getCityName } from "../locales";
import {
  fromCitiesKeyboard,
  toCitiesKeyboard,
  timeKeyboard,
  passengersKeyboard,
  phoneSelectionKeyboard,
  commentKeyboard,
  confirmOrderKeyboard,
  acceptOrderKeyboard,
  mainMenuKeyboard,
} from "../keyboards";
import { generateOrderId, isValidPhone, formatPhone } from "../utils";

export async function handleOrderTaxi(ctx: MyContext) {
  const lang = ctx.session.language || "uz";

  ctx.session.step = "select_from";
  ctx.session.orderData = {};

  await ctx.reply(t(lang, "selectFrom"), {
    reply_markup: fromCitiesKeyboard(lang),
  });
}

export async function handleFromCity(ctx: MyContext) {
  const lang = ctx.session.language || "uz";
  const callbackData = ctx.callbackQuery?.data;

  if (!callbackData) return;

  const city = callbackData.replace("from_", "");
  ctx.session.orderData = ctx.session.orderData || {};
  ctx.session.orderData.from = city;
  ctx.session.step = "select_to";

  await ctx.answerCallbackQuery();
  await ctx.editMessageText(t(lang, "selectTo"), {
    reply_markup: toCitiesKeyboard(lang, city),
  });
}

export async function handleToCity(ctx: MyContext) {
  const lang = ctx.session.language || "uz";
  const callbackData = ctx.callbackQuery?.data;

  if (!callbackData) return;

  const city = callbackData.replace("to_", "");
  ctx.session.orderData = ctx.session.orderData || {};
  ctx.session.orderData.to = city;
  ctx.session.step = "select_time";

  await ctx.answerCallbackQuery();
  await ctx.editMessageText(t(lang, "selectTime"), {
    reply_markup: timeKeyboard(lang),
  });
}

export async function handleBackToFrom(ctx: MyContext) {
  const lang = ctx.session.language || "uz";

  ctx.session.step = "select_from";

  await ctx.answerCallbackQuery();
  await ctx.editMessageText(t(lang, "selectFrom"), {
    reply_markup: fromCitiesKeyboard(lang),
  });
}

export async function handleTime(ctx: MyContext) {
  const lang = ctx.session.language || "uz";
  const callbackData = ctx.callbackQuery?.data;

  if (!callbackData) return;

  const time = callbackData.replace("time_", "");
  ctx.session.orderData = ctx.session.orderData || {};
  ctx.session.orderData.time = time;
  ctx.session.step = "select_passengers";

  await ctx.answerCallbackQuery();
  await ctx.editMessageText(t(lang, "selectPassengers"), {
    reply_markup: passengersKeyboard(lang),
  });
}

export async function handleBackToTo(ctx: MyContext) {
  const lang = ctx.session.language || "uz";
  const fromCity = ctx.session.orderData?.from || "tashkent";

  ctx.session.step = "select_to";

  await ctx.answerCallbackQuery();
  await ctx.editMessageText(t(lang, "selectTo"), {
    reply_markup: toCitiesKeyboard(lang, fromCity),
  });
}

export async function handlePassengers(ctx: MyContext) {
  const lang = ctx.session.language || "uz";
  const callbackData = ctx.callbackQuery?.data;
  const telegramId = ctx.from?.id;

  if (!callbackData || !telegramId) return;

  const passengers = parseInt(callbackData.replace("passengers_", ""));
  ctx.session.orderData = ctx.session.orderData || {};
  ctx.session.orderData.passengers = passengers;
  ctx.session.step = "select_phone";

  // Get user's registered phone
  const user = await User.findOne({ telegramId });
  const userPhone = user?.phone || "";

  await ctx.answerCallbackQuery();
  await ctx.editMessageText(t(lang, "selectPhone"), {
    reply_markup: phoneSelectionKeyboard(lang, userPhone),
  });
}

export async function handleBackToTime(ctx: MyContext) {
  const lang = ctx.session.language || "uz";

  ctx.session.step = "select_time";

  await ctx.answerCallbackQuery();
  await ctx.editMessageText(t(lang, "selectTime"), {
    reply_markup: timeKeyboard(lang),
  });
}

export async function handleUseMyPhone(ctx: MyContext) {
  const lang = ctx.session.language || "uz";
  const telegramId = ctx.from?.id;

  if (!telegramId) return;

  const user = await User.findOne({ telegramId });
  if (!user) return;

  ctx.session.orderData = ctx.session.orderData || {};
  ctx.session.orderData.phone = user.phone;
  ctx.session.step = "add_comment";

  await ctx.answerCallbackQuery();
  await ctx.editMessageText(t(lang, "addComment"), {
    reply_markup: commentKeyboard(lang),
  });
}

export async function handleEnterOtherPhone(ctx: MyContext) {
  const lang = ctx.session.language || "uz";

  ctx.session.step = "enter_phone_manually";

  await ctx.answerCallbackQuery();
  await ctx.editMessageText(t(lang, "enterPhoneManually"));
}

export async function handlePhoneInput(ctx: MyContext) {
  const lang = ctx.session.language || "uz";
  const text = ctx.message?.text;

  if (!text) return;

  if (!isValidPhone(text)) {
    await ctx.reply(t(lang, "invalidPhone"));
    return;
  }

  ctx.session.orderData = ctx.session.orderData || {};
  ctx.session.orderData.phone = formatPhone(text);
  ctx.session.step = "add_comment";

  await ctx.reply(t(lang, "addComment"), {
    reply_markup: commentKeyboard(lang),
  });
}

export async function handleBackToPassengers(ctx: MyContext) {
  const lang = ctx.session.language || "uz";

  ctx.session.step = "select_passengers";

  await ctx.answerCallbackQuery();
  await ctx.editMessageText(t(lang, "selectPassengers"), {
    reply_markup: passengersKeyboard(lang),
  });
}

export async function handleSkipComment(ctx: MyContext) {
  const lang = ctx.session.language || "uz";

  ctx.session.orderData = ctx.session.orderData || {};
  ctx.session.orderData.comment = undefined;
  ctx.session.step = "confirm_order";

  await ctx.answerCallbackQuery();
  await showOrderSummary(ctx);
}

export async function handleCommentInput(ctx: MyContext) {
  const lang = ctx.session.language || "uz";
  const text = ctx.message?.text;

  if (!text) return;

  ctx.session.orderData = ctx.session.orderData || {};
  ctx.session.orderData.comment = text;
  ctx.session.step = "confirm_order";

  await showOrderSummary(ctx);
}

export async function handleBackToPhone(ctx: MyContext) {
  const lang = ctx.session.language || "uz";
  const telegramId = ctx.from?.id;

  if (!telegramId) return;

  const user = await User.findOne({ telegramId });
  const userPhone = user?.phone || "";

  ctx.session.step = "select_phone";

  await ctx.answerCallbackQuery();
  await ctx.editMessageText(t(lang, "selectPhone"), {
    reply_markup: phoneSelectionKeyboard(lang, userPhone),
  });
}

async function showOrderSummary(ctx: MyContext) {
  const lang = ctx.session.language || "uz";
  const orderData = ctx.session.orderData;

  if (!orderData) return;

  const summary = `
${t(lang, "orderSummary")}

${t(lang, "from")}: ${getCityName(lang, orderData.from || "")}
${t(lang, "to")}: ${getCityName(lang, orderData.to || "")}
${t(lang, "time")}: ${orderData.time}
${t(lang, "passengers")}: ${orderData.passengers}
${t(lang, "phone")}: ${orderData.phone}
${t(lang, "comment")}: ${orderData.comment || t(lang, "noComment")}
  `.trim();

  await ctx.reply(summary, {
    reply_markup: confirmOrderKeyboard(lang),
  });
}

export async function handleConfirmOrder(
  ctx: MyContext,
  bot: Bot<MyContext>,
  driversGroupId: string,
  botUsername: string
) {
  const lang = ctx.session.language || "uz";
  const orderData = ctx.session.orderData;
  const telegramId = ctx.from?.id;

  if (!orderData || !telegramId) return;

  const orderId = generateOrderId();

  // Create order in database
  const newOrder = new Order({
    orderId,
    passengerId: telegramId,
    passengerPhone: orderData.phone,
    from: orderData.from,
    to: orderData.to,
    time: orderData.time,
    passengers: orderData.passengers,
    comment: orderData.comment,
    status: "pending",
  });

  await newOrder.save();

  // Send order to drivers group
  const groupMessage = `
🚕 ${t("uz", "newOrder")} / ${t("ru", "newOrder")} #${orderId}

${t("uz", "from")} / ${t("ru", "from")}: ${getCityName("uz", orderData.from || "")} / ${getCityName("ru", orderData.from || "")}
${t("uz", "to")} / ${t("ru", "to")}: ${getCityName("uz", orderData.to || "")} / ${getCityName("ru", orderData.to || "")}
${t("uz", "time")} / ${t("ru", "time")}: ${orderData.time}
${t("uz", "passengers")} / ${t("ru", "passengers")}: ${orderData.passengers}
${orderData.comment ? `${t("uz", "comment")} / ${t("ru", "comment")}: ${orderData.comment}` : ""}
  `.trim();

  try {
    const sentMessage = await bot.api.sendMessage(driversGroupId, groupMessage, {
      reply_markup: acceptOrderKeyboard(orderId, botUsername),
    });

    // Save group message ID
    newOrder.groupMessageId = sentMessage.message_id;
    await newOrder.save();

    await ctx.answerCallbackQuery();
    await ctx.editMessageText(t(lang, "orderCreated"));

    // Reset session and show main menu
    ctx.session.step = "main_menu";
    ctx.session.orderData = {};

    await ctx.reply(t(lang, "mainMenu"), {
      reply_markup: mainMenuKeyboard(lang),
    });
  } catch (error) {
    console.error("Error sending message to drivers group:", error);
    await ctx.answerCallbackQuery();
    await ctx.reply(t(lang, "error"));
  }
}

export async function handleCancelOrder(ctx: MyContext) {
  const lang = ctx.session.language || "uz";

  ctx.session.step = "main_menu";
  ctx.session.orderData = {};

  await ctx.answerCallbackQuery();
  await ctx.editMessageText(t(lang, "orderCancelled"));

  await ctx.reply(t(lang, "mainMenu"), {
    reply_markup: mainMenuKeyboard(lang),
  });
}
