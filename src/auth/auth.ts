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
        disableSessionRefresh: false
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

export async function validateToken(token: string) {
    try {

      const storedJWKS = {
        keys: [{
            kty: 'RSA',
            n: 'kshXlgEhVSEI5iY52chQZub04y2oWPHEFRc8FzFglNN-tg0BMUURFgidwKqZoOeflxba9s7KWcD6ZDNAet2A5Emd47dPHJFS-mE80MLr2LSm24QwYXgGMVGu8lDCDH_JnC_4ibCGTrBP9cIjqt1le37iFkpOthOJEZ7zmsZHeclWaDVKxHrnw0awE1njExs-jRxbcL2e9SWy8HvDGsjZ8Hv46TN_gsn4l_O9iJPRcrbl6h9KXBj4KXScnYScEyDy0OXe7-0iVl8GGOc8kIcufVuNDizSJBQBsmzeT3t837X1i9IgFmi-q2JCULteMkA7o5oAiXsaQM-YyYsqHP0AAQ',
            e: 'AQAB'
        }]
      };
      const JWKS = createLocalJWKSet({
        keys: storedJWKS.keys,
      })
      
      const { payload } = await jwtVerify(token, JWKS, {
        issuer: 'http://localhost:3000', 
        audience: 'http://localhost:3000',
      })
      return payload
    } catch (error) {
      console.error('Token validation failed:', error)
      throw error
    }
  }
   