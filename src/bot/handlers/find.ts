import { Context, Markup, Telegraf } from "telegraf";
import { searchVacancies, findAreaByName } from "../../api/hhApi";
import { formatVacanciesList } from "../../utils";

const PER_PAGE = 5;

interface FindState {
    step: 'query' | 'city';
    query?: string;
}

interface SearchState {
    query: string;
    area: string;
    page: number;
    totalFound: number;
}

const pendingFind = new Map<number, FindState>();
const searchSessions = new Map<number, SearchState>();

async function sendVacanciesPage(ctx: Context, query: string, area: string, page: number, edit=false) {
    if(!edit) await ctx.reply('⏳ Ищу вакансии...');

    const result = await searchVacancies(query, area, PER_PAGE, page);

    if (result.items.length === 0) {
        return ctx.reply('❌ Вакансий не найдено. Попробуйте другой запрос.');
    }

    searchSessions.set(ctx.from!.id, { query, area, page, totalFound: result.found });

    const totalPages = Math.ceil(result.found / PER_PAGE);

    const navButtons = [];
    if (page > 0) navButtons.push(Markup.button.callback('◀ Назад', 'find_prev'));
    if (page < totalPages - 1) navButtons.push(Markup.button.callback('▶ Вперёд', 'find_next'));

    const keyboard = [navButtons, [Markup.button.callback('🏠 В меню', 'action_menu')]];

    const offset = page * PER_PAGE;
    const text = `Найдено вакансий: ${result.found} | Страница ${page + 1} из ${totalPages}\n\n`
        + formatVacanciesList(result.items, offset);

    const options = {
        parse_mode: 'Markdown' as const,
        link_preview_options: { is_disabled: true },
        ...Markup.inlineKeyboard(keyboard)
    }

    if (edit) {
        await ctx.editMessageText(text, options);
    } else {
        await ctx.reply(text, options);
    }
}

export async function startFindFlow(ctx: any) {
    pendingFind.set(ctx.from!.id, { step: 'query' });
    return ctx.reply('🔍 Введи поисковый запрос:\n\nНапример: `Python`, `Frontend developer`', {
        parse_mode: 'Markdown'
    });
}

export function registerFind(bot: Telegraf) {
    bot.command('find', (ctx) => startFindFlow(ctx));

    bot.on('text', async (ctx, next) => {
        const userId = ctx.from.id;
        const state = pendingFind.get(userId);

        if (!state) return next();

        const text = ctx.message.text;

        if (text.startsWith('/')) {
            pendingFind.delete(userId);
            return next();
        }

        if (state.step === 'query') {
            if (text.length < 2) return ctx.reply('❌ Запрос слишком короткий. Минимум 2 символа.');
            if (text.length > 100) return ctx.reply('❌ Запрос слишком длинный. Максимум 100 символов.');
            if (!/[a-zA-Zа-яА-ЯёЁ0-9]/.test(text)) return ctx.reply('❌ Запрос содержит недопустимые символы.');

            pendingFind.set(userId, { step: 'city', query: text });
            return ctx.reply('📍 Введи город:\n\nНапример: `Казань`, `Москва`, `Екатеринбург`', {
                parse_mode: 'Markdown'
            });
        }

        if (state.step === 'city') {
            await ctx.reply('⏳ Проверяю город...');
            const area = await findAreaByName(text);

            if (!area) {
                return ctx.reply('❌ Город не найден. Проверь название и попробуй ещё раз.');
            }

            pendingFind.delete(userId);

            try {
                await sendVacanciesPage(ctx, state.query!, area.id, 0);
            } catch (error) {
                await ctx.reply('❌ Ошибка при поиске. Попробуйте позже.');
                console.error('Ошибка при поиске вакансий:', error);
            }
        }
    });

    bot.action('find_next', async (ctx) => {
        ctx.answerCbQuery();
        const state = searchSessions.get(ctx.from.id);
        if (!state) return;
        const totalPages = Math.ceil(state.totalFound / PER_PAGE);
        if (state.page >= totalPages - 1) return;
        await sendVacanciesPage(ctx, state.query, state.area, state.page + 1, true);
    });

    bot.action('find_prev', async (ctx) => {
        ctx.answerCbQuery();
        const state = searchSessions.get(ctx.from.id);
        if (!state || state.page <= 0) return;
        await sendVacanciesPage(ctx, state.query, state.area, state.page - 1, true);
    });
}
