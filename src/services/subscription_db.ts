import { prisma } from '../db';

export async function getAllActiveSubscriptions() {
    return await prisma.subscription.findMany({
        where: { active: true }
    });
}

export async function addSentVacancy(subscriptionId: string, vacancyId: string) {
    try {
        // пытаемся создать запись
        return await prisma.sentVacancy.create({
            data: { subscriptionId, vacancyId }
        });
    } catch (error: any) {
        // если запись уже существует, то возвращаем существующую
        if (error.code === 'P2002') {
            console.log(`📝 Вакансия ${vacancyId} уже есть в БД`);
            return null;
        }
        throw error;
    }
}

export async function wasVacancySent(subscriptionId: string, vacancyId: string) {
    const sent = await prisma.sentVacancy.findFirst({
        where: { subscriptionId, vacancyId }
    });
    return !!sent;
}

export async function createSubscription(userId: number, query: string, area: string, areaName: string) {
    const activeCount = await prisma.subscription.count({
        where: { userId, active: true }
    });
    
    if (activeCount >= 5) return null;
    
    return await prisma.subscription.create({
        data: { userId, query, area, areaName, active: true }
    });
}

export async function getUserSubscriptions(userId: number) {
    return await prisma.subscription.findMany({
        where: { userId, active: true }
    });
}

export async function deactivateSubscription(userId: number, subscriptionId: string) {
    const result = await prisma.subscription.updateMany({
        where: { id: subscriptionId, userId },
        data: { active: false }
    });
    return result.count > 0;
}