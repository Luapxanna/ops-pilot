import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface Organization {
    id: number;
    name: string;
    description: string;
    createdAt?: Date; // Optional if not always returned
}

export async function createOrganization(name: string, description: string): Promise<Organization> {
    try {

        const newOrganization = await prisma.organization.create({
            data: {
                name,
                description,
            },
            select: {
                id: true,
                name: true,
                description: true,
                createdAt: true,
            },
        });
        return newOrganization;
    } catch (error) {
        console.error("Error creating organization:", error);
        throw error;
    }
}


export async function findAll(): Promise<Organization[]> {
    try {
        return await prisma.organization.findMany({
            select: {
                id: true,
                name: true,
                description: true,
                createdAt: true,
            }
        });
    } catch (error) {
        console.error('List organizations error:', error);
        throw new Error('Failed to fetch organizations');
    }
}


    

