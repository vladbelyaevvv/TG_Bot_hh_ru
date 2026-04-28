import { Context, Markup, Telegraf } from "telegraf";
import { startSubscribeFlow } from "./subscribe";
import { showSubscriptions } from "./list";
import { showHelp } from "./help";
import { startFindFlow } from "./find";

export async function showMenu(ctx: Context) {
    return ctx.reply('Выбери действие:', Markup.inlineKeyboard([
        [Markup.button.callback('🔍 Найти вакансии', 'action_find')],
        [Markup.button.callback('🔔 Подписаться', 'action_subscribe')],
        [Markup.button.callback('📋 Мои подписки', 'action_list')],
        [Markup.button.callback('❓ Помощь', 'action_help')]
    ]))
}

export function registerMenu(bot: Telegraf) {
    bot.command('menu', (ctx) => showMenu(ctx))

    bot.action('action_find', (ctx) => {
        ctx.answerCbQuery();
        startFindFlow(ctx);
    })

    bot.action('action_subscribe', (ctx) => {
        ctx.answerCbQuery();
        startSubscribeFlow(ctx);
    });


    bot.action('action_list', (ctx) => {
        ctx.answerCbQuery();
        showSubscriptions(ctx);
    })

    bot.action('action_help', (ctx) => {
        ctx.answerCbQuery();
        showHelp(ctx);
    })

    bot.action('action_menu', (ctx) => {
        ctx.answerCbQuery();
        showMenu(ctx);
    })
}