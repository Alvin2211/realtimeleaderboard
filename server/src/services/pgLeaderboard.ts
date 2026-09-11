import { prisma } from "../lib/prisma.js";

export interface LeaderboardRow {
  userId: string;
  username: string;
  totalScore: number;
}

export interface PlayerRankRow {
  userId: string;
  username: string;
  totalScore: number;
  rank: number;
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

export async function getPlayerRankFromPostgres(
  userId: string
): Promise<PlayerRankRow | null> {
  const players = await prisma.$queryRaw<PlayerRankRow[]>`
    SELECT
      "userId",
      username,
      "totalScore",
      RANK() OVER (
        ORDER BY "totalScore" DESC, "userId" DESC
      )::int AS rank
    FROM (
      SELECT
        u.id AS "userId",
        u.username,
        COALESCE(SUM(s.score), 0)::int AS "totalScore"
      FROM "User" u
      LEFT JOIN "Score" s
        ON u.id = s."userId"
      GROUP BY u.id, u.username
    ) leaderboard
    WHERE "userId" = ${userId};
  `;

  return players[0] ?? null;
}