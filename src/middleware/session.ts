import { session } from "grammy";
import { SessionData, MyContext } from "../types";

export function createSessionMiddleware() {
  return session<SessionData, MyContext>({
    initial: (): SessionData => ({
      step: undefined,
      language: "uz",
      orderData: {},
    }),
  });
}
