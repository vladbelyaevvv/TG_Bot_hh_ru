import { Context, Markup, Telegraf } from "telegraf";
import { getUserSubscriptions } from "../../services/subscription_db";

export async function showSubscriptions(ctx: Context) {
    const subs = await getUserSubscriptions(ctx.from!.id);  // ← добавили await

    if(subs.length === 0){
        return ctx.reply('У вас нет активных подписок. Создайте через `/subscribe`', {
            parse_mode: 'Markdown'
        })
    }
    
    const message = subs.map((sub, index) => 
        `${index + 1}. **${sub.query}** — ${sub.areaName}\n` +
        `   ID: \`${sub.id}\`\n` +
        `   Создана: ${new Date(sub.createdAt).toLocaleDateString('ru-RU')}`
    ).join('\n\n');

    const buttons = subs.map(sub => 
        [Markup.button.callback(`❌ ${sub.query} — ${sub.areaName}`, `unsub_${sub.id}`)]
    );
    buttons.push([Markup.button.callback('🏠 В меню', 'action_menu')]);

    return ctx.reply(`📋 Ваши подписки:\n\n${message}`, {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard(buttons)
    })
}

export function registerList(bot: Telegraf){
    bot.command('list', (ctx) => showSubscriptions(ctx))
}