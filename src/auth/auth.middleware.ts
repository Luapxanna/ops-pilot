import { AuthenticationError } from './auth.service'; // Adjust path
import { verifyToken } from './auth'; // Replace with the actual plugin import

export async function authenticateRequest(headers: Record<string, string | undefined>) {
    const authHeader = headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        throw new AuthenticationError('Access token is missing or invalid', 'UNAUTHORIZED');
    }

    try {
        // Use the plugin's method to verify and decode the token
        const decoded = await verifyToken(token); // Await the result
        return decoded; // e.g., { userId, user: { id, email, role, organizationId } }
    } catch (error) {
        console.error('Token verification error:', error);
        throw new AuthenticationError('Invalid or expired token', 'FORBIDDEN');
    }
}

export function authorizeRole(requiredRole: string) {
    return async (decodedToken: { id: string; role: string }) => {
        if (decodedToken.role !== requiredRole) {
            throw new AuthenticationError('Access denied: insufficient permissions', 'FORBIDDEN');
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