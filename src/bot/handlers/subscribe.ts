import { Context, Telegraf } from "telegraf";
import { createSubscription } from "../../services/subscription_db";
import { Message } from "telegraf/types";
import { findAreaByName } from "../../api/hhApi";

interface PendingState {
    step: 'query' | 'city';
    query?: string;
}

const pendingSubscriptions = new Map<number, PendingState>();

export async function startSubscribeFlow(ctx: any) {
    const userId = ctx.from!.id;
    pendingSubscriptions.set(userId, { step: 'query' });
    return ctx.reply('🔍 Введи поисковый запрос:\n\nНапример: `Python`, `Frontend developer`', {
        parse_mode: 'Markdown'
    });
}

function validateQuery(text: string): string | null {
    if (text.length < 2) return '❌ Запрос слишком короткий. Минимум 2 символа.';
    if (text.length > 100) return '❌ Запрос слишком длинный. Максимум 100 символов.';
    if (!/[a-zA-Zа-яА-ЯёЁ0-9]/.test(text)) return '❌ Запрос содержит недопустимые символы.';
    return null;
}

export function registerSubscribe(bot: Telegraf) { 
    bot.command('subscribe', (ctx) => startSubscribeFlow(ctx));

    bot.on('text', async(ctx, next) => {
        const userId = ctx.from.id;
        const state = pendingSubscriptions.get(userId);

        if(!state) return next();

        const text = (ctx.message as Message.TextMessage).text;

        //игнорируем если пользователь ввёл другую команду
        if (text.startsWith('/')) {
            pendingSubscriptions.delete(userId);
            return next();
        }

        //получение города
        if(state.step === 'query') {
            const error = validateQuery(text);
            if(error) {
                return ctx.reply(error);
            }

            pendingSubscriptions.set(userId, { step: 'city', query: text});
            ctx.reply('📍 Введи город:\n\nНапример: `Казань`, `Москва`, `Екатеринбург`', {
                parse_mode: 'Markdown'
            });
            return;
        }

        if(state.step === 'city'){
            await ctx.reply('⏳ Проверяю город...');

            const area = await findAreaByName(text);

            if(!area) {
                return ctx.reply('❌ Город не найден. Проверь название и попробуй ещё раз.');
            }

            const subscription = await createSubscription(userId, state.query!, area.id, area.name);

            if(!subscription) {
                pendingSubscriptions.delete(userId);
                return ctx.reply('❌ Достигнут лимит подписок (максимум 5). Отпишитесь от одной через /list.');
            }

            pendingSubscriptions.delete(userId);
            ctx.reply(
                `✅ Подписка создана!\n\n` +
                `🔍 Запрос: ${subscription.query}\n` +
                `📍 Регион: ${subscription.areaName}\n\n` +
                `Буду присылать новые вакансии каждые 30 минут.`
            );

        }
    }
)
}
