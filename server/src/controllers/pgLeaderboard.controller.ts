import { Request, Response } from "express";
import {
  getTopPlayersFromPostgres,
  getPlayerRankFromPostgres,
} from "../services/pgLeaderboard.js";

export async function getTopPlayersPostgres(
  req: Request,
  res: Response
) {
  try {
    const leaderboard = await getTopPlayersFromPostgres(10);

    const formattedLeaderboard = leaderboard.map((player, index) => ({
      rank: index + 1,
      ...player,
    }));

    return res.status(200).json({
      leaderboard: formattedLeaderboard,
    });
  } catch (error) {
    console.error("PostgreSQL leaderboard error:", error);

    return res.status(500).json({
      message: "Failed to fetch leaderboard",
    });
  }
}

export async function getPlayerRankPostgres(
  req: Request,
  res: Response
) {
  try {
    const { userId } = req.params;

    const player = await getPlayerRankFromPostgres(userId as string);

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
    console.error("PostgreSQL player rank error:", error);

    return res.status(500).json({
      message: "Failed to fetch player rank",
    });
  }
}