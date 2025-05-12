import { AuthenticationError } from './auth.service'; // Adjust path
import { verifyToken } from './auth'; // Replace with the actual plugin import

export async function authenticateRequest(headers: Record<string, string | undefined>) {
    // Normalize header keys to handle cases like 'Authorization ' or different casing
    const normalizedHeaders = Object.keys(headers).reduce((acc, key) => {
        acc[key.trim().toLowerCase()] = headers[key];
        return acc;
    }, {} as Record<string, string | undefined>);

    const authHeader = normalizedHeaders['authorization']; // Use normalized key
    console.log('Authorization Header:', authHeader); // Log the header

    const token = authHeader && authHeader.split(' ')[1];
    console.log('Extracted Token:', token); // Log the extracted token

    if (!token) {
        throw new AuthenticationError('Access token is missing or invalid', 'UNAUTHORIZED');
    }

    try {
        const decoded = await verifyToken(token); // Verify the token
        console.log('Decoded Token:', decoded); // Log decoded token
        return decoded;
    } catch (error) {
        console.error('Token verification error:', error);
        throw new AuthenticationError('Invalid or expired token', 'FORBIDDEN');
    }
}

export function authorizeRole(requiredRoles: string | string[]) {
    return async (decodedToken: { id: string; role: string }) => {
        const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
        console.log('Roles:', roles); // Log the required roles
        console.log('Decoded Token Role:', decodedToken.role); // Log the decoded token role
        if (!roles.includes(decodedToken.role)) {
            throw new Error('Access denied: insufficient permissions');
        }
    };
}

export function decodeToken(authorizationHeader: string): any {
    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
        throw new AuthenticationError('Authorization header is missing or invalid', 'UNAUTHORIZED');
    }

    const token = authorizationHeader.split(' ')[1];
    try {
        const decoded = verifyToken(token);
        return decoded;
    } catch (error) {
        throw new AuthenticationError('Invalid or expired token', 'FORBIDDEN');
    }
}