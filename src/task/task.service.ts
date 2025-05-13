import { PrismaClient, Status } from '@prisma/client'; // Import the Status enum
import { authorizeRole } from '../auth/auth.middleware';
import { DecodedToken } from '../project/model';
import { logAuditEntry } from '../audit/audit.service'; // Import the logAuditEntry function

const prisma = new PrismaClient();

export async function assignTask(
    taskId: number,
    assigneeId: string,
    decodedToken: DecodedToken
) {
    if (!taskId || !assigneeId) {
        throw new Error('Missing required fields for task assignment');
    }

    // Check if the user has the ProjectManager or OrgAdmin role
    await authorizeRole(['PROJECTMANAGER', 'ORGADMIN'])(decodedToken);

    try {
        // Fetch the task to ensure it exists
        const task = await prisma.task.findUnique({
            where: { id: taskId },
        });

        if (!task) {
            throw new Error('Task not found');
        }

        // Update the task with the assignee and set status to IN_PROGRESS
        const updatedTask = await prisma.task.update({
            where: { id: taskId },
            data: {
                assigneeId,
                status: 'IN_PROGRESS',
                inProgressAt: new Date(), // Set the timestamp for IN_PROGRESS
            },
        });

        // Log the update
        await logAuditEntry(
            'Task',
            'UPDATE',
            task, // Log the previous task state
            updatedTask,
            decodedToken.id
        );

        return updatedTask;
    } catch (error) {
        console.error('Error assigning task:', error);
        throw new Error('Failed to assign task');
    }
}

export async function updateTaskStatus(taskId: number, newStatus: Status, decodedToken: DecodedToken) {
    const previousTask = await prisma.task.findUnique({ where: { id: taskId } });

    const updatedTask = await prisma.task.update({
        where: { id: taskId },
        data: {
            status: newStatus,
            inProgressAt: newStatus === 'IN_PROGRESS' ? new Date() : previousTask?.inProgressAt,
            completedAt: newStatus === 'COMPLETED' ? new Date() : previousTask?.completedAt,
        },
    });

    // Log the update
    await logAuditEntry(
        'Task',
        'UPDATE',
        previousTask,
        updatedTask,
        decodedToken.id
    );

    return updatedTask;
}

export const TaskService = {
  assignTask,
  updateTaskStatus,
};