import { User } from './model';
import { getUserFromToken } from '../auth/auth';
import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

export async function getUserInfo(token: string): Promise<User | null> {
    console.log('Received token:', token);
    const user = await getUserFromToken(token);
    console.log('Decoded user:', user);
    if (!user) return null;
    return user;
}

export const assignRole = async (userId: string, role: Role) => {
    const prisma = new PrismaClient();
    const user = await prisma.user.update({
        where: { id: userId },
        data: { role }
    });
    return user;
}