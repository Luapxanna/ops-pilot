import { authorizeRole } from '../auth/auth.middleware';
import { PrismaClient } from '@prisma/client';
import { ProjectData, DecodedToken } from './model';
import { logAuditEntry } from '../audit/audit.service';
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
                startDate: projectData.startDate, // Default to null if not provided
                endDate: projectData.endDate, // Default to null if not provided
            },
        });

        // Log the creation
        await logAuditEntry(
            'Project',
            'CREATE',
            null, // No previous values for create
            project,
            decodedToken.id // Assuming decodedToken contains userId
        );

        return project;
    } catch (error) {
        if (error instanceof Error) {
        throw new Error(`Failed to create project: ${error.message}`);
        }
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
        await authorizeRole(['PROJECTMANAGER', 'ORGADMIN'])(decodedToken);

        const previousProject = await prisma.project.findUnique({
            where: { id: projectId },
        });

        if (!previousProject) {
            throw new Error(`Project with ID ${projectId} not found`);
        }

        const updatedProject = await prisma.project.update({
            where: { id: projectId },
            data: {
                status: newStatus,
                startDate: newStatus.toLowerCase() === 'inprogress' ? new Date() : previousProject.startDate,
                endDate: newStatus.toLowerCase() === 'completed' ? new Date() : previousProject.endDate,
            },
        });

        // Log the update
        await logAuditEntry(
            'Project',
            'UPDATE',
            previousProject,
            updatedProject,
            decodedToken.id
        );

        return updatedProject;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to update project status: ${error.message}`);
        }
    }
}
