import { Context, Telegraf } from "telegraf";

export async function showHelp(ctx: Context) {
    return ctx.reply(
        `🤖 *Job Hunter Bot* — поиск вакансий с hh.ru\n\n` +
        `📋 *Команды:*\n` +
        `/start — Запустить бота\n` +
        `/find <запрос> — Разовый поиск вакансий\n` +
        `/subscribe <запрос> — Подписаться на новые вакансии\n` +
        `/list — Мои активные подписки\n` +
        `/unsubscribe <id> — Отписаться от рассылки\n` +
        `/help — Эта справка\n\n` +
        `💡 *Примеры:*\n` +
        `/find Python Москва\n` +
        `/subscribe Frontend Developer\n\n` +
        `Или просто воспользуйтесь командой /menu`, 
        { parse_mode: 'Markdown' }
    );
}

export function registerHelp(bot: Telegraf) {
    bot.help((ctx) => showHelp(ctx));
}