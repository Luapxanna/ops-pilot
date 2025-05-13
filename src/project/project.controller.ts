import { api } from 'encore.dev/api';
import { CreateProject, listProjects, GetProjectById, updateProjectStatus } from './project.service';
import { authenticateRequest } from '../auth/auth.middleware';
import { ProjectData, ListProjectsRequest, ListProjectsResponse, DecodedToken } from './model';

// Endpoint to create a project
export const createProject = api(
    {
        method: 'POST',
        path: '/projects',
    },
    async ({ name, description, organizationId, status, headers, startDate, endDate }: ProjectData & { headers: Record<string, string> }) => {
        console.log('Headers:', headers); // Log headers
        console.log('Headers Keys:', Object.keys(headers)); // Log all header keys
        console.log('Body:', { name, description, organizationId, status }); // Log body

        const decodedToken = await authenticateRequest(headers); // Authenticate and decode the token
        console.log('Decoded Token:', decodedToken); // Log decoded token

        const project = await CreateProject(
            { name, description, organizationId, startDate, endDate, status },
            decodedToken.user
        );
        return { success: true, project };
    }
);

// Endpoint to get a project by ID
export const getProjectById = api(
    {
        method: 'GET',
        path: '/projects/:id',
    },
    async ({ id, headers }: { id: number; headers: Record<string, string> }) => {
        const decodedToken = await authenticateRequest(headers); // Authenticate and decode the token

        const project = await GetProjectById(id, decodedToken.user);
        return { success: true, project };
    }
);

// Endpoint to list all projects
export const listallProjects = api(
    {
        method: 'GET',
        path: '/projects',
    },
    async ({ headers }: { headers: Record<string, string> }) => {
        console.log('Headers:', headers); // Log headers

        const decodedToken = await authenticateRequest(headers); // Authenticate and decode the token
        console.log('Decoded Token:', decodedToken); // Log decoded token

        const projects = await listProjects(decodedToken.user);
        return { success: true, projects };
    }
);

// Endpoint to update project status
export const updateProjectStatusAPI = api(
    {
        method: 'PATCH',
        path: '/projects/status',
    },
    async ({ id, status, headers }: { id: number; status: string; headers: Record<string, string> }) => {
        const decodedToken = await authenticateRequest(headers); // Authenticate the request
        const newStatus  = status;
        const projectId = Number(id); // Ensure `id` is parsed as a number
        if (!newStatus) {
            throw new Error('New status is required');
        }

        const mappedToken: DecodedToken = {
            id: decodedToken.user.id,
            role: decodedToken.user.role,
            organizationId: decodedToken.user.organizationId,
        };
        const updatedProject = await updateProjectStatus(projectId, newStatus, mappedToken);
        return { success: true, data: updatedProject };
    }
);