import { Telegraf } from "telegraf";
import { showMenu } from "./menu";

export function registerStart(bot: Telegraf) {
    bot.start(async (ctx) => {
        console.log(`Пользователь ${ctx.from.id} написал /start`);
        await ctx.reply(`Привет, ${ctx.from.first_name}! Я бот для поиска вакансий с hh.ru.\n\n`)
        await showMenu(ctx);
    });
}
