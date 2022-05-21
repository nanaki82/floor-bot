import { Context, Telegraf } from "telegraf";
import { Update } from "typegram";

import DB from "../database";
import { checkIfExist } from "../api";

export const loadAddCommands = (bot: Telegraf<Context<Update>>) => {
  bot.command("add", async (ctx) => {
    const args = ctx.update.message.text.split(" ");
    const slug = args[1];
    const min = parseFloat(args[2]);
    const max = parseFloat(args[3]);
    const collectionExist = await checkIfExist(slug);

    if (args.length !== 4 || isNaN(min) || isNaN(max) || !collectionExist) {
      ctx.reply(`Non pazziamm`);
      return;
    }

    await DB.addAlertToUser(
      {
        slug,
        min,
        max,
        muteUntil: Date.now(),
      },
      ctx.update.message.from.id
    );

    ctx.reply("Alert added!");
  });
};
