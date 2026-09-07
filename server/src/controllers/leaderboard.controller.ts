import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

export async function getLeaderboardData() {
  const users = await prisma.user.findMany({
    include: {
      scores: true,
    },
  });

  const leaderboard = users.map((user) => {
    const totalScore = user.scores.reduce(
      (total, score) => total + score.score,
      0
    );

    return {
      userId: user.id,
      username: user.username,
      totalScore,
    };
  });

  leaderboard.sort((a, b) => b.totalScore - a.totalScore);

  return leaderboard.map((user, index) => ({
    rank: index + 1,
    ...user,
  }));
}

export async function getTopPlayers(req: Request, res: Response) {
  try {
    const leaderboard = await getLeaderboardData();

    const topPlayers = leaderboard.slice(0, 10);

    return res.status(200).json({
      leaderboard: topPlayers,
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

    const leaderboard = await getLeaderboardData();

    const player = leaderboard.find(
      (user) => user.userId === userId
    );

    if (!player) {
      return res.status(404).json({
        message: "User not found on leaderboard",
      });
    }

    return res.status(200).json({
      userId: player.userId,
      username: player.username,
      totalScore: player.totalScore,
      rank: player.rank,
    });
  } catch (error) {
    console.error("Player rank error:", error);

    return res.status(500).json({
      message: "Failed to fetch player rank",
    });
  }
}