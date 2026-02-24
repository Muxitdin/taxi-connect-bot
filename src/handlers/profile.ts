import { MyContext } from "../types";
import { User, Order } from "../models";
import { t, getCityName, getStatusText } from "../locales";
import { mainMenuKeyboard } from "../keyboards";

export async function handleMyProfile(ctx: MyContext) {
  const lang = ctx.session.language || "uz";
  const telegramId = ctx.from?.id;

  if (!telegramId) return;

  const user = await User.findOne({ telegramId });

  if (!user) {
    await ctx.reply(t(lang, "error"));
    return;
  }

  const profileText = `
📋 ${t(lang, "profileInfo")}

${t(lang, "name")}: ${user.firstName || "-"} ${user.lastName || ""}
${t(lang, "username")}: ${user.username ? "@" + user.username : "-"}
${t(lang, "registeredPhone")}: ${user.phone}
${t(lang, "language")}: ${user.language === "uz" ? "O'zbekcha" : "Русский"}
  `.trim();

  await ctx.reply(profileText, {
    reply_markup: mainMenuKeyboard(lang),
  });
}

export async function handleMyOrders(ctx: MyContext) {
  const lang = ctx.session.language || "uz";
  const telegramId = ctx.from?.id;

  if (!telegramId) return;

  const orders = await Order.find({ passengerId: telegramId })
    .sort({ createdAt: -1 })
    .limit(10);

  if (orders.length === 0) {
    await ctx.reply(t(lang, "noOrders"), {
      reply_markup: mainMenuKeyboard(lang),
    });
    return;
  }

  let ordersList = `📝 ${t(lang, "ordersList")}\n\n`;

  for (const order of orders) {
    const statusEmoji = {
      pending: "⏳",
      accepted: "✅",
      completed: "🏁",
      cancelled: "❌",
    }[order.status];

    ordersList += `
${statusEmoji} #${order.orderId}
${t(lang, "from")}: ${getCityName(lang, order.from)}
${t(lang, "to")}: ${getCityName(lang, order.to)}
${t(lang, "time")}: ${order.time}
${t(lang, "passengers")}: ${order.passengers}
Status: ${getStatusText(lang, order.status)}
---
    `.trim();
    ordersList += "\n\n";
  }

  await ctx.reply(ordersList, {
    reply_markup: mainMenuKeyboard(lang),
  });
}
