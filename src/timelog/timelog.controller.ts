import { api } from 'encore.dev/api';
import { TimeLogService } from './timelog.service';
import { authenticateRequest } from '../auth/auth.middleware';

export const logTime = api(
    {
        method: 'POST',
        path: '/tasks/:taskId/log-time',
    },
    async ({ taskId, hours, headers }: { taskId: number; hours: number; headers: Record<string, string> }) => {
        console.log('Headers:', headers); // Log headers
        console.log('Task ID:', taskId); // Log task ID

        const decodedToken = await authenticateRequest(headers); // Authenticate the request
        console.log('Decoded Token:', decodedToken); // Log decoded token

        // Log the calculated time
        const timeLog = await TimeLogService.logTime(taskId, decodedToken.user.id, new Date(), hours);

        return { success: true, data: timeLog };
    }
);

export const getTimeLogsByTask = api(
    {
        method: 'GET',
        path: '/tasks/:taskId/time-logs',
    },
    async ({ taskId, headers }: { taskId: number; headers: Record<string, string> }) => {
        console.log('Headers:', headers); // Log headers
        console.log('Task ID:', taskId); // Log task ID

        const decodedToken = await authenticateRequest(headers); // Authenticate the request
        console.log('Decoded Token:', decodedToken); // Log decoded token

        const timeLogs = await TimeLogService.getTimeLogsByTask(taskId);
        return { success: true, data: timeLogs };
    }
);

export const getTaskHours = api(
    {
        method: 'GET',
        path: '/tasks/:id/hours',
    },
    async ({ id, headers }: { id: number; headers: Record<string, string> }) => {
        console.log('Headers:', headers); // Log headers
        console.log('Task ID:', id); // Log task ID

        const decodedToken = await authenticateRequest(headers); // Authenticate the request
        console.log('Decoded Token:', decodedToken); // Log decoded token

        // Calculate hours worked using the service
        const hoursWorked = await TimeLogService.calculateTaskHours(id);

        return { success: true, data: { hoursWorked } };
    }
);

export const getWeeklyHours = api(
    {
        method: 'POST', // Change to POST since we're now accepting a request body
        path: '/users/weekly-hours', // Remove the path parameter
    },
    async ({ userId, headers }: {  userId: string, headers: Record<string, string> }) => {
        console.log('Headers:', headers); // Log headers
        console.log('Employee ID:', userId); // Log the request body

        if (!userId) {
            throw new Error('User ID is required in the request body');
        }

        const decodedToken = await authenticateRequest(headers); // Authenticate the request
        console.log('Decoded Token:', decodedToken); // Log decoded token

        // Ensure the user is authorized to view their own hours or manage others
        if (decodedToken.user.id !== userId && decodedToken.user.role !== 'ORGADMIN') {
            throw new Error('Unauthorized access');
        }

        // Calculate weekly hours using the service
        const { totalHours, warning } = await TimeLogService.calculateWeeklyHours(userId);

        return { success: true, data: { totalHours, warning } };
    }
);