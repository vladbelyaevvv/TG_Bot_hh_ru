import { Telegraf } from "telegraf";
import cron from "node-cron";
import { addSentVacancy, getAllActiveSubscriptions, wasVacancySent } from "../services/subscription_db";
import { searchVacancies, Vacancy } from "../api/hhApi";
import { formatSalary } from "../utils";

let schedulerStarted = false;


export function startScheduler(bot: Telegraf){
    if (schedulerStarted) {
        console.warn('⚠️ Планировщик уже запущен, пропускаем');
        return;
    }
    schedulerStarted = true;

    console.log('📅 Планировщик инициализирован');

    cron.schedule('*/5 * * * *', async () => {
        console.log('🔄 Запуск проверки новых вакансий...');

        const subscriptions = await getAllActiveSubscriptions();

        if(subscriptions.length === 0) {
            console.log('Нет активных подписок');
            return;
        }

        for (const sub of subscriptions) {
            try {
                const result = await searchVacancies(sub.query, sub.area, 10);
                
                console.log(`[${sub.query}] Получено ${result.items.length} вакансий, из них новых:`, 0);
                
                let newCount = 0;
                for (const vacancy of result.items) {
                    const sent = await wasVacancySent(sub.id, vacancy.id);
                    
                    if (!sent) {
                        newCount++;
                        console.log(`[${sub.query}] 🆕 Новая вакансия: ${vacancy.id} (${vacancy.name})`);
                        
                        const success = await sendVacancyToUser(bot, sub.userId, vacancy, `${sub.query} ${sub.areaName}`);
                        if (success) {
                            await addSentVacancy(sub.id, vacancy.id);
                            console.log(`[${sub.query}] ✅ Сохранено: ${vacancy.id}`);
                        } else {
                            console.log(`[${sub.query}] ❌ Не отправлено: ${vacancy.id}`);
                        }
                    } else {
                        console.log(`[${sub.query}] ⏩ Уже было: ${vacancy.id} (${vacancy.name})`);
                    }
                }
                console.log(`[${sub.query}] Отправлено новых: ${newCount}/${result.items.length}`);
            } catch (error) {
                console.error(`Ошибка при проверке подписки ${sub.id}:`, error);
            }
        }

        /**for(const sub of subscriptions) {
            try {
                const result = await searchVacancies(sub.query, sub.area, 10);
                
                console.log(`Получено ${result.items.length} вакансий для "${sub.query}"`);
                
                const newVacancies = result.items.filter(async v => {
                    const sent = await wasVacancySent(sub.id, v.id);
                    console.log(`Вакансия ${v.id} (${v.name}): ${sent ? 'уже отправлена' : 'новая'}`);
                    return !sent;
                });

                if (newVacancies.length > 0) {
                    console.log(`Найдено ${newVacancies.length} новых вакансий для подписки ${sub.id}: ${sub.query} ${sub.areaName}`);

                    for (const vacancy of newVacancies){
                        const success = await sendVacancyToUser(bot, sub.userId, vacancy, `${sub.query} ${sub.areaName}`);
                        if (success) {
                            await addSentVacancy(sub.id, vacancy.id);
                        }
                    }
                } else {
                    console.log(`Нет новых вакансий для подписки ${sub.id}`);
                }
            } catch (error) {
                console.error(`Ошибка при проверке подписки ${sub.id}:`, error);
            }
        }**/
    })
}

async function sendVacancyToUser(bot: Telegraf, userId: number, vacancy: Vacancy, subName: string): Promise<boolean> {
    const salary = formatSalary(vacancy.salary);
    
    const message = `🆕 Новая вакансия от подписки *${subName}*!\n\n` +
    `*${vacancy.name}*\n` +
    `🏢 Компания: ${vacancy.employer?.name}\n` +
    `💰 ${salary || 'Зарплата не указана'}\n` +
    `🔗 Ссылка: ${vacancy.alternate_url}`;

    try {
        await bot.telegram.sendMessage(userId, message, {
            parse_mode: 'Markdown',
            link_preview_options: {is_disabled: true}
        })
        return true;
    } catch (error) {
        console.error(`Не удалось отправить вакансию пользователю ${userId}:`, error);
        return false;
    }
}