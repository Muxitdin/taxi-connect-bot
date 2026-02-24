import { Bot } from "grammy";
import { MyContext, Language } from "../types";
import { User, Order } from "../models";
import { t, getCityName } from "../locales";
import { languageKeyboard, phoneKeyboard, mainMenuKeyboard, declineOrderKeyboard, acceptOrderKeyboard } from "../keyboards";

export async function handleStart(
  ctx: MyContext,
  bot: Bot<MyContext>,
  driversGroupId: string,
  botUsername: string
) {
  const telegramId = ctx.from?.id;

  if (!telegramId) {
    return;
  }

  // Check for deep link parameter (accept_ORDERID)
  const text = ctx.message?.text || "";
  const match = text.match(/\/start accept_(\w+)/);

  if (match) {
    const orderId = match[1];
    await handleAcceptOrderFromDeepLink(ctx, bot, driversGroupId, botUsername, orderId);
    return;
  }

  // Normal /start flow
  const existingUser = await User.findOne({ telegramId });

  if (existingUser) {
    // User already registered - auto authenticate
    ctx.session.language = existingUser.language;
    ctx.session.step = "main_menu";

    await ctx.reply(t(existingUser.language, "welcomeBack"), {
      reply_markup: mainMenuKeyboard(existingUser.language),
    });
    return;
  }

  // New user - start registration
  ctx.session.step = "select_language";
  ctx.session.language = "uz"; // Default language

  await ctx.reply(t("uz", "welcome"));
  await ctx.reply(t("uz", "selectLanguage"), {
    reply_markup: languageKeyboard(),
  });
}

async function handleAcceptOrderFromDeepLink(
  ctx: MyContext,
  bot: Bot<MyContext>,
  driversGroupId: string,
  botUsername: string,
  orderId: string
) {
  const driverId = ctx.from?.id;

  if (!driverId) return;

  // Find the order
  const order = await Order.findOne({ orderId });

  if (!order) {
    const lang = ctx.session.language || "uz";
    await ctx.reply(t(lang, "orderNotFound"));
    return;
  }

  // Check if already accepted
  if (order.status === "accepted") {
    const lang = ctx.session.language || "uz";
    await ctx.reply(t(lang, "orderAlreadyAccepted"));

    // Show main menu
    const user = await User.findOne({ telegramId: driverId });
    if (user) {
      await ctx.reply(t(user.language, "mainMenu"), {
        reply_markup: mainMenuKeyboard(user.language),
      });
    }
    return;
  }

  // Update order status
  order.status = "accepted";
  order.driverId = driverId;
  await order.save();

  // Remove the accept button from group message
  try {
    if (order.groupMessageId) {
      const updatedGroupMessage = `
🚕 ${t("uz", "newOrder")} / ${t("ru", "newOrder")} #${orderId}

${t("uz", "from")} / ${t("ru", "from")}: ${getCityName("uz", order.from)} / ${getCityName("ru", order.from)}
${t("uz", "to")} / ${t("ru", "to")}: ${getCityName("uz", order.to)} / ${getCityName("ru", order.to)}
${t("uz", "time")} / ${t("ru", "time")}: ${order.time}
${t("uz", "passengers")} / ${t("ru", "passengers")}: ${order.passengers}
${order.comment ? `${t("uz", "comment")} / ${t("ru", "comment")}: ${order.comment}` : ""}

✅ ${t("uz", "statusAccepted")} / ${t("ru", "statusAccepted")}
      `.trim();

      await bot.api.editMessageText(driversGroupId, order.groupMessageId, updatedGroupMessage);
    }
  } catch (error) {
    console.error("Error updating group message:", error);
  }

  // Get or determine driver's language
  let driverLang: Language = "uz";
  const driver = await User.findOne({ telegramId: driverId });
  if (driver) {
    driverLang = driver.language;
    ctx.session.language = driver.language;
  }

  // Send confirmation
  await ctx.reply(t(driverLang, "orderAcceptedDriver"));

  // Send order details to driver
  const orderDetails = `
📋 ${t(driverLang, "orderInfo")} #${orderId}

${t(driverLang, "from")}: ${getCityName(driverLang, order.from)}
${t(driverLang, "to")}: ${getCityName(driverLang, order.to)}
${t(driverLang, "time")}: ${order.time}
${t(driverLang, "passengers")}: ${order.passengers}
${order.comment ? `${t(driverLang, "comment")}: ${order.comment}` : ""}

📞 ${t(driverLang, "passengerPhone")}: ${order.passengerPhone}
  `.trim();

  await ctx.reply(orderDetails, {
    reply_markup: declineOrderKeyboard(driverLang, orderId),
  });

  await ctx.reply(t(driverLang, "contactPassenger"));

  // Notify passenger that order was accepted
  try {
    const passenger = await User.findOne({ telegramId: order.passengerId });
    const passengerLang = passenger?.language || "uz";

    await bot.api.sendMessage(order.passengerId, t(passengerLang, "orderAccepted"));
  } catch (error) {
    console.error("Error notifying passenger:", error);
  }
}

export async function handleLanguageSelection(ctx: MyContext) {
  const callbackData = ctx.callbackQuery?.data;

  if (!callbackData) return;

  const lang = callbackData.replace("lang_", "") as Language;
  ctx.session.language = lang;

  await ctx.answerCallbackQuery();
  await ctx.editMessageText(t(lang, "languageSelected"));

  // Check if this is during registration or language change
  const telegramId = ctx.from?.id;
  const existingUser = await User.findOne({ telegramId });

  if (existingUser) {
    // User is changing language
    existingUser.language = lang;
    await existingUser.save();

    ctx.session.step = "main_menu";
    await ctx.reply(t(lang, "languageChanged"), {
      reply_markup: mainMenuKeyboard(lang),
    });
  } else {
    // New user registration - ask for phone
    ctx.session.step = "share_phone";
    await ctx.reply(t(lang, "sharePhone"), {
      reply_markup: phoneKeyboard(lang),
    });
  }
}

export async function handlePhoneShare(ctx: MyContext) {
  const contact = ctx.message?.contact;
  const lang = ctx.session.language || "uz";

  if (!contact || !ctx.from) {
    await ctx.reply(t(lang, "sharePhone"), {
      reply_markup: phoneKeyboard(lang),
    });
    return;
  }

  // Create new user
  const newUser = new User({
    telegramId: ctx.from.id,
    username: ctx.from.username,
    firstName: ctx.from.first_name,
    lastName: ctx.from.last_name,
    phone: contact.phone_number,
    language: lang,
  });

  await newUser.save();

  ctx.session.step = "main_menu";

  await ctx.reply(t(lang, "registrationComplete"), {
    reply_markup: mainMenuKeyboard(lang),
  });
}

export async function handleChangeLanguage(ctx: MyContext) {
  const lang = ctx.session.language || "uz";

  await ctx.reply(t(lang, "selectLanguage"), {
    reply_markup: languageKeyboard(),
  });
}
