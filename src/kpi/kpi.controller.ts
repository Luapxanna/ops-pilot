import { api } from 'encore.dev/api';
import { getTaskCompletionPercentage, getProjectDurationMetrics, getTopEmployeesByEfficiency, getCachedKPIs } from './kpi.service';

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
export const getProjectDurationMetricsAPI = api(
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
 * Endpoint for Top Employees by Efficiency
 */
export const getTopEmployeesByEfficiencyAPI = api(
    {
        method: 'GET',
        path: '/kpis/top-employees',
    },
    async () => {
        try {
            const employeeEfficiency = await getCachedKPIs('employeeEfficiency', getTopEmployeesByEfficiency);
            return { success: true, data: employeeEfficiency };
        } catch (error) {
            console.error('Error fetching Top Employees by Efficiency:', error);
            throw new Error('Failed to fetch Top Employees by Efficiency');
        }
    }
);