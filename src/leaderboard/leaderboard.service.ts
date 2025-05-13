import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Fetch leaderboard data and calculate rankings.
 * @returns Leaderboard data
 */
export async function fetchLeaderboard() {
    // Fetch users with completed tasks and time logs
    const data = await prisma.user.findMany({
        include: {
            Task: {
                where: { status: 'COMPLETED' },
            },
            TimeLog: true,
        },
    });

    // Calculate leaderboard
    return calculateLeaderboard(data);
}

/**
 * Calculate leaderboard rankings and assign badges.
 * @param data - Array of users with tasks and time logs
 * @returns Leaderboard data
 */
function calculateLeaderboard(data: any[]) {
    return data
        .map((user) => {
            const totalHours = user.timeLogs.reduce((sum: number, log: any) => sum + log.hours, 0);
            const efficiency = totalHours > 0 ? user.tasks.length / totalHours : 0;

            // Assign badges based on efficiency
            let badge = '';
            if (efficiency > 5) {
                badge = 'Top Performer';
            } else if (efficiency > 2) {
                badge = 'Task Slayer';
            } else {
                badge = 'Rising Star';
            }

            return {
                userId: user.id,
                name: user.name,
                efficiency: efficiency.toFixed(2), // Round to 2 decimal places
                badge,
            };
        })
        .sort((a, b) => parseFloat(b.efficiency) - parseFloat(a.efficiency)); // Sort by efficiency in descending order
}