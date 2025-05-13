import { authorizeRole } from '../auth/auth.middleware';
import { PrismaClient } from '@prisma/client';
import { ProjectData, DecodedToken } from './model';
export const prisma = new PrismaClient();

export async function CreateProject(projectData: ProjectData, decodedToken: DecodedToken) {
    try {
        // Check if the user has either the ProjectManager or OrgAdmin role
        await authorizeRole(['PROJECTMANAGER', 'ORGADMIN'])(decodedToken);

        // Validate required fields
        if (!projectData.name || !projectData.description || !projectData.organizationId) {
            throw new Error('Missing required fields: name, description, or organizationId');
        }

        const project = await prisma.project.create({
            data: {
                ...projectData,
                status: projectData.status || 'Pending', // Default to 'Pending' if not provided
            },
        });
        return project;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to create project: ${error.message}`);
        }
        throw error;
    }
}

export async function GetProjectById(id: number, decodedToken: DecodedToken) {
  try {
    // Check if the user has the ProjectManager role
    await authorizeRole(['PROJECTMANAGER', 'ORGADMIN'])(decodedToken);

    const project = await prisma.project.findUnique({
      where: { id },
    });
    return project;
  } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to fetch project: ${error.message}`);
        }
    }
}

export async function listProjects(decodedToken: DecodedToken) {
  try {
    // Check if the user has the ProjectManager role
    await authorizeRole(['PROJECTMANAGER', 'ORGADMIN'])(decodedToken);

    const projects = await prisma.project.findMany();
    return projects;
  } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to fetch projects: ${error.message}`);
        }
    }
}

export async function updateProjectStatus(
    projectId: number,
    newStatus: string,
    decodedToken: DecodedToken
) {
    try {
        // Check if the user has either the ProjectManager or OrgAdmin role
        await authorizeRole(['PROJECTMANAGER', 'ORGADMIN'])(decodedToken);

        // Fetch the current project
        const project = await prisma.project.findUnique({
            where: { id: projectId },
        });

        if (!project) {
            throw new Error(`Project with ID ${projectId} not found`);
        }

        // Update the project status and set dates based on the new status
        const updatedProject = await prisma.project.update({
            where: { id: projectId },
            data: {
                status: newStatus,
                startDate: newStatus.toLowerCase() === 'inprogress' ? new Date() : project.startDate,
                endDate: newStatus.toLowerCase() === 'completed' ? new Date() : project.endDate,
            },
        });

        return updatedProject;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to update project status: ${error.message}`);
        }
        throw error;
    }
}