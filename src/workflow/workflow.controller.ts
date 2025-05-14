import { api }  from 'encore.dev/api';
import { WorkflowService } from './workflow.service';
import { DecodedToken } from '../project/model';
import { authenticateRequest } from '../auth/auth.middleware';
export const createWorkflow = api(
    {
        method: 'POST',
        path: '/workflows',
    },
    async ({ name, description, tasks, projectId, headers }: { name: string; description: string; tasks: any[]; projectId: number; headers: Record<string, string> }) => {
        console.log('Headers:', headers); // Log headers
        console.log('Body:', { name, description, tasks, projectId }); // Log body

        const decodedToken = await authenticateRequest(headers); // Authenticate and decode the token
        console.log('Decoded Token:', decodedToken); // Log decoded token

        const mappedToken: DecodedToken = {
            id: decodedToken.user.id,
            role: decodedToken.user.role,
            organizationId: decodedToken.user.organizationId,
        };
        const workflow = await WorkflowService.createWorkflow(name, description, projectId, tasks, mappedToken);
        return { success: true, data: workflow };
    }
);
export const listWorkflows = api(
    {
        method: 'GET',
        path: '/workflows',
    },
    async ({ headers }: { headers: Record<string, string> }) => {
        console.log('Headers:', headers); // Log headers

        const decodedToken = await authenticateRequest(headers); // Authenticate and decode the token
        console.log('Decoded Token:', decodedToken); // Log decoded token
        const mappedToken: DecodedToken = {
            id: decodedToken.user.id,
            role: decodedToken.user.role,
            organizationId: decodedToken.user.organizationId,
        };
        const workflows = await WorkflowService.listWorkflows(mappedToken);
        return { success: true, data: workflows };
    }
);

export const getWorkflowById = api(
    {
        method: 'POST',
        path: '/workflows/:id',
    },
    async ({ id, headers }: { id: number; headers: Record<string, string> }) => {
        console.log('Headers:', headers); // Log headers
        console.log('Workflow ID:', id); // Log workflow ID

        const decodedToken = await authenticateRequest(headers); // Authenticate and decode the token
        console.log('Decoded Token:', decodedToken); // Log decoded token
        const mappedToken: DecodedToken = {
            id: decodedToken.user.id,
            role: decodedToken.user.role,
            organizationId: decodedToken.user.organizationId,
        };
        const workflow = await WorkflowService.getWorkflowById(id, mappedToken);
        return { success: true, data: workflow };
    }
);