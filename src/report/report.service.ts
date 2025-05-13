import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Fetch and Export Reports
 * @param format - The export format ('csv' or 'json')
 * @param filter - Optional filter criteria
 * @returns The exported data as a string (CSV or JSON)
 */
export async function exportReports(format: string,   filter?: Record<string, any>
): Promise<{ data: string; contentType: string; fileName: string }> {
    const { Parser } = await import('json2csv'); // Dynamically import json2csv

    // Fetch data from the database (apply filters if provided)
    const data = await prisma.task.findMany({
        where: filter ?? {}, 
        select: {
            id: true,
            name: true,
            status: true,
            duedate: true,
            assigneeId: true,
        },
    });

    if (format === 'csv') {
        // Convert data to CSV
        const parser = new Parser();
        const csv = parser.parse(data);

        return {
            data: csv,
            contentType: 'text/csv',
            fileName: 'report.csv',
        };
    } else if (format === 'json') {
        // Convert data to JSON
        return {
            data: JSON.stringify(data, null, 2),
            contentType: 'application/json',
            fileName: 'report.json',
        };
    } else {
        throw new Error('Invalid format. Supported formats are "csv" and "json".');
    }
}