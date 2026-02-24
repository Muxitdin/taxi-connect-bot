import { Bot } from "grammy";
import { MyContext, Language } from "../types";
import { User, Order } from "../models";
import { t, getCityName } from "../locales";
import { declineOrderKeyboard, acceptOrderKeyboard, mainMenuKeyboard } from "../keyboards";

export async function handleDeclineOrder(
  ctx: MyContext,
  bot: Bot<MyContext>,
  driversGroupId: string,
  botUsername: string
) {
  const callbackData = ctx.callbackQuery?.data;
  const driverId = ctx.from?.id;

  if (!callbackData || !driverId) return;

  const orderId = callbackData.replace("decline_", "");

  // Find the order
  const order = await Order.findOne({ orderId });

  if (!order) {
    await ctx.answerCallbackQuery({
      text: t("uz", "orderNotFound"),
      show_alert: true,
    });
    return;
  }

  // Check if this driver accepted the order
  if (order.driverId !== driverId) {
    await ctx.answerCallbackQuery({
      text: "Access denied",
      show_alert: true,
    });
    return;
  }

  // Reset order status to pending
  order.status = "pending";
  order.driverId = undefined;
  await order.save();

  // Get driver's language
  let driverLang: Language = "uz";
  const driver = await User.findOne({ telegramId: driverId });
  if (driver) {
    driverLang = driver.language;
  }

  await ctx.answerCallbackQuery();
  await ctx.editMessageText(t(driverLang, "orderDeclined"));

  // Restore the accept button in group message
  try {
    if (order.groupMessageId) {
      const restoredGroupMessage = `
🚕 ${t("uz", "newOrder")} / ${t("ru", "newOrder")} #${orderId}

${t("uz", "from")} / ${t("ru", "from")}: ${getCityName("uz", order.from)} / ${getCityName("ru", order.from)}
${t("uz", "to")} / ${t("ru", "to")}: ${getCityName("uz", order.to)} / ${getCityName("ru", order.to)}
${t("uz", "time")} / ${t("ru", "time")}: ${order.time}
${t("uz", "passengers")} / ${t("ru", "passengers")}: ${order.passengers}
${order.comment ? `${t("uz", "comment")} / ${t("ru", "comment")}: ${order.comment}` : ""}
      `.trim();

      await bot.api.editMessageText(driversGroupId, order.groupMessageId, restoredGroupMessage, {
        reply_markup: acceptOrderKeyboard(orderId, botUsername),
      });
    }
  } catch (error) {
    console.error("Error restoring group message:", error);
  }
}
