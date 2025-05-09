import { PrismaClient } from '@prisma/client';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import jwt from 'jsonwebtoken';
import { api } from 'encore.dev/api';
const prisma = new PrismaClient();

if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is required');
}


const JWT_SECRET = process.env.JWT_SECRET;

function generateJwtToken(user: any) {
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: user.role,
        },
        JWT_SECRET,
        { expiresIn: '1h' } 
    );
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
});

export class AuthenticationError extends Error {
    constructor(message: string, public code: string) {
        super(message);
    }
}

export const register = api(
    {
        method: "POST",
        path: "/auth/register",
    },
    async ({ email, password, name, organizationId }: { 
        email: string; 
        password: string;
        name: string;
        organizationId: number;
    }) => {
        try {
            const res = await auth.api.signUpEmail({ 
                body: {
                    name,
                    email,
                    password,
                    organizationId
                },
                asResponse: true
            });

            // Extract the token from the response headers


            // Convert response to JSON
            const userData = await res.json();
            const token = generateJwtToken(userData); // Generate JWT token
            return { 
                success: true,
                message: "User registered successfully",
                data: {
                    token,
                    user: userData
                }
            };
        } catch (error) {
            console.error('Registration error:', error);
            throw new Error('Failed to register user');
        }
    }
);

export const login = api(
    {
        method: "POST",
        path: "/auth/login",
    },
    async ({ email, password,  }: { email: string; password: string }) => {
        try {
            const result = await auth.api.signInEmail({ 
                body: { 
                    email, 
                    password 
                }
            });
            const token = generateJwtToken(result.user); // Generate JWT token
            return { 
                success: true, 
                token: result.token,
                user: result.user 
            };
        } catch (error) {
            console.error('Login error:', error);
            throw new Error('Invalid credentials');
        }
    }
);



