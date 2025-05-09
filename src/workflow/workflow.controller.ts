import { api }  from 'encore.dev/api';
import { WorkflowService } from './workflow.service';
import { DecodedToken } from '../project/model';
export const createWorkflow = api(
    {
        method: 'POST',
        path: '/workflows',
    },
    async ({
         name, description, tasks, projectId, decodedToken

    }: { name: string, description: string, tasks: any[], projectId: number, decodedToken: DecodedToken }) => {
        if (!name || !description || !projectId) {
            throw new Error('Missing required fields for workflow creation');
        }

        const workflow = await WorkflowService.createWorkflow(
            name,
            description,
            projectId,
            tasks,
            decodedToken,
        );

        return {
            success: true,
            data: workflow,
        };
    }
);
export const listWorkflows = api(
    {
        method: 'GET',
        path: '/workflows',
    },
    async ({ decodedToken }: { decodedToken: DecodedToken }) => {
        const workflows = await WorkflowService.listWorkflows(decodedToken);
        return {
            success: true,
            data: workflows,
        };
    }
);

export const getWorkflowById = api(
    {
        method: 'GET',
        path: '/workflows/:id',
    },
    async ({ id, decodedToken }: { id: number, decodedToken: DecodedToken }) => {   
        const workflow = await WorkflowService.getWorkflowById(id, decodedToken);
        return {
            success: true,
            data: workflow,
        };
    }
);