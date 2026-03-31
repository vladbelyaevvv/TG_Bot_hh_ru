import { Telegraf } from 'telegraf';
import { config } from 'dotenv';

config();

const bot = new Telegraf(process.env.BOT_TOKEN!);

bot.start((ctx) => {
  console.log(`Пользователь ${ctx.from.id} написал /start`);
  ctx.reply('Привет! Я бот для поиска вакансий с hh.ru');
});

bot.help((ctx) => {
  console.log(`Пользователь ${ctx.from.id} написал /help`);
  ctx.reply('Команды:\n/start - начать\n/help - помощь');
});

bot.launch();

console.log('✅ Бот запущен...');

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));