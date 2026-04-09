import { Telegraf } from 'telegraf';
import { config } from 'dotenv';
import { registerCommands } from './bot/commands';
import { startScheduler } from './bot/scheduler';

config();

const bot = new Telegraf(process.env.BOT_TOKEN!);

if (!process.env.BOT_TOKEN) {
  console.error('❌ BOT_TOKEN не найден в .env');
  process.exit(1);
}

registerCommands(bot);

bot.start((ctx) => {
  console.log(`Пользователь ${ctx.from.id} написал /start`);
  ctx.reply('Привет! Я бот для поиска вакансий с hh.ru. Используй /find для поиска.');
});

startScheduler(bot);

bot.launch();

console.log('✅ Бот запущен...');

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));