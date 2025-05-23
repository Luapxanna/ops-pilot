import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';
import cron from 'node-cron';

const prisma = new PrismaClient();
export const redis = new Redis();

let cachedKPIs: Record<string, any> | null = null;
let lastUpdated: Date | null = null;

/**
 * Calculate Task Completion Percentage
 */
export async function getTaskCompletionPercentage() {
    const taskCompletion = await prisma.task.groupBy({
        by: ['status'],
        _count: { id: true },
    });

    const totalTasks = taskCompletion.reduce((sum, group) => sum + group._count.id, 0);
    const completedTasks = taskCompletion.find((group) => group.status === 'COMPLETED')?._count.id || 0;

    return (completedTasks / totalTasks) * 100; // Task Completion %
}

/**
 * Calculate Project Duration Metrics
 */
export async function getProjectDurationMetrics() {
    const projectDurations = await prisma.project.findMany({
        select: {
            id: true,
            name: true,
            startDate: true,
            endDate: true,
        },
    });

    return projectDurations.map((project) => ({
        projectId: project.id,
        projectName: project.name,
        duration: project.endDate
            ? (new Date(project.endDate).getTime() - new Date(project.startDate).getTime()) / (1000 * 60 * 60 * 24) // Duration in days
            : null,
    }));
}

/**
 * Get Top Employees by Efficiency \\It is leaderboard so this one is removed
 */

/**
 * Get Cached KPIs
 */
export async function getCachedKPIs(metric: string, fetchFunction: () => Promise<any>) {
    const now = new Date();

    // Check if the cache is valid (less than 24 hours old)
    if (cachedKPIs && lastUpdated && now.getTime() - lastUpdated.getTime() < 24 * 60 * 60 * 1000) {
        return cachedKPIs[metric];
    }

    // Refresh the cache
    if (!cachedKPIs) {
        cachedKPIs = {};
    }

    cachedKPIs[metric] = await fetchFunction();
    lastUpdated = now;

    return cachedKPIs[metric];
}

/**
 * Get Cached KPIs with Redis
 */
export async function getCachedKPIsWithRedis(metric: string, fetchFunction: () => Promise<any>) {
    const cachedData = await redis.get(metric);

    if (cachedData) {
        return JSON.parse(cachedData);
    }

    const data = await fetchFunction();
    await redis.set(metric, JSON.stringify(data), 'EX', 24 * 60 * 60); // Cache for 24 hours

    return data;
}

/**
 * Schedule daily KPI cache refresh
 */
cron.schedule('0 0 * * *', async () => { // Runs daily at midnight, tested with * * * * *
    try {
        const taskCompletionPercentage = await getTaskCompletionPercentage();
        const projectDurationMetrics = await getProjectDurationMetrics();

        // Update Redis cache
        await redis.set('taskCompletionPercentage', JSON.stringify(taskCompletionPercentage), 'EX', 24 * 60 * 60);
        await redis.set('projectDurationMetrics', JSON.stringify(projectDurationMetrics), 'EX', 24 * 60 * 60);

        console.log('KPI cache refreshed successfully');
    } catch (error) {
        console.error('Error refreshing KPI cache:', error);
    }
});

export const kpiService = {
    getTaskCompletionPercentage,
    getProjectDurationMetrics,
};