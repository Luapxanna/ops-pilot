import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Log an audit entry
 * @param target - The name of the table or entity being modified
 * @param action - The action performed (CREATE, UPDATE, DELETE)
 * @param previousValues - The previous state of the record
 * @param newValues - The new state of the record
 * @param userId - The ID of the user performing the action
 */
export async function logAuditEntry(
    target: string,
    action: 'CREATE' | 'UPDATE' | 'DELETE',
    previousValues: Record<string, any> | null,
    newValues: Record<string, any> | null,
    userId: string
) {
    const changeSummary = generateChangeSummary(previousValues, newValues);

    await prisma.auditLog.create({
        data: {
            target,
            action,
            previousValue: previousValues ? previousValues : Prisma.JsonNull,
            newValue: newValues ? newValues : Prisma.JsonNull,
            userId,
            data: changeSummary, // Store the summary of changes
        },
    });
}

/**
 * Generate a summary of changes between previous and new values
 * @param previousValues - The previous state of the record
 * @param newValues - The new state of the record
 * @returns A JSON string summarizing the changes
 */
function generateChangeSummary(previousValues: Record<string, any> | null, newValues: Record<string, any> | null): string {
    if (!previousValues || !newValues) return '';

    const changes: Record<string, { old: any; new: any }> = {};

    for (const key in newValues) {
        if (previousValues[key] !== newValues[key]) {
            changes[key] = {
                old: previousValues[key],
                new: newValues[key],
            };
        }
    }

    return JSON.stringify(changes);
}

/**
 * Rollback a change based on an audit log entry
 * @param auditLogId - The ID of the audit log entry
 */
export async function rollbackChange(auditLogId: number) {
    const auditLog = await prisma.auditLog.findUnique({ where: { id: auditLogId } });

    if (!auditLog) {
        throw new Error('Audit log entry not found');
    }

    if (auditLog.action === 'DELETE') {
        // Recreate the deleted record
        const model = prisma[auditLog.target as keyof typeof prisma] as any;
        if (!model || typeof model.create !== 'function') {
            throw new Error(`Model ${auditLog.target} is not valid or does not support creation.`);
        }
        await model.create({
            data: auditLog.previousValue as Prisma.JsonObject,
        });
    } else if (auditLog.action === 'UPDATE') {
        // Restore the previous state of the record
        await (prisma[auditLog.target as keyof typeof prisma] as any).update({
            where: { id: auditLog.data }, // Assuming `data` contains the record ID
            data: auditLog.previousValue as Prisma.JsonObject,
        });
    } else {
        throw new Error('Rollback not supported for this action');
    }
}