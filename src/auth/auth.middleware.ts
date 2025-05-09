import jwt from 'jsonwebtoken';
import { AuthenticationError } from './auth.service'; // adjust path

const JWT_SECRET = process.env.JWT_SECRET || 'b1229abfe844733c4b87d45937ca6a49';

export function authenticateRequest(req: Request) {
    const authHeader = req.headers.get('authorization');
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        throw new AuthenticationError('Access token is missing or invalid', 'UNAUTHORIZED');
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return decoded; // e.g., { id, email, role }
    } catch (error) {
        console.error('Token verification error:', error);
        throw new AuthenticationError('Invalid or expired token', 'FORBIDDEN');
    }
}
