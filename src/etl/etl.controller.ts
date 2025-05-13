import { api } from 'encore.dev/api';
import { ExternalLogService } from './etl.service';
import fs from 'fs/promises';
import path from 'path';

export const uploadExternalLogs = api(
    {
        method: 'POST',
        path: '/external-logs/upload',
    },
    async ({ body, headers }: { body: { file: string; source?: string }; headers: Record<string, string> }) => {
        console.log('Headers:', headers); // Log headers
        console.log('Request Body:', body); // Log the request body

        const { file, source } = body;

        if (!file) {
            throw new Error('No file uploaded');
        }

        const sourceName = source || 'unknown';

        try {
            // Ensure the uploads directory exists
            const uploadsDir = path.join(process.cwd(), 'uploads');
            await fs.mkdir(uploadsDir, { recursive: true }); // Ensure the directory exists

            // Decode the base64-encoded file content
            const filePath = path.join(uploadsDir, `external-log-${Date.now()}.csv`);
            console.log('Saving file at:', filePath);

            const fileBuffer = Buffer.from(file, 'base64');

            console.log('Decoded File Buffer:', fileBuffer.toString()); // Log the decoded file content

            await fs.writeFile(filePath, fileBuffer);

            console.log('File written to:', filePath); // Log the file path

            // Process the CSV file
            await ExternalLogService.processCSV(filePath, sourceName);


            return { success: true, message: 'File processed successfully' };
        } catch (error) {
            console.error('Error processing file:', error);
            throw new Error('Failed to process the file');
        }
    }
);