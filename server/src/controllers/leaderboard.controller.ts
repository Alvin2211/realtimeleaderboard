import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

import {
  getTopPlayers as getRedisTopPlayers,
  getPlayerRank as getRedisPlayerRank,
  getPlayerScore as getRedisPlayerScore,
} from "../services/redisLeaderboard.js";

export async function getTopPlayers(
  req: Request,
  res: Response
) {
  try {
    const redisPlayers = await getRedisTopPlayers(10);

    const userIds = redisPlayers.map(
      (player) => player.value
    );

    const users = await prisma.user.findMany({
      where: {
        id: {
          in: userIds,
        },
      },
      select: {
        id: true,
        username: true,
      },
    });

    const userMap = new Map(
      users.map((user) => [user.id, user.username])
    );

    const leaderboard = redisPlayers.map(
      (player, index) => ({
        rank: index + 1,
        userId: player.value,
        username: userMap.get(player.value),
        totalScore: player.score,
      })
    );

    return res.status(200).json({
      leaderboard,
    });
  } catch (error) {
    console.error("Top players error:", error);

    return res.status(500).json({
      message: "Failed to fetch top players",
    });
  }
}

export async function getPlayerRank(
  req: Request,
  res: Response
) {
  try {
    const { userId } = req.params;

    const rank = await getRedisPlayerRank(userId as string);

    if (rank === null) {
      return res.status(404).json({
        message: "User not found on leaderboard",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        username: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const totalScore = await getRedisPlayerScore(userId as string);

    return res.status(200).json({
      userId: user.id,
      username: user.username,
      totalScore: totalScore ?? 0,
      rank,
    });
  } catch (error) {
    console.error("Player rank error:", error);

    return res.status(500).json({
      message: "Failed to fetch player rank",
    });
  }
}