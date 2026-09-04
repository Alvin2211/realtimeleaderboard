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

export async function getGlobalLeaderboard(req: Request, res: Response) {
  try {
    const leaderboard = await getLeaderboardData();

    return res.status(200).json({
      leaderboard,
    });
  } catch (error) {
    console.error("Leaderboard error:", error);

    return res.status(500).json({
      message: "Failed to fetch leaderboard",
    });
  }
}

export async function getUserRank(userId: string) {
  const leaderboard = await getLeaderboardData();

  return leaderboard.find((user) => user.userId === userId);
}

export async function getUserLeaderboardRank(
  req: Request,
  res: Response
) {
  try {
    const  {userId}  = req.params;

    const user = await getUserRank(userId as string);

    if (!user) {
      return res.status(404).json({
        message: "User not found on leaderboard",
      });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("User rank error:", error);

    return res.status(500).json({
      message: "Failed to fetch user rank",
    });
  }
}