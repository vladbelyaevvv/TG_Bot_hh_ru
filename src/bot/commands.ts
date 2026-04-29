import { Telegraf } from "telegraf";
import { registerStart } from "./handlers/start";
import { registerFind } from "./handlers/find";
import { registerSubscribe } from "./handlers/subscribe";
import { registerList } from "./handlers/list";
import { registerUnsubscribe } from "./handlers/unsubscribe";
import { registerHelp } from "./handlers/help";
import { registerMenu } from "./handlers/menu";

export function registerCommands(bot: Telegraf){
    registerStart(bot);
    registerFind(bot);
    registerSubscribe(bot);
    registerList(bot);
    registerUnsubscribe(bot);
    registerHelp(bot);
    registerMenu(bot);
}