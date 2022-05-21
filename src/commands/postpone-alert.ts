import { Context, Telegraf } from "telegraf";
import { Update } from "typegram";

import DB from "../database";

export const loadPostponeCommands = (bot: Telegraf<Context<Update>>) => {
  bot.action(/postpone/, async (ctx) => {
    const userId = ctx.update.callback_query.from.id;
    const args = ctx.update.callback_query.data?.split(" ") || [];
    const slug = args[1];
    const minutes = args[2];

    const alert = await DB.getAlert(slug, userId);
    const muteUntil = Date.now() + parseInt(minutes) * 60 * 1000;

    if (!alert) {
      ctx.reply(`Alert ${slug} not found!`);
      return;
    }

    await DB.updateAlert(
      {
        ...alert,
        muteUntil,
      },
      userId
    );

    ctx.reply(`This alert will be muted for ${minutes} minutes`);
  });
};
