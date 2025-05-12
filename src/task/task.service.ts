import { PrismaClient, Status } from '@prisma/client'; // Import the Status enum
import { authorizeRole } from '../auth/auth.middleware';
import { DecodedToken } from '../project/model';

const prisma = new PrismaClient();

async function assignTask(
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

        return updatedTask;
    } catch (error) {
        console.error('Error assigning task:', error);
        throw new Error('Failed to assign task');
    }
}

async function updateTaskStatus(taskId: number, newStatus: Status) {
    if (!newStatus) {
        throw new Error('The new status is undefined or invalid');
    }

    try {
        // Fetch the task and its dependencies
        const task = await prisma.task.findUnique({
            where: { id: taskId },
            include: { dependencies: true },
        });

        if (!task) {
            throw new Error('Task not found');
        }

        // If the new status is IN_PROGRESS, ensure all dependencies are COMPLETED
        if (newStatus === Status.IN_PROGRESS) {
            const allDependenciesCompleted = task.dependencies.every(
                (dependency) => dependency.status === Status.COMPLETED
            );

            if (!allDependenciesCompleted) {
                throw new Error('Cannot mark task as IN_PROGRESS because not all dependencies are COMPLETED');
            }
        }

        // Prepare data for updating the task
        const updateData: any = { status: newStatus };

        if (newStatus === Status.IN_PROGRESS) {
            updateData.inProgressAt = new Date(); // Set the timestamp for IN_PROGRESS
        } else if (newStatus === Status.COMPLETED) {
            updateData.completedAt = new Date(); // Set the timestamp for COMPLETED
        }

        // Update the task status
        const updatedTask = await prisma.task.update({
            where: { id: taskId },
            data: updateData,
        });

        return updatedTask;
    } catch (error) {
        console.error('Error updating task status:', error);
        throw new Error('Failed to update task status');
    }
}

export const TaskService = {
  assignTask,
  updateTaskStatus,
};