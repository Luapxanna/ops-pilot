import { getUserInfo, assignRole } from './user.service';
import { api } from 'encore.dev/api';
import { User } from './model';
import { ApiResponse } from '../shared/response';
import { getUserFromToken } from '../auth/auth';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
type Role = 'ORGADMIN' | 'PROJECTMANAGER' | 'EMPLOYEE';
export const getUserInfoAPI = api(
    {
        method: 'GET',
        path: '/users/info',
    },
    async ({ token }: { token: string }): Promise<ApiResponse<User>> => {
        try {
            if (!token) {
                return {
                    success: false,
                    message: 'No token provided'
                };
            }
            const user = await getUserInfo(token);
            if (!user) {
                return {
                    success: false,
                    message: 'User not found'
                };
            }
            return {
                success: true,
                message: 'User information retrieved successfully',
                data: user
            };
        } catch (error) {
            console.error('Error getting user info:', error);
            return {
                success: false,
                message: 'Failed to get user information'
            };
        }
    }
);

export const assignUserRole = api({
    method: "POST",
    path: "/admin/assign-project-manager",
}, async ({ userId, token, role }: { userId: string, token: string, role: Role}): Promise<ApiResponse<User>> => {
    try {
        const adminUser = await getUserFromToken(token);
        if (!adminUser) {
            return {
                success: false,
                message: 'User not found'
            };
        }
        if (adminUser.role !== 'ORGADMIN') {
            return {
                success: false,
                message: 'User is not an organization admin'
            };
        }

        const adminOrgId = adminUser.organizationId;

        const targetUser = await prisma.user.findUnique({
            where: { id: userId, organizationId: adminOrgId },
            select: { id: true }
        });

        if (!targetUser) {
            return {
                success: false,
                message: 'Target user not found in this organization'
            };
        }

        const user = await assignRole(userId, role);
        return {
            success: true,
            message: "Role assigned successfully",
            data: user
        };
    } catch (error) {
        console.error("Error assigning role:", error);
        return {
            success: false,
            message: "Failed to assign role"
        };
    }
});