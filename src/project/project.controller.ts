import { api } from 'encore.dev/api';
import { CreateProject, listProjects, GetProjectById } from './project.service';
import { authenticateRequest } from '../auth/auth.middleware';
import { ProjectData, ListProjectsRequest, ListProjectsResponse } from './model';

// Endpoint to create a project
export const createProject = api(
    {
        method: 'POST',
        path: '/projects',
    },
    async ({ name, description, organizationId, startDate, endDate, status, headers }: ProjectData & { headers: Record<string, string> }) => {
        console.log('Headers:', headers); // Log headers
        console.log('Headers Keys:', Object.keys(headers)); // Log all header keys
        console.log('Body:', { name, description, organizationId, startDate, endDate, status }); // Log body

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