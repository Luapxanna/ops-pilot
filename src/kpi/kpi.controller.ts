import { api } from 'encore.dev/api';
import { getTaskCompletionPercentage, getProjectDurationMetrics, getCachedKPIs } from './kpi.service';
// Manual api calling if needed
/**
 * Endpoint for Task Completion Percentage
 */
export const getTaskCompletionPercentageAPI = api(
    {
        method: 'GET',
        path: '/kpis/task-completion',
    },
    async () => {
        try {
            const taskCompletionPercentage = await getCachedKPIs('taskCompletionPercentage', getTaskCompletionPercentage);
            return { success: true, data: { taskCompletionPercentage } };
        } catch (error) {
            console.error('Error fetching Task Completion Percentage:', error);
            throw new Error('Failed to fetch Task Completion Percentage');
        }
    }
);

/**
 * Endpoint for Project Duration Metrics
 */
export const getProjectDuration = api(
    {
        method: 'GET',
        path: '/kpis/project-duration',
    },
    async () => {
        try {
            const projectDurationMetrics = await getCachedKPIs('projectDurationMetrics', getProjectDurationMetrics);
            return { success: true, data: projectDurationMetrics };
        } catch (error) {
            console.error('Error fetching Project Duration Metrics:', error);
            throw new Error('Failed to fetch Project Duration Metrics');
        }
    }
);

/**
 * Endpoint for Top Employees by Efficiency \\Removed as it is a leaderboard
 */
