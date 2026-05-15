import { Telegraf } from "telegraf";
import { deactivateSubscription } from "../../services/subscription_db";
import { Message } from "telegraf/types";
import { showSubscriptions } from "./list";

export function registerUnsubscribe(bot: Telegraf) {
    bot.command('unsubscribe', async (ctx) => {
        const message = ctx.message as Message.TextMessage;
        const args = message.text.split(' ').slice(1).join(' ');

        if(!args) {
            return ctx.reply(
                'Введите ID подписки для удаления.\n\n' +
                'Пример: `/unsubscribe 1712500000000`\n\n' +
                'Узнайте ID через команду `/list`',
                { parse_mode: 'Markdown' }
            )
        }
        const success = await deactivateSubscription(ctx.from.id, args);

        if (success) {
            ctx.reply('✅ Подписка отключена');
        } else {
            ctx.reply('❌ Подписка не найдена. Проверьте ID через `/list`');
        }
    })

    bot.action(/^unsub_(.+)$/, async (ctx) => {
        const subscriptionId = ctx.match[1];
        const success = await deactivateSubscription(ctx.from!.id, subscriptionId);

        ctx.answerCbQuery();

        if (success) {
            ctx.reply('✅ Подписка отключена.');
            await showSubscriptions(ctx);
        } else {
            ctx.reply('❌ Подписка не найдена.');
        }
    })
}