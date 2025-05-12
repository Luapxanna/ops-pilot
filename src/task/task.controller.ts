import { api } from 'encore.dev/api';
import { TaskService } from './task.service';
import { authenticateRequest } from '../auth/auth.middleware';
import { PrismaClient } from '@prisma/client';
import { DecodedToken } from '../project/model';

const prisma = new PrismaClient();
type Status = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'PENDING' | 'OVERDUE';
export const assignTask = api(
    {
        method: 'POST',
        path: '/tasks/assign',
    },
    async ({ name, description, assigneeId, projectId, workflowId, dependencies = [], headers }: { name: string; description: string; assigneeId: string; projectId: number; workflowId: number; dependencies?: number[]; headers: Record<string, string> }) => {
        console.log('Headers:', headers); // Log headers
        console.log('Body:', { name, description, assigneeId, projectId, workflowId, dependencies }); // Log body

        const decodedToken = await authenticateRequest(headers); // Authenticate the request
        console.log('Decoded Token:', decodedToken); // Log decoded token

        const mappedToken: DecodedToken = {
            id: decodedToken.user.id,
            role: decodedToken.user.role,
            organizationId: decodedToken.user.organizationId,
        };

        const task = await TaskService.assignTask(name, description, assigneeId, workflowId, projectId, dependencies, mappedToken);
        return { success: true, data: task };
    }
);

export const updateTaskStatus = api(
    {
        method: 'PATCH',
        path: '/tasks/status',
    },
    async ({ id, status, headers }: { id: number; status: Status; headers: Record<string, string> }) => {
        console.log('Headers:', headers); // Log headers
        console.log('Body:', { id, status }); // Log body

        const decodedToken = await authenticateRequest(headers); // Authenticate the request
        console.log('Decoded Token:', decodedToken); // Log decoded token

        const updatedTask = await TaskService.updateTaskStatus(id, status);
        return { success: true, data: updatedTask };
    }
);