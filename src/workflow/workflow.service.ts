import { PrismaClient, Status } from '@prisma/client';
import { authorizeRole } from '../auth/auth.middleware';
import { DecodedToken } from '../project/model';

const prisma = new PrismaClient();

export async function createWorkflow(
    name: string,
    description: string,
    projectId: number,
    tasks: { name: string; description: string; dependencyIds?: number[] }[],
    decodedToken: DecodedToken
) {
    const workflow = await prisma.workflow.create({
        data: {
            name,
            description,
            projectId,
            organizationId: decodedToken.organizationId,
            Task: {
                create: tasks.map((task) => ({
                    name: task.name,
                    description: task.description,
                    status: 'NOT_STARTED',
                    dependencies: task.dependencyIds
                        ? { connect: task.dependencyIds.map((id) => ({ id })) }
                        : undefined,
                })),
            },
        },
    });

    // Log the creation
    await logAuditEntry(
        'Workflow',
        'CREATE',
        null,
        workflow,
        decodedToken.id
    );

    return workflow;
}

// New function to list workflows
export async function listWorkflows(decodedToken: DecodedToken) {
    // Check if the user has the ProjectManager or OrgAdmin role
    await authorizeRole(['PROJECTMANAGER', 'ORGADMIN'])(decodedToken);

    try {
        const workflows = await prisma.workflow.findMany({
            where: {
                organizationId: decodedToken.organizationId, // Filter by organization
            },
            include: {
                Task: true, // Optionally include tasks in the response
            },
        });
        return workflows;
    } catch (error) {
        console.error('Error listing workflows:', error);
        throw new Error('Failed to list workflows');
    }
}

export async function getWorkflowById(id: number, decodedToken: DecodedToken) {
    // Check if the user has the ProjectManager or OrgAdmin role
    await authorizeRole(['PROJECTMANAGER', 'ORGADMIN'])(decodedToken);

    try {
        const workflow = await prisma.workflow.findUnique({
            where: { id },
            include: {
                Task: true, // Optionally include tasks in the response
            },
        });
        return workflow;
    } catch (error) {
        console.error('Error fetching workflow:', error);
        throw new Error('Failed to fetch workflow');
    }
}

export const WorkflowService = {
    createWorkflow,
    listWorkflows,
    getWorkflowById,
};