import fs from 'fs/promises';
import path from 'path';
import { api } from 'encore.dev/api';
import { exportReports } from './report.service';

/**
 * Export Reports API
 */
export const exportReportsAPI = api(
    {
        method: 'POST',
        path: '/reports/export',
    },
    async ({ body }: { body: { format: string; filter?: string } }) => {
        console.log('Received body:', body);

        const { format, filter } = body;

        try {
            const parsedFilter = filter ? JSON.parse(filter) : undefined;
            console.log('Parsed filter:', parsedFilter);

            const { data, contentType, fileName } = await exportReports(format, parsedFilter);

            // Save the file to the server
            const filePath = path.join(process.cwd(), 'ExportedReports', fileName);
            await fs.writeFile(filePath, data);

            console.log(`Report saved to: ${filePath}`);

            return {
                success: true,
                message: `Report saved to ${filePath}`,
            };
        } catch (error) {
            console.error('Error exporting reports:', error);
            throw new Error('Failed to export reports. Please check your request.');
        }
    }
);