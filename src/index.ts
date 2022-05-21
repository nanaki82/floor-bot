require("dotenv").config();

import { Context, Markup, Telegraf } from "telegraf";
import type { Update } from "typegram";

import { getFloorPrice } from "./api";
import DB from "./database";

import { loadAddCommands } from "./commands/add-alert";
import { loadGetCommands } from "./commands/get-alerts";
import { loadDeleteCommands } from "./commands/del-alert";
import { loadPostponeCommands } from "./commands/postpone-alert";
import { getAlertMessage, sliceIntoChunks } from "./helpers";

const mainLoop = (bot: Telegraf<Context<Update>>) => {
  setInterval(async () => {
    const data = await DB.getAllAlerts();

    for (const userId of Object.keys(data)) {
      const { alerts } = data[userId];

      for (const collectionSlug of Object.keys(alerts)) {
        const { slug, min, max, muteUntil } = alerts[collectionSlug];
        const price = await getFloorPrice(slug);

        if (price === undefined) {
          return;
        }

        if (Date.now() <= muteUntil) {
          return;
        }

        if (price > max || price < min) {
          const keyboard = [10, 30, 60, 300].map((minutes, index) => {
            return Markup.button.callback(
              `Postpone - ${minutes} minutes`,
              `postpone ${slug} ${minutes}`,
              false
            );
          });
          keyboard.push(
            Markup.button.callback(
              "Delete this alarm",
              `remove alert ${slug}`,
              false
            )
          );

          const message = getAlertMessage(slug, price, min, max) as string;
          await bot.telegram.sendMessage(userId, message, {
            reply_markup: {
              inline_keyboard: sliceIntoChunks(keyboard, 2),
            },
            parse_mode: "HTML",
          });
        }
      }
    }
  }, parseInt(process.env.CHECK_INTERVAL as string));
};

const initApp = () => {
  const bot = new Telegraf<Context<Update>>(process.env.BOT_KEY as string);
  // bot.use(Telegraf.log());
  bot.hears("id", (ctx) => {
    ctx.reply(`Your user ID is: ${ctx.update.message.from.id}`);
    console.log(ctx.update.message.from.id);
  });

  loadGetCommands(bot);
  loadAddCommands(bot);
  loadDeleteCommands(bot);
  loadPostponeCommands(bot);

  bot.launch();

  // Enable graceful stop
  process.once("SIGINT", () => {
    bot.stop("SIGINT");
    process.exit(0);
  });
  process.once("SIGTERM", () => {
    bot.stop("SIGTERM");
    process.exit(0);
  });

  return bot;
};

const bot = initApp();
mainLoop(bot);
