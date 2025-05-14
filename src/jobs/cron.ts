import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { getTaskCompletionPercentage, getProjectDurationMetrics } from '../kpi/kpi.service';
import { redis } from '../kpi/kpi.service';

const prisma = new PrismaClient();

/**
 * Mark Overdue Tasks
 */
export async function markOverdueTasks() {
    try {
        const now = new Date();
        const updatedTasks = await prisma.task.updateMany({
            where: {
                duedate: { lte: now },
                status: { notIn: ['COMPLETED', 'OVERDUE'] },
            },
            data: {
                status: 'OVERDUE',
            },
        });
        console.log(`Marked ${updatedTasks.count} tasks as OVERDUE.`);
    } catch (error) {
        console.error('Error marking overdue tasks:', error);
    }
}

/**
 * Generate Daily Digest
 */
export async function generateDailyDigest() {
    try {
        const taskCompletionPercentage = await getTaskCompletionPercentage();
        const projectDurationMetrics = await getProjectDurationMetrics();

        // Compose the digest as HTML
        const htmlDigest = `
            <h1>Daily Digest</h1>
            <h2>Task Completion Percentage</h2>
            <p>${taskCompletionPercentage.toFixed(2)}%</p>
            <h2>Project Duration Metrics</h2>
            <ul>
                ${projectDurationMetrics
                    .map(
                        (project) =>
                            `<li>${project.projectName}: ${project.duration || 'N/A'} days</li>`
                    )
                    .join('')}
            </ul>
        `;

        // Compose the digest as plain text
        const plainTextDigest = `
Daily Digest
============

Task Completion Percentage:
${taskCompletionPercentage.toFixed(2)}%

Project Duration Metrics:
${projectDurationMetrics
    .map((project) => `${project.projectName}: ${project.duration || 'N/A'} days`)
    .join('\n')}`;

        // Log the digest
        console.log('Daily Digest (HTML):', htmlDigest);
        console.log('Daily Digest (Plain Text):', plainTextDigest);

        // Mock sending the digest via email
        await sendMockEmail('luapisnothere23@gmail.com', 'Daily Digest', plainTextDigest, htmlDigest);
    } catch (error) {
        console.error('Error generating daily digest:', error);
    }
}

/**
 * Mock Email Sending Function
 */
export async function sendMockEmail(to: string, subject: string, text: string, html: string) {
    console.log(`Mock email sent to ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Text: ${text}`);
    console.log(`HTML: ${html}`);
}

/**
 * Recalculate KPIs
 */
export async function recalculateKPIs() {
    try {
        const taskCompletionPercentage = await getTaskCompletionPercentage();
        const projectDurationMetrics = await getProjectDurationMetrics();

        // Update Redis cache
        await redis.set('taskCompletionPercentage', JSON.stringify(taskCompletionPercentage), 'EX', 24 * 60 * 60);
        await redis.set('projectDurationMetrics', JSON.stringify(projectDurationMetrics), 'EX', 24 * 60 * 60);

        console.log('KPI cache refreshed successfully.');
    } catch (error) {
        console.error('Error recalculating KPIs:', error);
    }
}

/**
 * Schedule Daily Cron Job
 */
cron.schedule('0 0 * * *', async () => { // Runs daily at midnight
    console.log('Starting daily cron job...');
    await markOverdueTasks();
    await generateDailyDigest();
    await recalculateKPIs();
    console.log('Daily cron job completed.');
});