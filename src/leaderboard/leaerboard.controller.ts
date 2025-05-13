import { api } from 'encore.dev/api';
import { fetchLeaderboard } from './leaderboard.service';

/**
 * Leaderboard API
 * Ranks users by task efficiency and assigns badges.
 */
export const getLeaderboard = api(
    {
        method: 'GET',
        path: '/leaderboard',
    },
    async () => {
        try {
            const leaderboard = await fetchLeaderboard();

            return {
                success: true,
                leaderboard,
            };
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
            throw new Error('Failed to fetch leaderboard');
        }
    }
);

