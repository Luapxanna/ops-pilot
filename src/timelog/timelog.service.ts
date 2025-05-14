import { PrismaClient } from '@prisma/client';
import { startOfWeek, endOfWeek } from 'date-fns';

const prisma = new PrismaClient();


async function logTime(taskId: number, userId: string, date: Date, hours: number) {
    if (!taskId || !userId || !date) {
        throw new Error('Missing required fields for time logging');
    }

    try {
        const timeLog = await prisma.timeLog.create({
            data: {
                taskId,
                userId,
                date,
                hours,
            },
        });
        return timeLog;
    } catch (error) {
        console.error('Error logging time:', error);
        throw new Error('Failed to log time');
    }
}

async function getTimeLogsByTask(taskId: number) {
    try {
        const timeLogs = await prisma.timeLog.findMany({
            where: { taskId },
            include: { user: true }, // Include user details
        });
        return timeLogs;
    } catch (error) {
        console.error('Error fetching time logs:', error);
        throw new Error('Failed to fetch time logs');
    }
}

async function calculateWeeklyHours(userId: string): Promise<{ totalHours: number; warning?: string }> {
    if (!userId) {
        throw new Error('User ID is required');
    }

    try {
        // Get the start and end of the current week
        const startOfCurrentWeek = startOfWeek(new Date(), { weekStartsOn: 1 }); // Week starts on Monday
        const endOfCurrentWeek = endOfWeek(new Date(), { weekStartsOn: 1 }); // Week ends on Sunday

        // Fetch all time logs for the user within the current week
        const timeLogs = await prisma.timeLog.findMany({
            where: {
                userId,
                date: {
                    gte: startOfCurrentWeek,
                    lte: endOfCurrentWeek,
                },
            },
        });

        // Calculate the total hours worked
        const totalHours = timeLogs.reduce((sum, log) => sum + (log.hours || 0), 0);

        // Check for warnings
        let warning: string = 'No warnings for this week.';
        if (totalHours > 40) {
            warning = 'Warning: Total hours worked this week exceed 40 hours.';
        } else if (totalHours < 20) {
            warning = 'Warning: Total hours worked this week are less than 20 hours.';
        }

        return { totalHours, warning };
    } catch (error) {
        console.error('Error calculating weekly hours:', error);
        throw new Error('Failed to calculate weekly hours');
    }
}

async function getTaskHours(taskId: number): Promise<number> {
    if (!taskId) {
        throw new Error('Task ID is required');
    }

    try {
        // Fetch all time logs for the given task ID
        const timeLogs = await prisma.timeLog.findMany({
            where: { taskId },
        });

        // Calculate the total hours logged for the task
        const totalHours = timeLogs.reduce((sum, log) => sum + (log.hours || 0), 0);

        return totalHours;
    } catch (error) {
        console.error('Error fetching task hours:', error);
        throw new Error('Failed to fetch task hours');
    }
}

export const TimeLogService = {
    logTime,
    getTimeLogsByTask,
    calculateWeeklyHours,
    getTaskHours,
};