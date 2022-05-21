import { Context, Telegraf } from "telegraf";
import { Update } from "typegram";

import DB from "../database";
import { toString } from "../helpers";

export const loadGetCommands = (bot: Telegraf<Context<Update>>) => {
  bot.command("list", async (ctx) => {
    const alertsList = Object.values(
      await DB.getUserAlerts(ctx.update.message.from.id)
    );
    const alerts = alertsList.map(toString);

    const message = alerts.length > 0 ? alerts.join("\n") : "No alerts found";

    ctx.reply(message);
  });
};
