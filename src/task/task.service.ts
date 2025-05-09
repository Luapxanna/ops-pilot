import { PrismaClient, Status } from '@prisma/client'; // Import the Status enum
import { authorizeRole } from '../auth/auth.middleware';
import { DecodedToken } from '../project/model';

const prisma = new PrismaClient();

async function assignTask(
    name: string,
    description: string,
    assigneeId: string,
    projectId: number,
    workflowId: number,
    dependencies: number[] = [], // Default to an empty array
    decodedToken: DecodedToken
) {
    if (!name || !description || !assigneeId || !projectId || !workflowId) {
        throw new Error('Missing required fields for task creation');
    }

    // Check if the user has the ProjectManager role
    await authorizeRole('PROJECTMANAGER')(decodedToken);

    try {
        // Ensure all dependencies exist
        const dependencyTasks = await prisma.task.findMany({
            where: { id: { in: dependencies } },
        });

        if (dependencyTasks.length !== dependencies.length) {
            throw new Error('Some dependencies do not exist');
        }

        const task = await prisma.task.create({
            data: {
                name,
                description,
                assigneeId,
                projectId, 
                workflowId,
                dependencies: {
                    connect: dependencies.map((id) => ({ id })),
                },
            },
        });
        return task;
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

        // Update the task status
        const updatedTask = await prisma.task.update({
            where: { id: taskId },
            data: { status: newStatus },
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