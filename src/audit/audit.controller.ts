import { api } from 'encore.dev/api';
import { logAuditEntry, rollbackChange } from './audit.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * API to fetch all audit logs
 */
export const getAuditLogs = api(
    {
        method: 'GET',
        path: '/audit/logs',
    },
    async () => {
        try {
            const auditLogs = await prisma.auditLog.findMany({
                orderBy: { timestamp: 'desc' }, // Sort by most recent
            });

            return {
                success: true,
                data: auditLogs,
            };
        } catch (error) {
            console.error('Error fetching audit logs:', error);
            throw new Error('Failed to fetch audit logs');
        }
    }
);

/**
 * API to log an audit entry: no need since it is called in other services
 */


/**
 * API to rollback a change based on an audit log entry
 */
export const rollbackAuditLog = api(
    {
        method: 'POST',
        path: '/audit/rollback',
    },
    async ({ body }: { body: { auditLogId: number } }) => {
        try {
            const { auditLogId } = body;

            await rollbackChange(auditLogId);

            return {
                success: true,
                message: 'Rollback completed successfully',
            };
        } catch (error) {
            console.error('Error rolling back change:', error);
            if (error instanceof Error) {
                throw new Error('Failed to rollback change.', error);
            }
        }
    }
);