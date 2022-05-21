import { Context, Markup, Telegraf } from "telegraf";
import type { Update } from "typegram";

import DB from "../database";
import { sliceIntoChunks } from "../helpers";

export const loadDeleteCommands = (bot: Telegraf<Context<Update>>) => {
  bot.command("delete", async (ctx) => {
    const alertsList = Object.values(
      await DB.getUserAlerts(ctx.update.message.from.id)
    );

    const keyboard = alertsList.map((alert, index) => {
      const alertString = `${alert.slug} - ${alert.min} to ${alert.max}`;
      return Markup.button.callback(
        alertString,
        `remove alert ${alert.slug}`,
        false
      );
    });

    const buttonRows = sliceIntoChunks(keyboard, 2);

    ctx.reply(
      "Click on the alert you want to delete",
      Markup.inlineKeyboard(buttonRows)
    );
  });

  bot.action(/remove alert/, async (ctx) => {
    const slug =
      ctx.update.callback_query.data?.split(" ")[2] || "vattelappesca";
    const res = await DB.delAlert(slug, ctx.update.callback_query.from.id);

    res ? ctx.reply("Alert removed") : ctx.reply("Nfa gliu scem");
  });
};
