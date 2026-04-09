import { Telegraf } from "telegraf";
import { searchVacancies } from "../api/hhApi";
import { createSubscription, deactivateSubscription, getUserSubscriptions } from "./subscriptions";
import { formatVacanciesList } from '../utils';

export function registerCommands(bot: Telegraf){
    bot.command('find', async (ctx) => {
        const args = ctx.message.text.split(' ').slice(1).join(' ');

        if(!args){
            return ctx.reply('🔍 Введите запрос для поиска вакансий.\n\nПример: `/find` TypeScript Москва', {
                parse_mode: 'Markdown'
            });
        }

        await ctx.reply('⏳ Ищу вакансии...');

        try{
            const result = await searchVacancies(args);

            if (result.items.length === 0) {
                return ctx.reply('❌ Вакансий не найдено. Попробуйте другой запрос.');
            }

            const message =  `Найдено вакансий: ${result.found}\n\n` +
                formatVacanciesList(result.items);

            await ctx.reply(message, {
                parse_mode: 'Markdown',
                link_preview_options: { is_disabled: true }//чтобы ссылка не показывалась под сообщением
            })
        } catch(error) {
            await ctx.reply('❌ Ошибка при поиске. Попробуйте позже.');
            console.error('Ошибка при поиске вакансий:', error);
        }
    })
    bot.command('subscribe', async (ctx) => {
        const args = ctx.message.text.split(' ').slice(1).join(' ');

        if(!args){
            return ctx.reply(
                '🔍 Введите поисковый запрос для подписки.\n\n' +
                'Пример: `/subscribe TypeScript Москва`',
                { parse_mode: 'Markdown' }
            )
        }

        const query = args;
        const area = '1';
        const areaName = 'Москва';

        const subscription = createSubscription(
            ctx.from.id,
            query,
            area,
            areaName
        )

        ctx.reply(
            `✅ Подписка создана!\n\n` +
            `🔍 Запрос: ${subscription.query}\n` +
            `📍 Регион: ${subscription.areaName}\n\n` +
            `Буду присылать новые вакансии каждые 30 минут.`
        )
    })

    bot.command('list', (ctx) => {
        const subs = getUserSubscriptions(ctx.from.id);

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

        ctx.reply(`📋 Ваши подписки:\n\n${message}`, {
            parse_mode: 'Markdown'
        })
    })

    bot.command('unsubscribe', (ctx) => {
        const args = ctx.message.text.split(' ').slice(1).join(' ');

        if(!args) {
            return ctx.reply(
                'Введите ID подписки для удаления.\n\n' +
                'Пример: `/unsubscribe 1712500000000`\n\n' +
                'Узнайте ID через команду `/list`',
                { parse_mode: 'Markdown' }
            )
        }
        const success = deactivateSubscription(ctx.from.id, args);

        if (success) {
            ctx.reply('✅ Подписка отключена');
        } else {
            ctx.reply('❌ Подписка не найдена. Проверьте ID через `/list`');
        }
    })

    bot.help((ctx) => {
        ctx.reply(
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
            `/subscribe Frontend Developer`, 
            { parse_mode: 'Markdown' }
        );
    });
}