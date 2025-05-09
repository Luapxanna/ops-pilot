import { PrismaClient } from '@prisma/client';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { jwt } from "better-auth/plugins"
import { jwtVerify, createLocalJWKSet } from 'jose'
import { AuthenticationError } from './auth.service';

const prisma = new PrismaClient();

if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is required');
}


export const auth = betterAuth({
    secret: process.env.BETTER_AUTH_SECRET || 'LzxzeGC88273hjQ1QYHSXKOl6OXKT9L5',
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    user: {
        modelName: "User",
        additionalFields: {
            role: {
                type: "string",
                required: false,
                defaultValue: "EMPLOYEE",
                input: false,
            },
            organizationId: {
                type: "number",
                required: true,
            },
        },
    },
    emailAndPassword: {
        enabled: true,
        autoSignIn: false,
    },
    session: {
        disableSessionRefresh: true
    },
    plugins: [
        jwt(),
    ],
});

export const verifyToken = async (token: string) => {
    try {
        console.log('Verifying token...');
        const session = await prisma.session.findFirst({
            where: { token },
            select: {
                userId: true,
                user: {
                    select: {
                        id: true,
                        email: true,
                        role: true,
                        organizationId: true,
                    }
                }
            }
        });

        if (!session) {
            console.log('Session not found');
            throw new AuthenticationError('Session not found or token is invalid', 'UNAUTHORIZED');
        }

        console.log('Found session:', session);
        return {
            userId: session.userId,
            user: session.user
        };
    } catch (error) {
        console.error('Token verification error:', error);
        throw new AuthenticationError('Invalid or expired token', 'FORBIDDEN');
    }
};


export const getUserFromToken = async (token: string) => {
    try {
        const decoded = await verifyToken(token);
        if (!decoded) {
            console.log('Token verification failed');
            return null;
        }

        return decoded.user;
    } catch (error) {
        console.error('Error getting user from token:', error);
        return null;
    }
};
