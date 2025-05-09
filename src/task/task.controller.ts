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
    async ({
        params: {
            name,
            description,
            assigneeId,
            projectId,
            workflowId,
            dependencies = [], // Default to an empty array
        },
        headers,
    }: {
        params: {
            name: string;
            description: string;
            assigneeId: string;
            projectId: number;
            workflowId: number;
            dependencies?: number[];
        };
        headers: Record<string, string>;
    }) => {
        if (!name || !description || !assigneeId || !projectId || !workflowId) {
            throw new Error('Missing required fields for task creation');
        }

        const rawToken = await authenticateRequest(headers); // Authenticate the request
        const decodedToken: DecodedToken = {
            id: rawToken.user.id,
            role: rawToken.user.role,
            organizationId: rawToken.user.organizationId,
        };

        const task = await TaskService.assignTask(
            name,
            description,
            assigneeId,
            workflowId,
            projectId,
            dependencies,
            decodedToken
        );

        return {
            success: true,
            data: task,
        };
    }
);

export const updateTaskStatus = api(
    {
        method: 'PATCH',
        path: '/tasks/status',
    },
    async ({
         id, status , headers,
    }: {
       id: number; status: Status ;
        headers: Record<string, string>;
    }) => {
        if (!status) {
            throw new Error('The status field is required and cannot be undefined');
        }

        const decodedToken = await authenticateRequest(headers); // Authenticate the request

        // Update the task status
        const updatedTask = await TaskService.updateTaskStatus(id, status);

        return {
            success: true,
            data: updatedTask,
        };
    }
);