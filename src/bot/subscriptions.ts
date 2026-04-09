import path from "node:path";
import fs from 'fs';

export interface Subscription{
    id: string; // уникальный id подписки
    userId: number; // Id пользователя в тг
    query: string; //Поисковый запрос (например "Typescript")
    area: string; // id региона (например "1" - Москва)
    areaName: string; // Название региона (например "Москва")
    active: boolean; // Активна ли подписка
    createdAt: string; // Дата создания подписки
    sentVacancies?: SentVacancy[];
}

export interface SentVacancy {
    subscriptionId: string;
    vacancyId: string;
    sentAt: string;
}

const DATA_DIR = './data' //текущая директория
const SUBSCRIPTION_FILE = path.join(DATA_DIR, 'subscriptions.json');

//Убедиться что папка data существует, если что создать ее
function ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)){
        fs.mkdirSync(DATA_DIR, { recursive: true});
    }
}

//Загрузка всех подписок
export function loadSubscriptions(): Subscription[] {
    ensureDataDir();

    //если файла с подписками еще нет, то возвращаем []
    if(!fs.existsSync(SUBSCRIPTION_FILE)){
        return [];
    }

    //чтение файла и возращение объекта js
    const data = fs.readFileSync(SUBSCRIPTION_FILE, 'utf-8');
    return JSON.parse(data);
}

//Сохранить все подписки
function saveSubscriptions(subscriptions: Subscription[]): void {
    ensureDataDir();
    fs.writeFileSync(SUBSCRIPTION_FILE, JSON.stringify(subscriptions, null, 2)); //запись с форматированием
}

//Создать новую подписку
export function createSubscription(
    userId: number,
    query: string,
    area: string,
    areaName: string
): Subscription {
    const subscriptions = loadSubscriptions();

    const newSub: Subscription = {
        id: Date.now().toString(),
        userId,
        query,
        area,
        areaName,
        active: true,
        createdAt: new Date().toISOString()
    }

    subscriptions.push(newSub);
    saveSubscriptions(subscriptions);

    return newSub;
}

//получить активные подписки пользователя
export function getUserSubscriptions(userId: number): Subscription[] {
    const subscriptions = loadSubscriptions();
    return subscriptions.filter(sub => sub.userId === userId && sub.active);
}

//деактивировать подписку
export function deactivateSubscription(userId: number, subscriptionId: string): boolean {
    const subscriptions = loadSubscriptions();

    const index = subscriptions.findIndex(
        sub => sub.id === subscriptionId && sub.userId === userId
    )

    if(index === -1) return false;

    subscriptions[index].active = false;
    saveSubscriptions(subscriptions);

    return true;
}

//получить все активные подписки
export function getAllActiveSubscriptions(): Subscription[] {
  const subscriptions = loadSubscriptions();
  return subscriptions.filter(sub => sub.active);
}

export function addSentVacancy(subscriptionId: string, vacancyId: string): void {
    const subscriptions = loadSubscriptions();

    const sub = subscriptions.find(s => s.id === subscriptionId);
    if(!sub) return;

    if (!sub.sentVacancies) sub.sentVacancies = [];

    sub.sentVacancies.push({
        subscriptionId,
        vacancyId,
        sentAt: new Date().toISOString()
    })

    saveSubscriptions(subscriptions);
}

export function wasVacancySent(subscriptionId: string, vacancyId: string): boolean {
    const subscriptions = loadSubscriptions();
    const sub = subscriptions.find(s => s.id === subscriptionId);

    if(!sub || !sub.sentVacancies) return false;

    return sub.sentVacancies.some(
        v => v.vacancyId === vacancyId
    );
}