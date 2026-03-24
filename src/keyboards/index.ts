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

// Day selection keyboard (today, tomorrow, day after tomorrow)
export function dayKeyboard(lang: Language): InlineKeyboard {
  return new InlineKeyboard()
    .text(t(lang, "today"), "day_today")
    .row()
    .text(t(lang, "tomorrow"), "day_tomorrow")
    .row()
    .text(t(lang, "dayAfterTomorrow"), "day_after_tomorrow")
    .row()
    .text(t(lang, "back"), "back_to_to");
}

// Time slots keyboard (00:00 - 23:00)
// If day is "today", only show hours after current hour
export function timeKeyboard(lang: Language, day: string = "today"): InlineKeyboard {
  const keyboard = new InlineKeyboard();
  const currentHour = new Date().getHours();
  console.log(currentHour)

  // Determine starting hour based on selected day
  const startHour = day === "today" ? currentHour + 1 : 0;

  let buttonCount = 0;
  for (let hour = startHour; hour < 24; hour++) {
    const timeStr = `${hour.toString().padStart(2, "0")}:00`;
    keyboard.text(timeStr, `time_${timeStr}`);
    buttonCount++;

    // 4 buttons per row
    if (buttonCount % 4 === 0) {
      keyboard.row();
    }
  }

  // If no time slots available for today, show message
  if (buttonCount === 0) {
    keyboard.text(t(lang, "noTimeSlots"), "no_time_slots");
    keyboard.row();
  }

  keyboard.row().text(t(lang, "back"), "back_to_day");
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
