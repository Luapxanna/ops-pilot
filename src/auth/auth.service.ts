import { api } from 'encore.dev/api';
import { auth, getUserFromToken } from './auth'

if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is required');
}


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
            const cookies = res.headers.get('set-cookie');
            const token = cookies?.split(';')[0].split('=')[1];
            // Convert response to JSON
            const userData = await res.json();
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
    async ({ email, password}: { email: string; password: string}) => {
        try {
            const result = await auth.api.signInEmail({
                body: {
                    email,
                    password,
                },
            });

            return {
                success: true,
                user: result.user,
            };
        } catch (error) {
            console.error('Login error:', error);
            throw new Error('Invalid credentials');
        }
    }
);


export const getUser = api(
    {
        method: "GET",
        path: "/auth/user",
    },
    async ({ token }: { token: string }) => {
        const user = await getUserFromToken(token);
        if (!user) {
            throw new AuthenticationError('Invalid or expired token', 'FORBIDDEN');
        }
        return {
            success: true,
            user,
        };
    }
);