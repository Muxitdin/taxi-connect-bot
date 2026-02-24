import { uz } from "./uz";
import { ru } from "./ru";
import { Language } from "../types";

export const locales = { uz, ru };

export type LocaleKeys = keyof typeof uz;

export function t(lang: Language, key: LocaleKeys): string {
  return locales[lang][key] || locales["uz"][key] || key;
}

export function getCityName(lang: Language, city: string): string {
  const cityMap: Record<string, LocaleKeys> = {
    tashkent: "tashkent",
    andijan: "andijan",
    namangan: "namangan",
    fergana: "fergana",
  };
  return t(lang, cityMap[city] || "tashkent");
}

export function getStatusText(lang: Language, status: string): string {
  const statusMap: Record<string, LocaleKeys> = {
    pending: "statusPending",
    accepted: "statusAccepted",
    completed: "statusCompleted",
    cancelled: "statusCancelled",
  };
  return t(lang, statusMap[status] || "statusPending");
}
