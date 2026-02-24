import { InlineKeyboard, Keyboard } from "grammy";
import { Language } from "../types";
import { t, getCityName } from "../locales";

// Language selection keyboard
export function languageKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .text("O'zbekcha", "lang_uz")
    .text("Русский", "lang_ru");
}

// Phone request keyboard
export function phoneKeyboard(lang: Language): Keyboard {
  return new Keyboard()
    .requestContact(t(lang, "sharePhoneButton"))
    .resized()
    .oneTime();
}

// Main menu keyboard
export function mainMenuKeyboard(lang: Language): Keyboard {
  return new Keyboard()
    .text(t(lang, "orderTaxi"))
    .text(t(lang, "myOrders"))
    .row()
    .text(t(lang, "myProfile"))
    .text(t(lang, "changeLanguage"))
    .resized();
}

// Cities for "From" selection
export function fromCitiesKeyboard(lang: Language): InlineKeyboard {
  return new InlineKeyboard()
    .text(getCityName(lang, "tashkent"), "from_tashkent")
    .row()
    .text(getCityName(lang, "andijan"), "from_andijan")
    .row()
    .text(getCityName(lang, "namangan"), "from_namangan")
    .row()
    .text(getCityName(lang, "fergana"), "from_fergana");
}

// Cities for "To" selection based on "From" selection
export function toCitiesKeyboard(lang: Language, fromCity: string): InlineKeyboard {
  const keyboard = new InlineKeyboard();

  if (fromCity === "tashkent") {
    // If from Tashkent, show Andijan, Namangan, Fergana
    keyboard
      .text(getCityName(lang, "andijan"), "to_andijan")
      .row()
      .text(getCityName(lang, "namangan"), "to_namangan")
      .row()
      .text(getCityName(lang, "fergana"), "to_fergana");
  } else {
    // If from Andijan, Namangan, or Fergana, show only Tashkent
    keyboard.text(getCityName(lang, "tashkent"), "to_tashkent");
  }

  keyboard.row().text(t(lang, "back"), "back_to_from");
  return keyboard;
}

// Time slots keyboard (00:00 - 23:00)
export function timeKeyboard(lang: Language): InlineKeyboard {
  const keyboard = new InlineKeyboard();

  for (let hour = 0; hour < 24; hour++) {
    const timeStr = `${hour.toString().padStart(2, "0")}:00`;
    keyboard.text(timeStr, `time_${timeStr}`);

    // 4 buttons per row
    if ((hour + 1) % 4 === 0) {
      keyboard.row();
    }
  }

  keyboard.row().text(t(lang, "back"), "back_to_to");
  return keyboard;
}

// Passengers count keyboard (1-4)
export function passengersKeyboard(lang: Language): InlineKeyboard {
  return new InlineKeyboard()
    .text("1", "passengers_1")
    .text("2", "passengers_2")
    .text("3", "passengers_3")
    .text("4", "passengers_4")
    .row()
    .text(t(lang, "back"), "back_to_time");
}

// Phone selection keyboard
export function phoneSelectionKeyboard(lang: Language, userPhone: string): InlineKeyboard {
  return new InlineKeyboard()
    .text(`${t(lang, "useMyPhone")} (${userPhone})`, "use_my_phone")
    .row()
    .text(t(lang, "enterOtherPhone"), "enter_other_phone")
    .row()
    .text(t(lang, "back"), "back_to_passengers");
}

// Skip comment keyboard
export function commentKeyboard(lang: Language): InlineKeyboard {
  return new InlineKeyboard()
    .text(t(lang, "skipComment"), "skip_comment")
    .row()
    .text(t(lang, "back"), "back_to_phone");
}

// Confirm order keyboard
export function confirmOrderKeyboard(lang: Language): InlineKeyboard {
  return new InlineKeyboard()
    .text(t(lang, "confirm"), "confirm_order")
    .text(t(lang, "cancel"), "cancel_order");
}

// Accept order keyboard (for driver group) - uses deep link to open bot
export function acceptOrderKeyboard(orderId: string, botUsername: string): InlineKeyboard {
  const deepLink = `https://t.me/${botUsername}?start=accept_${orderId}`;
  return new InlineKeyboard()
    .url("Qabul qilish / Принять", deepLink);
}

// Decline order keyboard (for driver after accepting)
export function declineOrderKeyboard(lang: Language, orderId: string): InlineKeyboard {
  return new InlineKeyboard()
    .text(t(lang, "declineOrder"), `decline_${orderId}`);
}
