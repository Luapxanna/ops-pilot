    import { PrismaClient } from '@prisma/client';
    import csvParser from 'csv-parser';
    import fs from 'fs';

    const prisma = new PrismaClient();

    async function processCSV(filePath: string, source: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const rows: any[] = [];
    
            fs.createReadStream(filePath)
                .pipe(csvParser())
                .on('data', (row) => {
                    rows.push(row); // Just collect rows here
                })
                .on('end', async () => {
                    console.log('CSV Parsing Completed. Raw Rows:', rows);
    
                    try {
                        const logs: any[] = [];
    
                        for (const row of rows) {
                            try {
                                const task = await prisma.task.findFirst({
                                    where: { projectId: row.projectId },
                                });
    
                                if (task) {
                                    logs.push({
                                        taskId: task.id,
                                        userId: row.userId,
                                        date: new Date(row.date),
                                        hours: parseFloat(row.hours),
                                        source,
                                    });
                                } else {
                                    console.warn('No matching task for row:', row);
                                }
                            } catch (err) {
                                console.error('Error looking up task:', err);
                            }
                        }
    
                        for (const log of logs) {
                            await prisma.externalLog.create({ data: log });
                        }
    
                        console.log('Inserted logs into ExternalLog:', logs.length);
                        resolve();
                    } catch (error) {
                        console.error('Error inserting logs:', error);
                        reject(error);
                    }
                })
                .on('error', (error) => {
                    console.error('CSV stream error:', error);
                    reject(error);
                });
        });
    }
    
    export const ExternalLogService = {
        processCSV,
    };