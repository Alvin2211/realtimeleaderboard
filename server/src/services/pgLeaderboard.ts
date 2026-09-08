import { prisma } from "../lib/prisma.js";

export interface LeaderboardRow {
  userId: string;
  username: string;
  totalScore: number;
}

export async function getTopPlayersFromPostgres(
  limit: number = 10
): Promise<LeaderboardRow[]> {
  const players = await prisma.$queryRaw<LeaderboardRow[]>`
    SELECT
      u.id AS "userId",
      u.username,
      COALESCE(SUM(s.score), 0)::int AS "totalScore"
    FROM "User" u
    LEFT JOIN "Score" s
      ON u.id = s."userId"
    GROUP BY u.id, u.username
    ORDER BY "totalScore" DESC
    LIMIT ${limit};
  `;

  return players;
}