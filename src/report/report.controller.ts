import { api } from 'encore.dev/api';
import { exportReports } from './report.service';

/**
 * Export Reports API
 */
export const exportReportsAPI = api(
    {
        method: 'POST', // Change to POST
        path: '/reports/export', // Keep the same path
    },
    async ({ body }: { body: { format: string; filter?: string } }) => {
        console.log('Received body:', body); // Log the request body

        const { format, filter } = body;

        try {
            const parsedFilter = filter ? JSON.parse(filter) : undefined; // Parse filter if provided
            console.log('Parsed filter:', parsedFilter); // Log the parsed filter

            const { data, contentType, fileName } = await exportReports(format, parsedFilter);

            return {
                headers: {
                    'Content-Disposition': `attachment; filename=${fileName}`,
                    'Content-Type': contentType,
                },
                body: data,
            };
        } catch (error) {
            console.error('Error exporting reports:', error);
            throw new Error('Failed to export reports. Please check your request.');
        }
    }
);