import { api } from 'encore.dev/api';
import { auth, getUserFromToken } from './auth'



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
    async ({ email, password }: { email: string; password: string }) => {
        try {
            const res = await auth.api.signInEmail({
                body: {
                    email,
                    password,
                },
                asResponse: true, // Get the full response to extract the token
            });

            const cookies = res.headers.get('set-cookie'); // Extract cookies from the response
            const token = cookies?.split(';')[0].split('=')[1]; // Extract the JWT token from the cookie

            const userData = await res.json(); // Convert response to JSON

            return {
                success: true,
                message: "Login successful",
                data: {
                    token, // Return the JWT token
                    user: userData, // Return the user data
                },
            };
        } catch (error) {
            console.error('Login error:', error);
            throw new Error('Invalid credentials');
        }
    }
);

export const logout = api(
    {
        method: "POST",
        path: "/auth/logout",
    },
    async ({ token }: { token: string }) => {
        try {
            // Use the token to sign out the user
            await auth.api.signOut({
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            return {
                success: true,
                message: "Logged out successfully.",
            };
        } catch (error) {
            console.error("Logout error:", error);
            throw new Error("Failed to log out. Please try again.");
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

