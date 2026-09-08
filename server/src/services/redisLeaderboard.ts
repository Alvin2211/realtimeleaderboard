import { redis } from "../lib/redis.js";

const LEADERBOARD_KEY = "leaderboard:global";

export async function addPlayerToLeaderboard(
  userId: string,
  totalScore: number
) {
  await redis.zAdd(LEADERBOARD_KEY, {
    score: totalScore,
    value: userId,
  });
}

export async function getTopPlayers(limit: number = 10) {
  return await redis.zRangeWithScores(
    LEADERBOARD_KEY,
    0,
    limit - 1,
    {
      REV: true,
    }
  );
}

export async function getPlayerRank(userId: string) {
  const rank = await redis.zRevRank(
    LEADERBOARD_KEY,
    userId
  );

  if (rank === null) {
    return null;
  }

  return rank + 1;
}

export async function getPlayerScore(userId: string) {
  return await redis.zScore(
    LEADERBOARD_KEY,
    userId
  );
}

export async function removePlayerFromLeaderboard(
  userId: string
) {
  await redis.zRem(LEADERBOARD_KEY, userId);
}